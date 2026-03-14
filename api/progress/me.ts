import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { applyCors, unauthorized, success, methodNotAllowed, serverError } from "../_lib/utils.js";
import { ensureUserProgress, awardMilestoneStickers, evaluateActiveEventProgress, calculateLevelFromXp } from "../_lib/gamification.js";
import UserSticker from "../_models/UserSticker.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return methodNotAllowed(res);

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    await connectDB();

    const progress = await ensureUserProgress(user.userId);
    const newStickers = await awardMilestoneStickers(user.userId, progress.xp);
    const eventResult = await evaluateActiveEventProgress(user.userId);

    const stickerCount = await UserSticker.countDocuments({ userId: user.userId });

    const currentLevel = calculateLevelFromXp(progress.xp);
    const currentLevelBaseXp = (currentLevel - 1) * 120;
    const nextLevelBaseXp = currentLevel * 120;

    return success(res, {
      xp: progress.xp,
      level: progress.level,
      streakDays: progress.streakDays,
      totals: {
        spins: progress.totalSpins,
        wheels: progress.totalWheels,
        sessions: progress.totalSessions,
      },
      stickers: {
        totalOwned: stickerCount,
        newlyUnlocked: [...newStickers, ...eventResult.grantedStickerCodes],
      },
      levelProgress: {
        currentLevel,
        currentLevelBaseXp,
        nextLevelBaseXp,
        progressInLevel: Math.max(0, progress.xp - currentLevelBaseXp),
        neededForNext: Math.max(0, nextLevelBaseXp - progress.xp),
      },
      event: eventResult.activeEvent
        ? {
            id: eventResult.activeEvent._id.toString(),
            slug: eventResult.activeEvent.slug,
            name: eventResult.activeEvent.name,
            occasion: eventResult.activeEvent.occasion,
            startAt: eventResult.activeEvent.startAt,
            endAt: eventResult.activeEvent.endAt,
            completedMissionIds: eventResult.completedMissionIds,
          }
        : null,
    });
  } catch (err) {
    return serverError(res, err);
  }
}
