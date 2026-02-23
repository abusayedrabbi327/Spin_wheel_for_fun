import type { VercelRequest, VercelResponse } from "@vercel/node";
import prisma from "../_lib/prisma.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { success, unauthorized, methodNotAllowed, serverError } from "../_lib/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return methodNotAllowed(res);
  }

  const user = getUserFromRequest(req);
  if (!user || user.role !== "ADMIN") {
    return unauthorized(res, "Admin access required");
  }

  try {
    // Get date range for analytics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Parallel queries for efficiency
    const [
      totalUsers,
      totalWheels,
      totalSpins,
      activeWheels,
      recentUsers,
      recentWheels,
      recentSpins,
      spinsByDay,
      topWheels,
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.wheel.count(),
      prisma.spin.count(),
      prisma.wheel.count({ where: { isActive: true } }),

      // Recent counts (last 7 days)
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.wheel.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.spin.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),

      // Spins per day (last 30 days)
      prisma.spin.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
        _count: true,
      }),

      // Top 5 wheels by spin count
      prisma.wheel.findMany({
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { spins: true } },
        },
        orderBy: {
          spins: { _count: "desc" },
        },
      }),
    ]);

    // Process spins by day into a simpler format
    const spinsPerDay: Record<string, number> = {};
    spinsByDay.forEach((entry: { createdAt: Date; _count: number }) => {
      const date = new Date(entry.createdAt).toISOString().split("T")[0];
      spinsPerDay[date] = (spinsPerDay[date] || 0) + entry._count;
    });

    return success(res, {
      overview: {
        totalUsers,
        totalWheels,
        totalSpins,
        activeWheels,
      },
      recent: {
        users: recentUsers,
        wheels: recentWheels,
        spins: recentSpins,
      },
      spinsPerDay,
      topWheels: topWheels.map((w: { id: string; title: string; slug: string; user?: { name?: string; email: string } | null; _count: { spins: number } }) => ({
        id: w.id,
        title: w.title,
        slug: w.slug,
        owner: w.user?.name || w.user?.email || "Unknown",
        spins: w._count.spins,
      })),
    });
  } catch (err) {
    return serverError(res, err);
  }
}
