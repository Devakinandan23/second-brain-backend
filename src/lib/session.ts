import type { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "sb_session";
export const SESSION_MAX_AGE_MS = 4 * 60 * 60 * 1000;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export function createSessionToken(userId: number) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "4h" });
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as { userId: number };
}

export function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: SESSION_MAX_AGE_MS,
    path: "/",
  };
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
}

export function clearSessionCookie(res: Response) {
  const { maxAge: _maxAge, ...options } = sessionCookieOptions();
  res.clearCookie(SESSION_COOKIE, options);
}
