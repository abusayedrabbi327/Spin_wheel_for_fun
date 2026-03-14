import type { VercelRequest } from "@vercel/node";
import RateLimitBucket from "../_models/RateLimitBucket.js";
import AbuseProfile from "../_models/AbuseProfile.js";

export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string") return realIp.trim();

  return "unknown";
}

export async function checkRateLimit(params: {
  req: VercelRequest;
  routeKey: string;
  maxRequests: number;
  windowSeconds: number;
}) {
  const ip = getClientIp(params.req);
  const bucketKey = `${params.routeKey}:${ip}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + params.windowSeconds * 1000);

  const bucket = await RateLimitBucket.findOne({ key: bucketKey });

  if (!bucket || bucket.expiresAt <= now) {
    await RateLimitBucket.findOneAndUpdate(
      { key: bucketKey },
      { $set: { count: 1, expiresAt } },
      { upsert: true, new: true }
    );
    return { allowed: true, remaining: params.maxRequests - 1 };
  }

  if (bucket.count >= params.maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((bucket.expiresAt.getTime() - now.getTime()) / 1000));
    return { allowed: false, remaining: 0, retryAfter };
  }

  bucket.count += 1;
  await bucket.save();

  return { allowed: true, remaining: Math.max(0, params.maxRequests - bucket.count) };
}

export async function checkAbuseBlock(req: VercelRequest, context: string) {
  const ip = getClientIp(req);
  const key = `${context}:${ip}`;
  const profile = await AbuseProfile.findOne({ key });

  if (!profile || !profile.blockedUntil) {
    return { blocked: false };
  }

  if (profile.blockedUntil.getTime() <= Date.now()) {
    profile.blockedUntil = undefined;
    profile.reason = undefined;
    profile.score = Math.max(0, profile.score - 2);
    await profile.save();
    return { blocked: false };
  }

  return {
    blocked: true,
    retryAfter: Math.max(1, Math.ceil((profile.blockedUntil.getTime() - Date.now()) / 1000)),
    reason: profile.reason || "Temporarily blocked due to suspicious activity",
  };
}

export async function recordAbuseSignal(params: {
  req: VercelRequest;
  context: string;
  severity?: number;
  reason: string;
}) {
  const severity = Math.max(1, params.severity ?? 1);
  const ip = getClientIp(params.req);
  const key = `${params.context}:${ip}`;

  const profile = await AbuseProfile.findOneAndUpdate(
    { key },
    {
      $setOnInsert: { key, score: 0, lastSeenAt: new Date() },
      $set: { lastSeenAt: new Date(), reason: params.reason },
      $inc: { score: severity },
    },
    { upsert: true, new: true }
  );

  if (profile.score >= 8) {
    profile.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  } else if (profile.score >= 5) {
    profile.blockedUntil = new Date(Date.now() + 5 * 60 * 1000);
  }

  await profile.save();

  return profile;
}
