import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import connectDB from "../../_lib/mongodb.js";
import Event from "../../_models/Event.js";
import { getUserFromRequest } from "../../_lib/auth.js";
import { applyCors, error, methodNotAllowed, notFound, serverError, success, unauthorized } from "../../_lib/utils.js";

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

  const { id } = req.query;
  const eventId = Array.isArray(id) ? id[0] : id;

  if (!eventId) return error(res, "Event ID is required");
  if (!mongoose.Types.ObjectId.isValid(eventId)) return notFound(res, "Event not found");

  try {
    await connectDB();

    if (req.method === "GET") {
      const event = await Event.findById(eventId).lean();
      if (!event) return notFound(res, "Event not found");
      return success(res, {
        id: event._id.toString(),
        slug: event.slug,
        name: event.name,
        occasion: event.occasion,
        isActive: event.isActive,
        startAt: event.startAt,
        endAt: event.endAt,
        oneTimeMythicStickerCode: event.oneTimeMythicStickerCode || null,
        missions: event.missions,
      });
    }

    if (req.method === "PUT") {
      const event = await Event.findById(eventId);
      if (!event) return notFound(res, "Event not found");

      const { slug, name, occasion, startAt, endAt, isActive, oneTimeMythicStickerCode, missions } = req.body || {};

      if (slug !== undefined) {
        const nextSlug = String(slug).toLowerCase().trim();
        if (!nextSlug) return error(res, "slug cannot be empty");

        const duplicate = await Event.findOne({ slug: nextSlug, _id: { $ne: event._id } });
        if (duplicate) return error(res, "An event with this slug already exists", 409);

        event.slug = nextSlug;
      }
      if (name !== undefined) event.name = String(name).trim();
      if (occasion !== undefined) event.occasion = String(occasion).trim();

      let nextStartAt = event.startAt;
      let nextEndAt = event.endAt;

      if (startAt !== undefined) {
        const parsedStartAt = new Date(startAt);
        if (Number.isNaN(parsedStartAt.getTime())) return error(res, "startAt must be a valid date value");
        nextStartAt = parsedStartAt;
      }
      if (endAt !== undefined) {
        const parsedEndAt = new Date(endAt);
        if (Number.isNaN(parsedEndAt.getTime())) return error(res, "endAt must be a valid date value");
        nextEndAt = parsedEndAt;
      }
      if (nextEndAt <= nextStartAt) return error(res, "endAt must be later than startAt");

      event.startAt = nextStartAt;
      event.endAt = nextEndAt;

      if (isActive !== undefined) event.isActive = Boolean(isActive);
      if (oneTimeMythicStickerCode !== undefined) {
        event.oneTimeMythicStickerCode = oneTimeMythicStickerCode ? String(oneTimeMythicStickerCode).toUpperCase().trim() : undefined;
      }
      if (missions !== undefined && Array.isArray(missions)) {
        const normalizedMissions = normalizeMissions(missions);
        if (!normalizedMissions.length) return error(res, "At least one valid mission is required");
        event.missions = normalizedMissions as any;
      }

      await event.save();

      return success(res, {
        id: event._id.toString(),
        slug: event.slug,
        name: event.name,
        occasion: event.occasion,
        isActive: event.isActive,
        startAt: event.startAt,
        endAt: event.endAt,
        oneTimeMythicStickerCode: event.oneTimeMythicStickerCode || null,
        missions: event.missions,
      });
    }

    if (req.method === "DELETE") {
      const deleted = await Event.findByIdAndDelete(eventId);
      if (!deleted) return notFound(res, "Event not found");
      return success(res, { message: "Event deleted" });
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
