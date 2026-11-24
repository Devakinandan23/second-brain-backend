import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test_secret';

const mockExtractMetadata = jest.fn<(...args: any[]) => Promise<any>>();
jest.unstable_mockModule('../../../services/ingestion/extractMetadata.js', () => ({
    extractMetadata: mockExtractMetadata,
}));

const { noteRoutes } = await import('../note.routes.js');
const { brainRoutes } = await import('../brain.routes.js');
const { prisma } = await import('../../../lib/prisma.js');

const app = express();
app.use(express.json());
app.use('/v1/content', noteRoutes);
app.use('/v1/brain', brainRoutes);

const getAuthToken = (userId: number) => jwt.sign({ userId }, process.env.JWT_SECRET!);
const noteId = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
const auth = (userId = 1) => `Bearer ${getAuthToken(userId)}`;

describe('Note Routes', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        mockExtractMetadata.mockReset();
    });

    describe('GET /brain/:shareLink', () => {
        it('returns 400 when the share link is not found', async () => {
            jest.spyOn(prisma.shareLink, 'findUnique').mockResolvedValue(null);
            const response = await request(app).get('/v1/brain/invalid-link');
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'ShareLink not Found' });
        });

        it('returns only public notes for a valid share link', async () => {
            const notes = [{ title: 'Public Note', link: 'https://example.test', content: 'content', description: 'desc', thumbnail: null }];
            const spy = jest.spyOn(prisma.shareLink, 'findUnique').mockResolvedValue({ user: { id: 1, username: 'testuser', notes } } as any);
            const response = await request(app).get('/v1/brain/valid-link');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ username: 'testuser', content: notes });
            expect(spy).toHaveBeenCalledWith(expect.objectContaining({
                where: { hash: 'valid-link', isActive: true },
            }));
        });
    });

    describe('GET /content', () => {
        it('requires authentication', async () => {
            expect((await request(app).get('/v1/content')).status).toBe(401);
        });

        it('returns only the user’s non-trashed notes', async () => {
            const notes = [{ id: noteId, title: 'Test Note', tags: [] }];
            const spy = jest.spyOn(prisma.note, 'findMany').mockResolvedValue(notes as any);
            const response = await request(app).get('/v1/content').set('Authorization', auth());
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ content: notes });
            expect(spy).toHaveBeenCalledWith({ where: { userId: 1, trashedAt: null }, include: { tags: true } });
        });
    });

    describe('POST /content', () => {
        const validPayload = { link: 'https://example.test/page', title: 'Submitted title', tags: ['Website', 'Example'], content: null, authorName: null };

        it('rejects invalid input and more than ten tags', async () => {
            const invalid = await request(app).post('/v1/content').set('Authorization', auth()).send({ ...validPayload, link: 'invalid' });
            expect(invalid.status).toBe(403);
            expect(invalid.body).toEqual({ message: 'validation error' });
            const tooMany = await request(app).post('/v1/content').set('Authorization', auth()).send({ ...validPayload, tags: Array.from({ length: 11 }, (_, i) => `tag${i}`) });
            expect(tooMany.status).toBe(403);
        });

        it('returns 400 when metadata extraction fails', async () => {
            mockExtractMetadata.mockResolvedValue(null);
            const response = await request(app).post('/v1/content').set('Authorization', auth()).send(validPayload);
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('error while extracting');
        });

        it('creates a note using extracted metadata and user-scoped normalized tags', async () => {
            mockExtractMetadata.mockResolvedValue({ sourceType: 'WEBSITE', title: null, description: 'Extracted summary', thumbnail: null, metadata: { site: 'example' } });
            const created = { id: noteId };
            const spy = jest.spyOn(prisma.note, 'create').mockResolvedValue(created as any);
            const response = await request(app).post('/v1/content').send(validPayload).set('Authorization', auth());
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'content successfully added', content: created });
            expect(mockExtractMetadata).toHaveBeenCalledWith(validPayload.link);
            const data = spy.mock.calls[0]![0].data;
            expect(data).toMatchObject({ userId: 1, title: 'Submitted title', extractedTitle: null, sourceType: 'WEBSITE', description: 'Extracted summary', metadata: { site: 'example' } });
            expect(data.tags?.connectOrCreate).toEqual([
                { where: { userId_title: { userId: 1, title: 'website' } }, create: { title: 'website', userId: 1 } },
                { where: { userId_title: { userId: 1, title: 'example' } }, create: { title: 'example', userId: 1 } },
            ]);
        });

        it('uses extracted title when available and supports empty tags and supplied content', async () => {
            mockExtractMetadata.mockResolvedValue({ sourceType: 'YOUTUBE', title: 'Extracted title', description: null, thumbnail: 'https://example.test/thumb.jpg', metadata: { url: 'https://youtube.com/watch?v=x' } });
            const spy = jest.spyOn(prisma.note, 'create').mockResolvedValue({ id: noteId } as any);
            const response = await request(app).post('/v1/content').send({ ...validPayload, tags: [], content: 'User body', description: 'Ignored custom summary', authorName: 'Author' }).set('Authorization', auth());
            expect(response.status).toBe(200);
            const data = spy.mock.calls[0]![0].data;
            expect(data).toMatchObject({ title: 'Extracted title', extractedTitle: 'Extracted title', content: 'User body', description: null, authorName: 'Author' });
            expect(data.tags?.connectOrCreate).toEqual([]);
        });
    });

    describe('PATCH /content/:id', () => {
        it('rejects an invalid UUID and invalid update payload', async () => {
            const invalidId = await request(app).patch('/v1/content/nope').set('Authorization', auth()).send({ title: 'New title' });
            expect(invalidId.status).toBe(400);
            expect(invalidId.body.message).toContain('Invalid noteId format');
            const invalidPayload = await request(app).patch(`/v1/content/${noteId}`).set('Authorization', auth()).send({ title: 'a'.repeat(1001) });
            expect(invalidPayload.status).toBe(403);
        });

        it('returns 404 when the note is not owned by the caller', async () => {
            const spy = jest.spyOn(prisma.note, 'findFirst').mockResolvedValue(null);
            const response = await request(app).patch(`/v1/content/${noteId}`).set('Authorization', auth(2)).send({ title: 'Hacked' });
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Content not found or unauthorized' });
            expect(spy).toHaveBeenCalledWith({ where: { id: noteId, userId: 2 } });
        });

        it('updates fields and replaces tags with user-scoped normalized tags for the owner', async () => {
            jest.spyOn(prisma.note, 'findFirst').mockResolvedValue({ id: noteId, userId: 1 } as any);
            const updateSpy = jest.spyOn(prisma.note, 'update').mockResolvedValue({} as any);
            const response = await request(app).patch(`/v1/content/${noteId}`).set('Authorization', auth()).send({ title: 'Updated', content: 'Updated body', tags: ['New-Tag'] });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'content successfully updated' });
            expect(updateSpy).toHaveBeenCalledWith({ where: { id: noteId }, data: expect.objectContaining({
                title: 'Updated', content: 'Updated body',
                tags: { set: [], connectOrCreate: [{ where: { userId_title: { userId: 1, title: 'new-tag' } }, create: { title: 'new-tag', userId: 1 } }] },
            }) });
        });
    });

    describe('POST /brain/share', () => {
        it('rejects invalid input', async () => {
            const response = await request(app).post('/v1/brain/share').set('Authorization', auth()).send({ share: 'not a boolean' });
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'error in input' });
        });

        it('creates, reactivates, and disables a share link', async () => {
            const lookup = jest.spyOn(prisma.shareLink, 'findUnique');
            const create = jest.spyOn(prisma.shareLink, 'create').mockResolvedValue({ isActive: true, hash: 'new-hash' } as any);
            lookup.mockResolvedValueOnce(null);
            const created = await request(app).post('/v1/brain/share').set('Authorization', auth()).send({ share: true });
            expect(created.status).toBe(200);
            expect(created.body).toMatchObject({ isActive: true });
            expect(created.body.link).toMatch(/^[0-9a-f-]{36}$/i);
            expect(create).toHaveBeenCalledWith({ data: { hash: created.body.link, isActive: true, userId: 1 } });

            const update = jest.spyOn(prisma.shareLink, 'update').mockResolvedValue({} as any);
            lookup.mockResolvedValueOnce({ isActive: false, hash: 'existing-hash' } as any);
            const active = await request(app).post('/v1/brain/share').set('Authorization', auth()).send({ share: true });
            expect(active.body).toEqual({ isActive: true, link: 'existing-hash' });
            lookup.mockResolvedValueOnce({ isActive: true, hash: 'existing-hash' } as any);
            const disabled = await request(app).post('/v1/brain/share').set('Authorization', auth()).send({ share: false });
            expect(disabled.body).toEqual({ isActive: false, link: null });
            expect(update).toHaveBeenNthCalledWith(1, { where: { userId: 1 }, data: { isActive: true } });
            expect(update).toHaveBeenNthCalledWith(2, { where: { userId: 1 }, data: { isActive: false } });
        });
    });

    describe('DELETE /content/:id', () => {
        it('soft deletes the caller’s note by setting trashedAt', async () => {
            const spy = jest.spyOn(prisma.note, 'update').mockResolvedValue({ id: noteId } as any);
            const response = await request(app).delete(`/v1/content/${noteId}`).set('Authorization', auth());
            expect(response.status).toBe(204);
            expect(spy).toHaveBeenCalledWith({ where: { id: noteId, userId: 1 }, data: { trashedAt: expect.any(Date) } });
        });

        it('returns 500 when Prisma rejects the soft delete', async () => {
            jest.spyOn(prisma.note, 'update').mockRejectedValue(new Error('Record does not exist'));
            const response = await request(app).delete(`/v1/content/${noteId}`).set('Authorization', auth());
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Internal Error' });
        });
    });
});
