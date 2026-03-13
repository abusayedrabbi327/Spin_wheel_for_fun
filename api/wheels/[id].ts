import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
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

  const { id } = req.query;
  const wheelId = Array.isArray(id) ? id[0] : id;

  if (!wheelId) return error(res, "Wheel ID is required");

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(wheelId)) return notFound(res, "Wheel not found");

  try {
    await connectDB();

    // GET - Get wheel by ID
    if (req.method === "GET") {
      const wheel = await Wheel.findById(wheelId).populate("userId", "id name").lean();
      if (!wheel) return notFound(res, "Wheel not found");

      if (!wheel.isActive) {
        const user = getUserFromRequest(req);
        if (!user || (user.userId !== wheel.userId.toString() && user.role?.toUpperCase() !== "ADMIN")) {
          return notFound(res, "Wheel not found");
        }
      }

      const spinCount = await Spin.countDocuments({ wheelId: wheel._id });
      const owner = wheel.userId as any;

      return success(res, {
        ...wheel,
        id: wheel._id.toString(),
        userId: owner?._id?.toString() || wheel.userId.toString(),
        user: owner ? { id: owner._id?.toString(), name: owner.name } : null,
        items: wheel.items
          .sort((a, b) => a.order - b.order)
          .map((item) => ({ ...item, id: item._id?.toString() })),
        _count: { spins: spinCount },
      });
    }

    // PUT - Update wheel (owner only)
    if (req.method === "PUT") {
      const user = getUserFromRequest(req);
      if (!user) return unauthorized(res);

      const wheel = await Wheel.findById(wheelId);
      if (!wheel) return notFound(res, "Wheel not found");
      if (wheel.userId.toString() !== user.userId) return unauthorized(res, "You don't own this wheel");

      const { title, type, maxSpins, expiryDate, allowBetterLuck, isActive, items } = req.body;

      if (title !== undefined) wheel.title = title;
      if (type !== undefined) wheel.type = type;
      if (maxSpins !== undefined) wheel.maxSpins = maxSpins ? parseInt(maxSpins) : undefined;
      if (expiryDate !== undefined) wheel.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
      if (allowBetterLuck !== undefined) wheel.allowBetterLuck = allowBetterLuck;
      if (isActive !== undefined) wheel.isActive = isActive;

      // Replace items entirely if new ones provided
      if (items && Array.isArray(items)) {
        wheel.items = items.map((item: { label: string; value?: string }, index: number) => ({
          label: item.label,
          value: item.value || undefined,
          order: index,
        })) as any;
      }

      await wheel.save();

      return success(res, {
        ...wheel.toObject(),
        id: wheel._id.toString(),
        userId: wheel.userId.toString(),
        items: wheel.items.map((item: any) => ({ ...item.toObject(), id: item._id?.toString() })),
      });
    }

    // DELETE - Delete wheel (owner only)
    if (req.method === "DELETE") {
      const user = getUserFromRequest(req);
      if (!user) return unauthorized(res);

      const wheel = await Wheel.findById(wheelId);
      if (!wheel) return notFound(res, "Wheel not found");
      if (wheel.userId.toString() !== user.userId) return unauthorized(res, "You don't own this wheel");

      // Delete wheel and all associated spins
      await Promise.all([
        Wheel.findByIdAndDelete(wheelId),
        Spin.deleteMany({ wheelId }),
      ]);

      return success(res, { message: "Wheel deleted successfully" });
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
