import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import Event from "../_models/Event.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { applyCors, error, methodNotAllowed, serverError, success, unauthorized } from "../_lib/utils.js";

function normalizeMissions(missions: any[]) {
  const allowedMetrics = new Set(["totalSpins", "totalWheels", "streakDays"]);

  return missions
    .filter(
      (mission) =>
        mission &&
        mission.title &&
        allowedMetrics.has(String(mission.metric)) &&
        Number(mission.target) > 0
    )
    .map((mission, idx) => ({
      missionId: String(mission.missionId || `mission-${idx + 1}`).trim(),
      title: String(mission.title).trim(),
      description: String(mission.description || "").trim(),
      metric: mission.metric,
      target: Number(mission.target),
      rewardXp: Number(mission.rewardXp || 0),
      rewardStickerCode: mission.rewardStickerCode ? String(mission.rewardStickerCode).toUpperCase().trim() : undefined,
    }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user || user.role !== "ADMIN") return unauthorized(res, "Admin access required");

  try {
    await connectDB();

    if (req.method === "GET") {
      const events = await Event.find().sort({ startAt: -1 }).lean();
      return success(
        res,
        events.map((event) => ({
          id: event._id.toString(),
          slug: event.slug,
          name: event.name,
          occasion: event.occasion,
          isActive: event.isActive,
          startAt: event.startAt,
          endAt: event.endAt,
          oneTimeMythicStickerCode: event.oneTimeMythicStickerCode || null,
          missions: event.missions,
        }))
      );
    }

    if (req.method === "POST") {
      const { slug, name, occasion, startAt, endAt, isActive, oneTimeMythicStickerCode, missions } = req.body || {};

      if (!slug || !name || !occasion || !startAt || !endAt) {
        return error(res, "slug, name, occasion, startAt and endAt are required");
      }

      const safeSlug = String(slug).toLowerCase().trim();
      const existing = await Event.findOne({ slug: safeSlug });
      if (existing) return error(res, "An event with this slug already exists", 409);

      const parsedStartAt = new Date(startAt);
      const parsedEndAt = new Date(endAt);
      if (Number.isNaN(parsedStartAt.getTime()) || Number.isNaN(parsedEndAt.getTime())) {
        return error(res, "startAt and endAt must be valid date values");
      }
      if (parsedEndAt <= parsedStartAt) {
        return error(res, "endAt must be later than startAt");
      }

      const normalizedMissions = normalizeMissions(Array.isArray(missions) ? missions : []);
      if (!normalizedMissions.length) {
        return error(res, "At least one valid mission is required");
      }

      const created = await Event.create({
        slug: safeSlug,
        name: String(name).trim(),
        occasion: String(occasion).trim(),
        startAt: parsedStartAt,
        endAt: parsedEndAt,
        isActive: isActive !== false,
        oneTimeMythicStickerCode: oneTimeMythicStickerCode ? String(oneTimeMythicStickerCode).toUpperCase().trim() : undefined,
        missions: normalizedMissions,
      });

      return success(
        res,
        {
          id: created._id.toString(),
          slug: created.slug,
          name: created.name,
          occasion: created.occasion,
          isActive: created.isActive,
          startAt: created.startAt,
          endAt: created.endAt,
          missions: created.missions,
        },
        201
      );
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
