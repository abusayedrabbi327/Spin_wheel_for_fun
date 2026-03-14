import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { applyCors, unauthorized, success, methodNotAllowed, serverError } from "../_lib/utils.js";
import { ensureStickerCatalogSeeded } from "../_lib/gamification.js";
import Sticker from "../_models/Sticker.js";
import UserSticker from "../_models/UserSticker.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return methodNotAllowed(res);

  const user = getUserFromRequest(req);
  if (!user) return unauthorized(res);

  try {
    await connectDB();
    await ensureStickerCatalogSeeded();

    const [catalog, owned] = await Promise.all([
      Sticker.find({ active: true }).sort({ pointsRequired: 1 }).lean(),
      UserSticker.find({ userId: user.userId }).select("stickerCode obtainedAt source").lean(),
    ]);

    const ownedByCode = new Map(owned.map((item) => [item.stickerCode, item]));

    return success(res, {
      totalCatalog: catalog.length,
      totalOwned: owned.length,
      stickers: catalog.map((sticker) => ({
        id: sticker._id.toString(),
        code: sticker.code,
        name: sticker.name,
        batch: sticker.batch,
        rarity: sticker.rarity,
        pointsRequired: sticker.pointsRequired,
        occasion: sticker.occasion || null,
        isLifetimeExclusive: sticker.isLifetimeExclusive,
        owned: ownedByCode.has(sticker.code),
        obtainedAt: ownedByCode.get(sticker.code)?.obtainedAt || null,
        source: ownedByCode.get(sticker.code)?.source || null,
      })),
    });
  } catch (err) {
    return serverError(res, err);
  }
}
