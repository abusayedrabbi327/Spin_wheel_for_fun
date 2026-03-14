import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import User from "../_models/User.js";
import Wheel from "../_models/Wheel.js";
import Spin from "../_models/Spin.js";
import { verifyPassword, generateToken, hashPassword, getUserFromRequest } from "../_lib/auth.js";
import { success, error, methodNotAllowed, serverError, applyCors } from "../_lib/utils.js";
import { checkAbuseBlock, checkRateLimit, recordAbuseSignal } from "../_lib/security.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();

  const actionParam = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;
  const path = (req.url || "").split("?")[0];
  const actionFromPath = path.split("/").filter(Boolean).at(-1);
  const action = String(actionParam || actionFromPath || "login").toLowerCase();

  try {
    await connectDB();

    if (action === "me") {
      if (req.method !== "GET") return methodNotAllowed(res);

      const tokenPayload = getUserFromRequest(req);
      if (!tokenPayload) return res.status(401).json({ success: false, error: "Unauthorized" });

      const user = await User.findById(tokenPayload.userId).select("-password");
      if (!user) return res.status(401).json({ success: false, error: "User not found" });

      const [wheelCount, spinCount] = await Promise.all([
        Wheel.countDocuments({ userId: user._id }),
        Spin.countDocuments({ userId: user._id }),
      ]);

      return success(res, {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        _count: { wheels: wheelCount, spins: spinCount },
      });
    }

    const blocked = await checkAbuseBlock(req, "auth");
    if (blocked.blocked) {
      return res.status(429).json({ success: false, error: blocked.reason, retryAfter: blocked.retryAfter });
    }

    if (action === "register") {
      if (req.method !== "POST") return methodNotAllowed(res);

      const rate = await checkRateLimit({ req, routeKey: "auth:register", maxRequests: 10, windowSeconds: 60 });
      if (!rate.allowed) {
        return res.status(429).json({ success: false, error: "Too many registration attempts", retryAfter: rate.retryAfter });
      }

      const { email, password, name } = req.body;
      const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
      const passwordValue = typeof password === "string" ? password : "";
      const safeName = typeof name === "string" ? name.trim() : "";

      if (!normalizedEmail || !passwordValue) return error(res, "Email and password are required");
      if (passwordValue.length < 8) return error(res, "Password must be at least 8 characters");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) return error(res, "Please provide a valid email");

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        await recordAbuseSignal({ req, context: "auth", severity: 1, reason: "Duplicate registration attempt" });
        return error(res, "Email already registered", 409);
      }

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
    }

    if (action !== "login") {
      return error(res, "Unknown auth action", 404);
    }

    if (req.method !== "POST") return methodNotAllowed(res);

    const rate = await checkRateLimit({ req, routeKey: "auth:login", maxRequests: 20, windowSeconds: 60 });
    if (!rate.allowed) {
      return res.status(429).json({ success: false, error: "Too many login attempts", retryAfter: rate.retryAfter });
    }

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
