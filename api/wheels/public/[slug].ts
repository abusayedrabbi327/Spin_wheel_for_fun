import type { VercelRequest, VercelResponse } from "@vercel/node";
import prisma from "../../_lib/prisma.js";
import { success, notFound, serverError } from "../../_lib/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;
  const wheelSlug = Array.isArray(slug) ? slug[0] : slug;

  if (!wheelSlug) {
    return res.status(400).json({ error: "Slug is required" });
  }

  try {
    const wheel = await prisma.wheel.findUnique({
      where: { slug: wheelSlug },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (!wheel) {
      return notFound(res, "Wheel not found");
    }

    // Check if wheel is active
    if (!wheel.isActive) {
      return notFound(res, "This wheel is no longer active");
    }

    // Check if wheel has expired
    if (wheel.expiryDate && new Date(wheel.expiryDate) < new Date()) {
      return notFound(res, "This wheel has expired");
    }

    // Check if max spins reached
    if (wheel.maxSpins) {
      const spinCount = await prisma.spin.count({
        where: { wheelId: wheel.id },
      });

      if (spinCount >= wheel.maxSpins) {
        return res.status(403).json({ error: "This wheel has reached its maximum number of spins" });
      }
    }

    // Return public wheel data
    return success(res, {
      id: wheel.id,
      title: wheel.title,
      slug: wheel.slug,
      type: wheel.type,
      allowBetterLuck: wheel.allowBetterLuck,
      items: wheel.items.map((item: { id: string; label: string }) => ({
        id: item.id,
        label: item.label,
        // Don't expose values to prevent cheating
      })),
      createdBy: wheel.user?.name || "Anonymous",
    });
  } catch (err) {
    return serverError(res, err);
  }
}
