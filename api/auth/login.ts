import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import User from "../_models/User.js";
import { verifyPassword, generateToken } from "../_lib/auth.js";
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

    const { email, password } = req.body;

    if (!email || !password) return error(res, "Email and password are required");

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return error(res, "Invalid email or password", 401);

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) return error(res, "Invalid email or password", 401);

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
    });
  } catch (err) {
    return serverError(res, err);
  }
}
