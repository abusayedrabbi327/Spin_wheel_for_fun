import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { applyCors, unauthorized, error, success, methodNotAllowed, serverError } from "../_lib/utils.js";
import { ensureUserProgress } from "../_lib/gamification.js";
import { generateFamilySafeRecommendation } from "../_lib/longcat.js";
import { checkRateLimit } from "../_lib/security.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return methodNotAllowed(res);

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    const rate = await checkRateLimit({ req, routeKey: "ai:recommend", maxRequests: 12, windowSeconds: 60 });
    if (!rate.allowed) {
      return res.status(429).json({ success: false, error: "Too many AI requests", retryAfter: rate.retryAfter });
    }

    await connectDB();

    const { mood, groupSize, occasion, durationMinutes, hasKids } = req.body || {};

    if (!mood || typeof mood !== "string") {
      return error(res, "Mood is required");
    }

    const safeGroupSize = Math.max(1, Math.min(50, Number(groupSize) || 2));
    const safeDuration = Math.max(5, Math.min(180, Number(durationMinutes) || 20));

    await ensureUserProgress(user.userId);

    const recommendation = await generateFamilySafeRecommendation({
      mood: mood.slice(0, 60),
      groupSize: safeGroupSize,
      occasion: typeof occasion === "string" ? occasion.slice(0, 50) : undefined,
      durationMinutes: safeDuration,
      hasKids: Boolean(hasKids),
    });

    return success(res, { recommendation });
  } catch (err) {
    return serverError(res, err);
  }
}
