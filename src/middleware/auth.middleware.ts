import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE, verifySessionToken } from "../lib/session.js";

declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith("Bearer ")
            ? authHeader.slice("Bearer ".length)
            : undefined;
        const token = req.cookies?.[SESSION_COOKIE] ?? bearerToken;

        if (!token) {
            res.status(401).json({
                message: "unauthorized"
            });
            return;
        }

        const decoded = verifySessionToken(token);

        req.userId = decoded.userId;
        
        next();
    } catch (error) {
        res.status(401).json({
            message: "invalid or expired token"
        });
        return;
    }
}
