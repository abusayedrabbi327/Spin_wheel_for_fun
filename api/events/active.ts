import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { applyCors, unauthorized, success, methodNotAllowed, serverError } from "../_lib/utils.js";
import { ensureSeasonalEventsSeeded, ensureUserProgress } from "../_lib/gamification.js";
import Event from "../_models/Event.js";
import EventMissionProgress from "../_models/EventMissionProgress.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return methodNotAllowed(res);

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    await connectDB();
    await ensureSeasonalEventsSeeded();

    const now = new Date();
    const activeEvent = await Event.findOne({ isActive: true, startAt: { $lte: now }, endAt: { $gte: now } }).lean();

    if (!activeEvent) {
      return success(res, { activeEvent: null });
    }

    const progress = await ensureUserProgress(user.userId);
    const missionProgress = await EventMissionProgress.find({ userId: user.userId, eventId: activeEvent._id }).lean();
    const completedSet = new Set(missionProgress.map((m) => m.missionId));

    return success(res, {
      activeEvent: {
        id: activeEvent._id.toString(),
        slug: activeEvent.slug,
        name: activeEvent.name,
        occasion: activeEvent.occasion,
        startAt: activeEvent.startAt,
        endAt: activeEvent.endAt,
        oneTimeMythicStickerCode: activeEvent.oneTimeMythicStickerCode || null,
        missions: activeEvent.missions.map((mission) => {
          const metricValue =
            mission.metric === "totalSpins"
              ? progress.totalSpins
              : mission.metric === "totalWheels"
                ? progress.totalWheels
                : progress.streakDays;

          return {
            missionId: mission.missionId,
            title: mission.title,
            description: mission.description,
            metric: mission.metric,
            target: mission.target,
            rewardXp: mission.rewardXp,
            rewardStickerCode: mission.rewardStickerCode || null,
            current: metricValue,
            completed: completedSet.has(mission.missionId),
          };
        }),
      },
    });
  } catch (err) {
    return serverError(res, err);
  }
}
