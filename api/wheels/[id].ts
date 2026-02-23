import type { VercelRequest, VercelResponse } from "@vercel/node";
import prisma from "../_lib/prisma.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { success, error, notFound, unauthorized, methodNotAllowed, serverError } from "../_lib/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;
  const wheelId = Array.isArray(id) ? id[0] : id;

  if (!wheelId) {
    return error(res, "Wheel ID is required");
  }

  try {
    // GET - Get wheel by ID (public or owner)
    if (req.method === "GET") {
      const wheel = await prisma.wheel.findUnique({
        where: { id: wheelId },
        include: {
          items: {
            orderBy: { order: "asc" },
          },
          user: {
            select: { id: true, name: true },
          },
          _count: {
            select: { spins: true },
          },
        },
      });

      if (!wheel) {
        return notFound(res, "Wheel not found");
      }

      // Check if wheel is active
      if (!wheel.isActive) {
        const user = getUserFromRequest(req);
        if (!user || user.userId !== wheel.userId) {
          return notFound(res, "Wheel not found");
        }
      }

      return success(res, wheel);
    }

    // PUT - Update wheel (owner only)
    if (req.method === "PUT") {
      const user = getUserFromRequest(req);
      if (!user) {
        return unauthorized(res);
      }

      const wheel = await prisma.wheel.findUnique({
        where: { id: wheelId },
      });

      if (!wheel) {
        return notFound(res, "Wheel not found");
      }

      if (wheel.userId !== user.userId) {
        return unauthorized(res, "You don't own this wheel");
      }

      const { title, type, maxSpins, expiryDate, allowBetterLuck, isActive, items } = req.body;

      // Update wheel with items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedWheel = await prisma.$transaction(async (tx: any) => {
        // Delete existing items if new items provided
        if (items && Array.isArray(items)) {
          await tx.wheelItem.deleteMany({
            where: { wheelId },
          });
        }

        return tx.wheel.update({
          where: { id: wheelId },
          data: {
            title: title ?? wheel.title,
            type: type ?? wheel.type,
            maxSpins: maxSpins !== undefined ? (maxSpins ? parseInt(maxSpins) : null) : wheel.maxSpins,
            expiryDate: expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : wheel.expiryDate,
            allowBetterLuck: allowBetterLuck ?? wheel.allowBetterLuck,
            isActive: isActive ?? wheel.isActive,
            items: items && Array.isArray(items)
              ? {
                  create: items.map((item: { label: string; value?: string }, index: number) => ({
                    label: item.label,
                    value: item.value || null,
                    order: index,
                  })),
                }
              : undefined,
          },
          include: {
            items: {
              orderBy: { order: "asc" },
            },
          },
        });
      });

      return success(res, updatedWheel);
    }

    // DELETE - Delete wheel (owner only)
    if (req.method === "DELETE") {
      const user = getUserFromRequest(req);
      if (!user) {
        return unauthorized(res);
      }

      const wheel = await prisma.wheel.findUnique({
        where: { id: wheelId },
      });

      if (!wheel) {
        return notFound(res, "Wheel not found");
      }

      if (wheel.userId !== user.userId) {
        return unauthorized(res, "You don't own this wheel");
      }

      // Delete wheel (cascade deletes items and spins)
      await prisma.wheel.delete({
        where: { id: wheelId },
      });

      return success(res, { message: "Wheel deleted successfully" });
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
