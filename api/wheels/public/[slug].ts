import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../../_lib/mongodb.js";
import Wheel from "../../models/Wheel.js";
import Spin from "../../models/Spin.js";
import "../../models/User.js"; // Import User to register the schema for populate()
import { success, notFound, serverError } from "../../_lib/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { slug } = req.query;
  const wheelSlug = Array.isArray(slug) ? slug[0] : slug;

  if (!wheelSlug) return res.status(400).json({ error: "Slug is required" });

  try {
    await connectDB();

    const wheel = await Wheel.findOne({ slug: wheelSlug })
      .populate("userId", "name")
      .lean();

    if (!wheel) return notFound(res, "Wheel not found");
    if (!wheel.isActive) return notFound(res, "This wheel is no longer active");
    if (wheel.expiryDate && new Date(wheel.expiryDate) < new Date())
      return notFound(res, "This wheel has expired");

    if (wheel.maxSpins) {
      const spinCount = await Spin.countDocuments({ wheelId: wheel._id });
      if (spinCount >= wheel.maxSpins)
        return res.status(403).json({ error: "This wheel has reached its maximum number of spins" });
    }

    const owner = wheel.userId as any;

    return success(res, {
      id: wheel._id.toString(),
      title: wheel.title,
      slug: wheel.slug,
      type: wheel.type,
      allowBetterLuck: wheel.allowBetterLuck,
      items: wheel.items
        .sort((a, b) => a.order - b.order)
        .map((item) => ({ id: item._id?.toString(), label: item.label })),
      createdBy: owner?.name || "Anonymous",
    });
  } catch (err) {
    return serverError(res, err);
  }
}
