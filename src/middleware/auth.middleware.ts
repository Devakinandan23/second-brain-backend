import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "unauthorized"
            });
            return;
        }

        const token = authHeader.split(" ")[1]!;

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        req.userId = decoded.userId;
        
        next();
    } catch (error) {
        res.status(401).json({
            message: "invalid or expired token"
        });
        return;
    }
}