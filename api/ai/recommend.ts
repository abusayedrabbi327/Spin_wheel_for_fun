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
    await connectDB();

    const rate = await checkRateLimit({ req, routeKey: "ai:recommend", maxRequests: 12, windowSeconds: 60 });
    if (!rate.allowed) {
      return res.status(429).json({ success: false, error: "Too many AI requests", retryAfter: rate.retryAfter });
    }

    const { mood, groupSize, occasion, durationMinutes, hasKids, prompt, area } = req.body || {};

    if ((!mood || typeof mood !== "string") && (!prompt || typeof prompt !== "string")) {
      return error(res, "Mood or prompt is required");
    }

    const safeGroupSize = Math.max(1, Math.min(50, Number(groupSize) || 2));
    const safeDuration = Math.max(5, Math.min(180, Number(durationMinutes) || 20));

    await ensureUserProgress(user.userId);

    const recommendation = await generateFamilySafeRecommendation({
      mood: typeof mood === "string" ? mood.slice(0, 60) : "custom",
      groupSize: safeGroupSize,
      occasion: typeof occasion === "string" ? occasion.slice(0, 50) : undefined,
      durationMinutes: safeDuration,
      hasKids: Boolean(hasKids),
      prompt: typeof prompt === "string" ? prompt.slice(0, 700) : undefined,
      area: typeof area === "string" ? area.slice(0, 80) : undefined,
    });

    return success(res, { recommendation });
  } catch (err) {
    return serverError(res, err);
  }
}
