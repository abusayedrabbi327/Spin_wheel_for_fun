import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import Wheel from "../_models/Wheel.js";
import Spin from "../_models/Spin.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { success, error, notFound, methodNotAllowed, serverError, applyCors } from "../_lib/utils.js";
import mongoose from "mongoose";
import { addXp, incrementUserMetric, awardMilestoneStickers, evaluateActiveEventProgress, XP_REWARDS } from "../_lib/gamification.js";
import { checkAbuseBlock, checkRateLimit, recordAbuseSignal } from "../_lib/security.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();

    const blocked = await checkAbuseBlock(req, "spins");
    if (blocked.blocked) {
      return res.status(429).json({ success: false, error: blocked.reason, retryAfter: blocked.retryAfter });
    }

    // POST - Record a new spin
    if (req.method === "POST") {
      const rate = await checkRateLimit({ req, routeKey: "spins:post", maxRequests: 40, windowSeconds: 60 });
      if (!rate.allowed) {
        await recordAbuseSignal({ req, context: "spins", severity: 2, reason: "Spin burst limit exceeded" });
        return res.status(429).json({ success: false, error: "Too many spin requests", retryAfter: rate.retryAfter });
      }

      const { wheelId, result, spinnerName, spinnerEmail, participantName, participantPhone } = req.body;

      if (!wheelId) return error(res, "Wheel ID is required");
      if (!result) return error(res, "Spin result is required");
      if (!mongoose.Types.ObjectId.isValid(wheelId)) return notFound(res, "Wheel not found");

      const wheel = await Wheel.findById(wheelId);
      if (!wheel) return notFound(res, "Wheel not found");
      if (!wheel.isActive) return error(res, "This wheel is no longer active");
      if (wheel.expiryDate && new Date(wheel.expiryDate) < new Date())
        return error(res, "This wheel has expired");

      if (wheel.maxSpins) {
        const spinCount = await Spin.countDocuments({ wheelId: wheel._id });
        if (spinCount >= wheel.maxSpins)
          return error(res, "This wheel has reached its maximum number of spins");
      }

      const spin = await Spin.create({
        wheelId: wheel._id,
        result,
        participantName: participantName || spinnerName || "Anonymous",
        participantPhone: participantPhone || spinnerEmail || undefined,
      });

      const actor = getUserFromRequest(req);
      if (actor) {
        try {
          const progress = await addXp(actor.userId, XP_REWARDS.SPIN_PLAYED);
          await incrementUserMetric(actor.userId, "totalSpins", 1);
          await awardMilestoneStickers(actor.userId, progress.xp);
          await evaluateActiveEventProgress(actor.userId);
        } catch (progressErr) {
          console.error("Progress update failed after spin:", progressErr);
        }
      }

      return success(res, {
        ...spin.toObject(),
        id: spin._id.toString(),
        wheelId: spin.wheelId.toString(),
      }, 201);
    }

    // GET - Get spins for a wheel (owner only)
    if (req.method === "GET") {
      const user = getUserFromRequest(req);
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const { wheelId, limit, offset } = req.query;
      if (!wheelId) return error(res, "Wheel ID is required");

      const wheelIdStr = Array.isArray(wheelId) ? wheelId[0] : wheelId;
      if (!mongoose.Types.ObjectId.isValid(wheelIdStr)) return notFound(res, "Wheel not found");

      const wheel = await Wheel.findById(wheelIdStr);
      if (!wheel) return notFound(res, "Wheel not found");
      if (wheel.userId.toString() !== user.userId && user.role?.toUpperCase() !== "ADMIN") {
        return res.status(401).json({ error: "You don't own this wheel" });
      }

      const take = limit ? parseInt(Array.isArray(limit) ? limit[0] : limit) : 50;
      const skip = offset ? parseInt(Array.isArray(offset) ? offset[0] : offset) : 0;

      const [spins, total] = await Promise.all([
        Spin.find({ wheelId: wheelIdStr }).sort({ createdAt: -1 }).limit(take).skip(skip).lean(),
        Spin.countDocuments({ wheelId: wheelIdStr }),
      ]);

      return success(res, {
        spins: spins.map((s) => ({ ...s, id: s._id.toString(), wheelId: s.wheelId.toString() })),
        total,
        limit: take,
        offset: skip,
      });
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
