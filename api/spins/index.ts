import type { VercelRequest, VercelResponse } from "@vercel/node";
import prisma from "../_lib/prisma";
import { getUserFromRequest } from "../_lib/auth";
import { success, error, notFound, methodNotAllowed, serverError } from "../_lib/utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // POST - Record a new spin
    if (req.method === "POST") {
      const { wheelId, result, spinnerName, spinnerEmail } = req.body;

      if (!wheelId) {
        return error(res, "Wheel ID is required");
      }

      if (!result) {
        return error(res, "Spin result is required");
      }

      // Verify wheel exists and is active
      const wheel = await prisma.wheel.findUnique({
        where: { id: wheelId },
      });

      if (!wheel) {
        return notFound(res, "Wheel not found");
      }

      if (!wheel.isActive) {
        return error(res, "This wheel is no longer active");
      }

      // Check expiry
      if (wheel.expiryDate && new Date(wheel.expiryDate) < new Date()) {
        return error(res, "This wheel has expired");
      }

      // Check max spins
      if (wheel.maxSpins) {
        const spinCount = await prisma.spin.count({
          where: { wheelId: wheel.id },
        });

        if (spinCount >= wheel.maxSpins) {
          return error(res, "This wheel has reached its maximum number of spins");
        }
      }

      // Create spin record
      const spin = await prisma.spin.create({
        data: {
          wheelId,
          result,
          spinnerName: spinnerName || null,
          spinnerEmail: spinnerEmail || null,
        },
      });

      return success(res, spin, 201);
    }

    // GET - Get spins for a wheel (owner only)
    if (req.method === "GET") {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { wheelId, limit, offset } = req.query;

      if (!wheelId) {
        return error(res, "Wheel ID is required");
      }

      const wheelIdStr = Array.isArray(wheelId) ? wheelId[0] : wheelId;

      // Verify ownership
      const wheel = await prisma.wheel.findUnique({
        where: { id: wheelIdStr },
      });

      if (!wheel) {
        return notFound(res, "Wheel not found");
      }

      if (wheel.userId !== user.userId) {
        return res.status(401).json({ error: "You don't own this wheel" });
      }

      const take = limit ? parseInt(Array.isArray(limit) ? limit[0] : limit) : 50;
      const skip = offset ? parseInt(Array.isArray(offset) ? offset[0] : offset) : 0;

      const [spins, total] = await Promise.all([
        prisma.spin.findMany({
          where: { wheelId: wheelIdStr },
          orderBy: { spunAt: "desc" },
          take,
          skip,
        }),
        prisma.spin.count({
          where: { wheelId: wheelIdStr },
        }),
      ]);

      return success(res, {
        spins,
        total,
        limit: take,
        offset: skip,
      });
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
