import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import User from "../models/User.js";
import { hashPassword, generateToken } from "../_lib/auth.js";
import { success, error, methodNotAllowed, serverError } from "../_lib/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    await connectDB();

    const { email, password, name } = req.body;

    if (!email || !password) return error(res, "Email and password are required");
    if (password.length < 6) return error(res, "Password must be at least 6 characters");

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return error(res, "Email already registered", 409);

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || email.split("@")[0],
      role: "USER",
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return success(res, {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, 201);
  } catch (err) {
    return serverError(res, err);
  }
}
