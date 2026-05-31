import { jest } from '@jest/globals';
import request from 'supertest';
import express, { type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test_secret';

import { noteRoutes } from '../note.routes.js';
import { prisma } from '../../../lib/prisma.js';

const app = express();
app.use(express.json());
// Mount the routes
app.use('/v1/note', noteRoutes);

const getAuthToken = (userId: number) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET!);
};

describe('Note Routes', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    describe('GET /brain/:shareLink', () => {
        it('should return 400 if shareLink is not found', async () => {
            jest.spyOn(prisma.shareLink, 'findUnique').mockResolvedValue(null);

            const response = await request(app).get('/v1/note/brain/invalid-link');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'ShareLink not Found' });
        });

        it('should return user notes if shareLink is valid', async () => {
            const mockShareLinkData = {
                user: {
                    id: 1,
                    username: 'testuser',
                    notes: [
                        { title: 'Public Note', link: 'http://example.com', content: 'content', description: 'desc', thumbnail: null }
                    ]
                }
            };
            jest.spyOn(prisma.shareLink, 'findUnique').mockResolvedValue(mockShareLinkData as any);

            const response = await request(app).get('/v1/note/brain/valid-link');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                username: 'testuser',
                content: mockShareLinkData.user.notes
            });
        });
    });

    describe('GET /content', () => {
        it('should return 401 if unauthorized', async () => {
            const response = await request(app)
                .get('/v1/note/content');
                
            expect(response.status).toBe(401);
        });

        it('should return notes for authorized user', async () => {
            const mockNotes = [{ id: '1', title: 'Test Note', tags: [] }];
            const spy = jest.spyOn(prisma.note, 'findMany').mockResolvedValue(mockNotes as any);

            const response = await request(app)
                .get('/v1/note/content')
                .set('Authorization', `Bearer ${getAuthToken(1)}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ content: mockNotes });
            expect(spy).toHaveBeenCalledWith({
                where: { userId: 1 },
                include: { tags: true }
            });
        });
    });

    describe('POST /content', () => {
        it('should return 403 on validation error', async () => {
            const response = await request(app)
                .post('/v1/note/content')
                .set('Authorization', `Bearer ${getAuthToken(1)}`)
                .send({
                    sourceType: 'INVALID_TYPE', // Invalid sourceType
                    title: 'Test'
                });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: 'validation error' });
        });

        it('should create content when data is valid', async () => {
            const spy = jest.spyOn(prisma.note, 'create').mockResolvedValue({ id: '1' } as any);

            const validPayload = {
                sourceType: 'YOUTUBE',
                link: 'https://youtube.com',
                title: 'My Video',
                tags: ['video', 'tech'],
                content: null,
                description: null,
                thumbnail: null,
                authorName: null
            };

            const response = await request(app)
                .post('/v1/note/content')
                .send(validPayload)
                .set('Authorization', `Bearer ${getAuthToken(1)}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'content successfully added' });
            
            // Verify Prisma call
            expect(spy).toHaveBeenCalled();
            const createCallArg = spy.mock.calls[0]![0];
            expect(createCallArg.data.userId).toBe(1);
            expect(createCallArg.data.title).toBe(validPayload.title);
            expect((createCallArg.data.tags as any).connectOrCreate).toHaveLength(2);
        });
    });

    describe('PATCH /content/:id', () => {
        it('should return 400 for invalid UUID', async () => {
            const response = await request(app)
                .patch('/v1/note/content/invalid-uuid')
                .set('Authorization', `Bearer ${getAuthToken(1)}`)
                .send({ title: 'New Title', sourceType: 'YOUTUBE' });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Invalid noteId format');
        });

        it('should return 404/unauthorized when note does not belong to user (Ownership Check)', async () => {
            const spy = jest.spyOn(prisma.note, 'updateMany').mockResolvedValue({ count: 0 } as any);

            const response = await request(app)
                .patch('/v1/note/content/d290f1ee-6c54-4b01-90e6-d701748f0851')
                .send({ title: 'Hacked Title', sourceType: 'YOUTUBE' })
                .set('Authorization', `Bearer ${getAuthToken(2)}`); // Different user

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Content not found or unauthorized' });
            expect(spy).toHaveBeenCalledWith({
                where: {
                    id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
                    userId: 2 // Verifying ownership check
                },
                data: expect.any(Object)
            });
        });

        it('should update note successfully for owner', async () => {
            jest.spyOn(prisma.note, 'updateMany').mockResolvedValue({ count: 1 } as any);

            const response = await request(app)
                .patch('/v1/note/content/d290f1ee-6c54-4b01-90e6-d701748f0851')
                .send({ title: 'Updated Title', sourceType: 'YOUTUBE' })
                .set('Authorization', `Bearer ${getAuthToken(1)}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'content successfully updated' });
        });
    });

    describe('POST /brain/share', () => {
        it('should return 400 for invalid input', async () => {
            const response = await request(app)
                .post('/v1/note/brain/share')
                .set('Authorization', `Bearer ${getAuthToken(1)}`)
                .send({ share: 'not a boolean' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'error in input' });
        });

        it('should create new share link if none exists and share is true', async () => {
            jest.spyOn(prisma.shareLink, 'findUnique').mockResolvedValue(null);
            const createSpy = jest.spyOn(prisma.shareLink, 'create').mockResolvedValue({ isActive: true, hash: 'new-hash-123' } as any);

            const response = await request(app)
                .post('/v1/note/brain/share')
                .send({ share: true })
                .set('Authorization', `Bearer ${getAuthToken(1)}`);

            expect(response.status).toBe(200);
            expect(response.body.isActive).toBe(true);
            expect(response.body.link).toBeDefined(); // UUID generated dynamically
            expect(createSpy).toHaveBeenCalled();
        });

        it('should update existing share link to active if share is true', async () => {
            jest.spyOn(prisma.shareLink, 'findUnique').mockResolvedValue({ isActive: false, hash: 'existing-hash' } as any);
            const updateSpy = jest.spyOn(prisma.shareLink, 'update').mockResolvedValue({} as any);
            
            const response = await request(app)
                .post('/v1/note/brain/share')
                .send({ share: true })
                .set('Authorization', `Bearer ${getAuthToken(1)}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ isActive: true, link: 'existing-hash' });
            expect(updateSpy).toHaveBeenCalledWith({
                where: { userId: 1 },
                data: { isActive: true }
            });
        });

        it('should disable share link if share is false', async () => {
            jest.spyOn(prisma.shareLink, 'findUnique').mockResolvedValue({ isActive: true, hash: 'existing-hash' } as any);
            const updateSpy = jest.spyOn(prisma.shareLink, 'update').mockResolvedValue({} as any);
            
            const response = await request(app)
                .post('/v1/note/brain/share')
                .send({ share: false })
                .set('Authorization', `Bearer ${getAuthToken(1)}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ isActive: false, link: null });
            expect(updateSpy).toHaveBeenCalledWith({
                where: { userId: 1 },
                data: { isActive: false }
            });
        });
    });

    describe('DELETE /content', () => {
        it('should return 403 if contentId is missing', async () => {
            const response = await request(app)
                .delete('/v1/note/content')
                .set('Authorization', `Bearer ${getAuthToken(1)}`)
                .send({}); // No contentId

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: 'ID Incorrect' });
        });

        it('should delete note checking ownership', async () => {
            const spy = jest.spyOn(prisma.note, 'delete').mockResolvedValue({ id: '1' } as any);

            const response = await request(app)
                .delete('/v1/note/content')
                .send({ contentId: 'note-id-123' })
                .set('Authorization', `Bearer ${getAuthToken(1)}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'successfully deleted' });
            
            // Verify ownership check in where clause
            expect(spy).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                    id: 'note-id-123'
                },
                include: {
                    tags: true
                }
            });
        });
    });
});
