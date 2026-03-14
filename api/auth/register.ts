import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import User from "../_models/User.js";
import { hashPassword, generateToken } from "../_lib/auth.js";
import { success, error, methodNotAllowed, serverError, applyCors } from "../_lib/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    await connectDB();

    const { email, password, name } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const passwordValue = typeof password === "string" ? password : "";
    const safeName = typeof name === "string" ? name.trim() : "";

    if (!normalizedEmail || !passwordValue) return error(res, "Email and password are required");
    if (passwordValue.length < 8) return error(res, "Password must be at least 8 characters");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) return error(res, "Please provide a valid email");

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return error(res, "Email already registered", 409);

    const hashedPassword = await hashPassword(passwordValue);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: safeName || normalizedEmail.split("@")[0],
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
