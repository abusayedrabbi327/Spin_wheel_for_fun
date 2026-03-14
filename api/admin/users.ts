import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import User from "../_models/User.js";
import Wheel from "../_models/Wheel.js";
import Spin from "../_models/Spin.js";
import Event from "../_models/Event.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { success, error, notFound, unauthorized, methodNotAllowed, serverError, applyCors, escapeRegex } from "../_lib/utils.js";
import mongoose from "mongoose";

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

function resolveResource(req: VercelRequest): string {
  const resourceParam = Array.isArray(req.query.resource) ? req.query.resource[0] : req.query.resource;
  if (resourceParam) return String(resourceParam).toLowerCase();

  const path = (req.url || "").split("?")[0];
  const segments = path.split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");
  return String(segments[adminIndex + 1] || "users").toLowerCase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user || user.role !== "ADMIN") return unauthorized(res, "Admin access required");

  try {
    await connectDB();
    const resource = resolveResource(req);

    if (resource === "stats") {
      if (req.method !== "GET") return methodNotAllowed(res);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        totalWheels,
        totalSpins,
        activeWheels,
        recentUsers,
        recentWheels,
        recentSpins,
        spinsByDay,
        topWheels,
        wheelTypes,
      ] = await Promise.all([
        User.countDocuments(),
        Wheel.countDocuments(),
        Spin.countDocuments(),
        Wheel.countDocuments({ isActive: true }),
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        Wheel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        Spin.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        Spin.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
        ]),
        Spin.aggregate([
          { $group: { _id: "$wheelId", spinCount: { $sum: 1 } } },
          { $sort: { spinCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "wheels",
              localField: "_id",
              foreignField: "_id",
              as: "wheel",
            },
          },
          { $unwind: "$wheel" },
          {
            $lookup: {
              from: "users",
              localField: "wheel.userId",
              foreignField: "_id",
              as: "owner",
            },
          },
          { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        ]),
        Wheel.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      ]);

      const spinsPerDay: Record<string, number> = {};
      spinsByDay.forEach((entry: { _id: string; count: number }) => {
        spinsPerDay[entry._id] = entry.count;
      });

      return success(res, {
        overview: { totalUsers, totalWheels, totalSpins, activeWheels },
        recent: { users: recentUsers, wheels: recentWheels, spins: recentSpins },
        spinsPerDay,
        topWheels: topWheels.map((entry: any) => ({
          id: entry.wheel._id.toString(),
          title: entry.wheel.title,
          slug: entry.wheel.slug,
          owner: entry.owner?.name || entry.owner?.email || "Unknown",
          spins: entry.spinCount,
          isActive: entry.wheel.isActive,
        })),
        wheelTypes: wheelTypes.map((type: any) => ({
          type: type._id || "Unknown",
          count: type.count,
        })),
      });
    }

    if (resource === "wheels") {
      if (req.method !== "GET") return methodNotAllowed(res);

      const { limit, offset, search, status } = req.query;

      const take = limit ? parseInt(Array.isArray(limit) ? limit[0] : limit) : 20;
      const skip = offset ? parseInt(Array.isArray(offset) ? offset[0] : offset) : 0;
      const searchStr = Array.isArray(search) ? search[0] : search;
      const statusStr = Array.isArray(status) ? status[0] : status;

      const query: any = {};

      if (searchStr) {
        query.title = { $regex: searchStr, $options: "i" };
      }

      if (statusStr && statusStr !== "All") {
        if (statusStr === "Active") query.isActive = true;
        if (statusStr === "Inactive" || statusStr === "Closed") query.isActive = false;
      }

      const [wheels, total] = await Promise.all([
        Wheel.find(query).populate("userId", "name email").sort({ createdAt: -1 }).skip(skip).limit(take).lean(),
        Wheel.countDocuments(query),
      ]);

      const wheelsWithData = await Promise.all(
        wheels.map(async (w: any) => {
          const spinCount = await Spin.countDocuments({ wheelId: w._id });
          return {
            id: w._id.toString(),
            title: w.title,
            slug: w.slug,
            type: w.type,
            isActive: w.isActive,
            itemCount: w.items?.length || 0,
            allowBetterLuck: w.allowBetterLuck,
            createdAt: w.createdAt,
            owner: w.userId,
            totalSpins: spinCount,
          };
        })
      );

      return success(res, { wheels: wheelsWithData, total, limit: take, offset: skip });
    }

    if (resource === "events") {
      const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

      if (!idParam) {
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
      }

      if (!mongoose.Types.ObjectId.isValid(idParam)) return notFound(res, "Event not found");

      if (req.method === "GET") {
        const event = await Event.findById(idParam).lean();
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
        const event = await Event.findById(idParam);
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
        const deleted = await Event.findByIdAndDelete(idParam);
        if (!deleted) return notFound(res, "Event not found");
        return success(res, { message: "Event deleted" });
      }

      return methodNotAllowed(res);
    }

    // GET - List all users with wheel count
    if (resource === "users" && req.method === "GET") {
      const { limit, offset, search } = req.query;

      const take = limit ? parseInt(Array.isArray(limit) ? limit[0] : limit) : 20;
      const skip = offset ? parseInt(Array.isArray(offset) ? offset[0] : offset) : 0;
      const searchStr = Array.isArray(search) ? search[0] : search;

      const safeSearch = searchStr ? escapeRegex(searchStr) : "";

      const query = safeSearch
        ? { $or: [{ name: { $regex: safeSearch, $options: "i" } }, { email: { $regex: safeSearch, $options: "i" } }] }
        : {};

      const [users, total] = await Promise.all([
        User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(take).lean(),
        User.countDocuments(query),
      ]);

      const usersWithWheelCount = await Promise.all(
        users.map(async (u) => {
          const userWheels = await Wheel.find({ userId: u._id }).select("_id").lean();
          const wheelIds = userWheels.map((w) => w._id);
          const totalSpins = await Spin.countDocuments({ wheelId: { $in: wheelIds } });

          return {
            id: u._id.toString(),
            email: u.email,
            name: u.name,
            role: u.role,
            createdAt: u.createdAt,
            wheelCount: wheelIds.length,
            totalSpins,
          };
        })
      );

      return success(res, { users: usersWithWheelCount, total, limit: take, offset: skip });
    }

    if (resource !== "users") {
      return error(res, "Unknown admin resource", 404);
    }

    const { id } = req.query;
    const userId = Array.isArray(id) ? id[0] : id;
    if (!userId) return error(res, "User ID is required for this operation");
    if (!mongoose.Types.ObjectId.isValid(userId)) return notFound(res, "User not found");

    // PUT - Update user role
    if (req.method === "PUT") {
      const { role } = req.body;

      if (!role || !["USER", "ADMIN"].includes(role))
        return error(res, "Valid role is required (USER or ADMIN)");

      if (userId === user.userId && role !== "ADMIN")
        return error(res, "You cannot demote yourself");

      const targetUser = await User.findById(userId);
      if (!targetUser) return notFound(res, "User not found");

      targetUser.role = role;
      await targetUser.save();

      return success(res, {
        id: targetUser._id.toString(),
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        createdAt: targetUser.createdAt,
      });
    }

    // DELETE - Delete user and cascade their wheels + spins
    if (req.method === "DELETE") {
      if (userId === user.userId) return error(res, "You cannot delete yourself");

      const targetUser = await User.findById(userId);
      if (!targetUser) return notFound(res, "User not found");

      // Get all wheels owned by this user for cascade delete
      const userWheels = await Wheel.find({ userId }).select("_id").lean();
      const wheelIds = userWheels.map((w) => w._id);

      await Promise.all([
        Spin.deleteMany({ wheelId: { $in: wheelIds } }),
        Wheel.deleteMany({ userId }),
        User.findByIdAndDelete(userId),
      ]);

      return success(res, { message: "User deleted successfully" });
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
