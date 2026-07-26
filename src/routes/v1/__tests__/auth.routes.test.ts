import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test_secret';

import { authRoutes } from '../auth.routes.js';
import { prisma } from '../../../lib/prisma.js';

const app = express();
app.use(express.json());
app.use('/v1/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    describe('POST /signup', () => {
        it('should return 411 on validation error (username too short)', async () => {
            const response = await request(app)
                .post('/v1/auth/signup')
                .send({ username: 'sh' }); // assuming Zod fails this

            expect(response.status).toBe(411);
            expect(response.body.message).toContain('Too small');
        });

        it('should return 403 if user already exists', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 1, username: 'testuser', password: 'hashedpassword' } as any);

            const response = await request(app)
                .post('/v1/auth/signup')
                .send({ username: 'testuser', password: 'Password123!' });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: 'User already exist with this username' });
        });

        it('should create user and return 200 on successful signup', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
            const createSpy = jest.spyOn(prisma.user, 'create').mockResolvedValue({ id: 1, username: 'newuser' } as any);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password' as never);

            const response = await request(app)
                .post('/v1/auth/signup')
                .send({ username: 'newuser', password: 'Password123!' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Signed Up' });
            expect(createSpy).toHaveBeenCalled();
        });
    });

    describe('POST /signin', () => {
        it('should return 403 on validation error', async () => {
            const response = await request(app)
                .post('/v1/auth/signin')
                .send({ username: 'sh' });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: 'Invalid username or password' });
        });

        it('should return 403 if username not found', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            const response = await request(app)
                .post('/v1/auth/signin')
                .send({ username: 'nonexisten', password: 'Password123!' });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: 'username not found' });
        });

        it('should return 403 on wrong password', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 1, username: 'testuser', password: 'hashed_password' } as any);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

            const response = await request(app)
                .post('/v1/auth/signin')
                .send({ username: 'testuser', password: 'Wrongpass1!' });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: 'Incorrect password', hint: null });
        });

        it('should return 200 and token on successful signin', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 1, username: 'testuser', password: 'hashed_password' } as any);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
            jest.spyOn(jwt, 'sign').mockReturnValue('mocked_token' as never);

            const response = await request(app)
                .post('/v1/auth/signin')
                .send({ username: 'testuser', password: 'Password123!' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ token: 'mocked_token', username: 'testuser' });
            expect(response.headers['set-cookie']?.[0]).toContain('sb_session=mocked_token');
            expect(response.headers['set-cookie']?.[0]).toContain('HttpOnly');
        });
    });
});
