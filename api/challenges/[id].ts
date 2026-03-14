import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import connectDB from "../_lib/mongodb.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { applyCors, error, methodNotAllowed, notFound, serverError, success, unauthorized } from "../_lib/utils.js";
import FriendChallenge from "../_models/FriendChallenge.js";
import { addXp } from "../_lib/gamification.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PUT" && req.method !== "GET") return methodNotAllowed(res);

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  const { id } = req.query;
  const challengeId = Array.isArray(id) ? id[0] : id;

  if (!challengeId) return error(res, "Challenge ID is required");
  if (!mongoose.Types.ObjectId.isValid(challengeId)) return notFound(res, "Challenge not found");

  try {
    await connectDB();

    const challenge = await FriendChallenge.findById(challengeId);
    if (!challenge) return notFound(res, "Challenge not found");

    const isParticipant = [String(challenge.creatorUserId), String(challenge.opponentUserId)].includes(user.userId);
    if (!isParticipant) return unauthorized(res, "You are not part of this challenge");

    // Expire stale challenges opportunistically on read/write.
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
  } catch (err) {
    return serverError(res, err);
  }
}
