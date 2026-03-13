import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import User from "../models/User.js";
import Wheel from "../models/Wheel.js";
import Spin from "../models/Spin.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { success, unauthorized, methodNotAllowed, serverError } from "../_lib/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return methodNotAllowed(res);

  const user = getUserFromRequest(req);
  if (!user || user.role !== "ADMIN") return unauthorized(res, "Admin access required");

  try {
    await connectDB();

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

      // Aggregate spins per day over last 30 days
      Spin.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),

      // Top 5 wheels by spin count
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

      // Wheel types distribution
      Wheel.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
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
  } catch (err) {
    return serverError(res, err);
  }
}
