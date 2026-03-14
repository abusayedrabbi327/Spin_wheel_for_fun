import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import connectDB from "../_lib/mongodb.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { applyCors, error, methodNotAllowed, notFound, serverError, success, unauthorized } from "../_lib/utils.js";
import FriendChallenge from "../_models/FriendChallenge.js";
import User from "../_models/User.js";
import { checkRateLimit } from "../_lib/security.js";
import { addXp } from "../_lib/gamification.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  const { id } = req.query;
  const challengeId = Array.isArray(id) ? id[0] : id;

  try {
    await connectDB();

    if (challengeId) {
      if (!mongoose.Types.ObjectId.isValid(challengeId)) return notFound(res, "Challenge not found");
      if (req.method !== "PUT" && req.method !== "GET") return methodNotAllowed(res);

      const challenge = await FriendChallenge.findById(challengeId);
      if (!challenge) return notFound(res, "Challenge not found");

      const isParticipant = [String(challenge.creatorUserId), String(challenge.opponentUserId)].includes(user.userId);
      if (!isParticipant) return unauthorized(res, "You are not part of this challenge");

      if (
        challenge.expiresAt.getTime() <= Date.now() &&
        (challenge.status === "PENDING" || challenge.status === "ACCEPTED")
      ) {
        challenge.status = "EXPIRED";
        await challenge.save();
      }

      if (req.method === "GET") {
        return success(res, {
          id: challenge._id.toString(),
          title: challenge.title,
          description: challenge.description || null,
          status: challenge.status,
          creatorUserId: String(challenge.creatorUserId),
          opponentUserId: String(challenge.opponentUserId),
          creatorScore: challenge.creatorScore,
          opponentScore: challenge.opponentScore,
          winnerUserId: challenge.winnerUserId ? String(challenge.winnerUserId) : null,
          expiresAt: challenge.expiresAt,
          acceptedAt: challenge.acceptedAt || null,
          completedAt: challenge.completedAt || null,
        });
      }

      const { action, creatorScore, opponentScore } = req.body || {};

      if (!action || typeof action !== "string") return error(res, "Action is required");

      if (action === "accept") {
        if (challenge.status !== "PENDING") return error(res, "Only pending challenges can be accepted");
        if (String(challenge.opponentUserId) !== user.userId) return error(res, "Only the opponent can accept");
        if (challenge.expiresAt.getTime() <= Date.now()) return error(res, "Challenge has expired");
        challenge.status = "ACCEPTED";
        challenge.acceptedAt = new Date();
        await challenge.save();
        return success(res, { message: "Challenge accepted" });
      }

      if (action === "decline") {
        if (challenge.status !== "PENDING") return error(res, "Only pending challenges can be declined");
        if (String(challenge.opponentUserId) !== user.userId) return error(res, "Only the opponent can decline");
        challenge.status = "DECLINED";
        await challenge.save();
        return success(res, { message: "Challenge declined" });
      }

      if (action === "complete") {
        if (challenge.status !== "ACCEPTED") return error(res, "Only accepted challenges can be completed");
        if (challenge.expiresAt.getTime() <= Date.now()) return error(res, "Challenge has expired");

        const isCreator = String(challenge.creatorUserId) === user.userId;
        if (!isCreator) return error(res, "Only the challenge creator can submit final scores");

        const creatorValue = Math.max(0, Number(creatorScore) || 0);
        const opponentValue = Math.max(0, Number(opponentScore) || 0);

        challenge.creatorScore = creatorValue;
        challenge.opponentScore = opponentValue;
        challenge.status = "COMPLETED";
        challenge.completedAt = new Date();

        if (creatorValue > opponentValue) {
          challenge.winnerUserId = challenge.creatorUserId;
        } else if (opponentValue > creatorValue) {
          challenge.winnerUserId = challenge.opponentUserId;
        } else {
          challenge.winnerUserId = undefined;
        }

        await challenge.save();

        if (challenge.winnerUserId) {
          await addXp(String(challenge.winnerUserId), 50);
        }

        return success(res, {
          message: "Challenge completed",
          winnerUserId: challenge.winnerUserId ? String(challenge.winnerUserId) : null,
        });
      }

      return error(res, "Unsupported action");
    }

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
