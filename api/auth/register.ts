import type { VercelRequest, VercelResponse } from "@vercel/node";
import prisma from "../_lib/prisma";
import { hashPassword, generateToken } from "../_lib/auth";
import { success, error, methodNotAllowed, serverError } from "../_lib/utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return methodNotAllowed(res);
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return error(res, "Email, password, and name are required");
    }

    if (password.length < 6) {
      return error(res, "Password must be at least 6 characters");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return error(res, "Email already registered", 409);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: "USER",
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return success(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, 201);
  } catch (err) {
    return serverError(res, err);
  }
}
