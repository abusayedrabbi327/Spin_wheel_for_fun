import type { VercelRequest, VercelResponse } from "@vercel/node";
import prisma from "../_lib/prisma";
import { getUserFromRequest } from "../_lib/auth";
import { success, error, unauthorized, methodNotAllowed, serverError, generateSlug } from "../_lib/utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const user = getUserFromRequest(req);
  if (!user) {
    return unauthorized(res);
  }

  try {
    // GET - List user's wheels
    if (req.method === "GET") {
      const wheels = await prisma.wheel.findMany({
        where: { userId: user.userId },
        include: {
          items: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { spins: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return success(res, wheels);
    }

    // POST - Create new wheel
    if (req.method === "POST") {
      const { title, type, maxSpins, expiryDate, allowBetterLuck, items } = req.body;

      if (!title) {
        return error(res, "Title is required");
      }

      if (!items || !Array.isArray(items) || items.length < 2) {
        return error(res, "At least 2 items are required");
      }

      const slug = generateSlug(title);

      const wheel = await prisma.wheel.create({
        data: {
          title,
          slug,
          type: type || "CUSTOM",
          maxSpins: maxSpins ? parseInt(maxSpins) : null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          allowBetterLuck: allowBetterLuck ?? true,
          userId: user.userId,
          items: {
            create: items.map((item: { label: string; value?: string }, index: number) => ({
              label: item.label,
              value: item.value || null,
              order: index,
            })),
          },
        },
        include: {
          items: {
            orderBy: { order: "asc" },
          },
        },
      });

      return success(res, wheel, 201);
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
