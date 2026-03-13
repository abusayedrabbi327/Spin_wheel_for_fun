import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import User from "../models/User.js";
import Wheel from "../models/Wheel.js";
import Spin from "../models/Spin.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { success, error, notFound, unauthorized, methodNotAllowed, serverError } from "../_lib/utils.js";
import mongoose from "mongoose";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user || user.role !== "ADMIN") return unauthorized(res, "Admin access required");

  try {
    await connectDB();

    // GET - List all users with wheel count
    if (req.method === "GET") {
      const { limit, offset, search } = req.query;

      const take = limit ? parseInt(Array.isArray(limit) ? limit[0] : limit) : 20;
      const skip = offset ? parseInt(Array.isArray(offset) ? offset[0] : offset) : 0;
      const searchStr = Array.isArray(search) ? search[0] : search;

      const query = searchStr
        ? { $or: [{ name: { $regex: searchStr, $options: "i" } }, { email: { $regex: searchStr, $options: "i" } }] }
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
