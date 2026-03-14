import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import User from "../_models/User.js";
import { verifyPassword, generateToken } from "../_lib/auth.js";
import { success, error, methodNotAllowed, serverError, applyCors } from "../_lib/utils.js";
import { checkAbuseBlock, checkRateLimit, recordAbuseSignal } from "../_lib/security.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const blocked = await checkAbuseBlock(req, "auth");
    if (blocked.blocked) {
      return res.status(429).json({ success: false, error: blocked.reason, retryAfter: blocked.retryAfter });
    }

    const rate = await checkRateLimit({ req, routeKey: "auth:login", maxRequests: 20, windowSeconds: 60 });
    if (!rate.allowed) {
      return res.status(429).json({ success: false, error: "Too many login attempts", retryAfter: rate.retryAfter });
    }

    await connectDB();

    const { email, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const passwordValue = typeof password === "string" ? password : "";

    if (!normalizedEmail || !passwordValue) return error(res, "Email and password are required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) return error(res, "Please provide a valid email");

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      await recordAbuseSignal({ req, context: "auth", severity: 1, reason: "Invalid login email" });
      return error(res, "Invalid email or password", 401);
    }

    const isValidPassword = await verifyPassword(passwordValue, user.password);
    if (!isValidPassword) {
      await recordAbuseSignal({ req, context: "auth", severity: 1, reason: "Invalid login password" });
      return error(res, "Invalid email or password", 401);
    }

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
