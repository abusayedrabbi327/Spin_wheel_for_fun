import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import connectDB from "../_lib/mongodb.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { applyCors, error, methodNotAllowed, serverError, success, unauthorized } from "../_lib/utils.js";
import FriendChallenge from "../_models/FriendChallenge.js";
import User from "../_models/User.js";
import { checkRateLimit } from "../_lib/security.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    await connectDB();

    if (req.method === "GET") {
      const challenges = await FriendChallenge.find({
        $or: [{ creatorUserId: user.userId }, { opponentUserId: user.userId }],
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      const participantIds = Array.from(
        new Set(
          challenges.flatMap((challenge) => [String(challenge.creatorUserId), String(challenge.opponentUserId)])
        )
      ).map((id) => new mongoose.Types.ObjectId(id));

      const participants = await User.find({ _id: { $in: participantIds } }).select("name email").lean();
      const participantMap = new Map(participants.map((p: any) => [String(p._id), p]));

      return success(
        res,
        challenges.map((challenge) => ({
          id: challenge._id.toString(),
          title: challenge.title,
          description: challenge.description || null,
          status: challenge.status,
          creator: {
            id: String(challenge.creatorUserId),
            name: participantMap.get(String(challenge.creatorUserId))?.name || "Player",
            email: participantMap.get(String(challenge.creatorUserId))?.email || null,
            score: challenge.creatorScore,
          },
          opponent: {
            id: String(challenge.opponentUserId),
            name: participantMap.get(String(challenge.opponentUserId))?.name || "Player",
            email: participantMap.get(String(challenge.opponentUserId))?.email || null,
            score: challenge.opponentScore,
          },
          winnerUserId: challenge.winnerUserId ? String(challenge.winnerUserId) : null,
          expiresAt: challenge.expiresAt,
          acceptedAt: challenge.acceptedAt || null,
          completedAt: challenge.completedAt || null,
          createdAt: challenge.createdAt,
        }))
      );
    }

    if (req.method === "POST") {
      const rate = await checkRateLimit({ req, routeKey: "challenge:create", maxRequests: 12, windowSeconds: 60 });
      if (!rate.allowed) {
        return res.status(429).json({ success: false, error: "Too many challenge requests", retryAfter: rate.retryAfter });
      }

      const { opponentEmail, title, description, expiresInDays } = req.body || {};
      if (!opponentEmail || !title) return error(res, "opponentEmail and title are required");

      const opponent = await User.findOne({ email: String(opponentEmail).toLowerCase().trim() });
      if (!opponent) return error(res, "Opponent not found", 404);
      if (String(opponent._id) === user.userId) return error(res, "You cannot challenge yourself");

      const challenge = await FriendChallenge.create({
        title: String(title).trim(),
        description: description ? String(description).trim() : undefined,
        creatorUserId: new mongoose.Types.ObjectId(user.userId),
        opponentUserId: opponent._id,
        status: "PENDING",
        creatorScore: 0,
        opponentScore: 0,
        expiresAt: new Date(Date.now() + Math.max(1, Number(expiresInDays) || 7) * 24 * 60 * 60 * 1000),
      });

      return success(
        res,
        {
          id: challenge._id.toString(),
          title: challenge.title,
          status: challenge.status,
          creatorUserId: String(challenge.creatorUserId),
          opponentUserId: String(challenge.opponentUserId),
          expiresAt: challenge.expiresAt,
        },
        201
      );
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
