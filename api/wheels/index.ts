import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import Wheel from "../_models/Wheel.js";
import Spin from "../_models/Spin.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { success, error, unauthorized, methodNotAllowed, serverError, generateSlug, applyCors } from "../_lib/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    await connectDB();

    // GET - List user's wheels with spin counts
    if (req.method === "GET") {
      const wheels = await Wheel.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();

      const wheelsWithCount = await Promise.all(
        wheels.map(async (wheel) => {
          const spinCount = await Spin.countDocuments({ wheelId: wheel._id });
          return {
            ...wheel,
            id: wheel._id.toString(),
            userId: wheel.userId.toString(),
            items: wheel.items
              .sort((a, b) => a.order - b.order)
              .map((item) => ({ ...item, id: item._id?.toString() })),
            _count: { spins: spinCount },
          };
        })
      );

      return success(res, wheelsWithCount);
    }

    // POST - Create new wheel
    if (req.method === "POST") {
      const { title, type, maxSpins, expiryDate, allowBetterLuck, items } = req.body;

      if (!title) return error(res, "Title is required");
      if (!items || !Array.isArray(items) || items.length < 2)
        return error(res, "At least 2 items are required");

      const slug = generateSlug(title);

      const wheel = await Wheel.create({
        title,
        slug,
        type: type || "CUSTOM",
        maxSpins: maxSpins ? parseInt(maxSpins) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        allowBetterLuck: allowBetterLuck ?? true,
        userId: user.userId,
        items: items.map((item: { label: string; value?: string }, index: number) => ({
          label: item.label,
          value: item.value || undefined,
          order: index,
        })),
      });

      return success(res, {
        ...wheel.toObject(),
        id: wheel._id.toString(),
        userId: wheel.userId.toString(),
        items: wheel.items.map((item: any) => ({ ...item.toObject(), id: item._id?.toString() })),
        _count: { spins: 0 },
      }, 201);
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
