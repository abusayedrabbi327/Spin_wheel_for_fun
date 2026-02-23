import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { VercelRequest } from "@vercel/node";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

export function getUserFromRequest(req: VercelRequest): TokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function isAdmin(req: VercelRequest): boolean {
  const user = getUserFromRequest(req);
  return user?.role === "ADMIN";
}
