import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import { applyCors, methodNotAllowed, serverError, success } from "../_lib/utils.js";
import UserProgress from "../_models/UserProgress.js";
import User from "../_models/User.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return methodNotAllowed(res);

  try {
    await connectDB();

    const limit = Math.max(5, Math.min(100, Number(req.query.limit) || 20));

    const rows = await UserProgress.find().sort({ xp: -1, totalSpins: -1, updatedAt: 1 }).limit(limit).lean();
    const userIds = rows.map((row) => row.userId);

    const users = await User.find({ _id: { $in: userIds } }).select("name email").lean();
    const userMap = new Map(users.map((user: any) => [String(user._id), user]));

    return success(
      res,
      rows.map((row, index) => {
        const user = userMap.get(String(row.userId));
        return {
          rank: index + 1,
          userId: String(row.userId),
          name: user?.name || user?.email?.split("@")[0] || "Player",
          email: user?.email || null,
          xp: row.xp,
          level: row.level,
          streakDays: row.streakDays,
          totalSpins: row.totalSpins,
          totalWheels: row.totalWheels,
        };
      })
    );
  } catch (err) {
    return serverError(res, err);
  }
}
