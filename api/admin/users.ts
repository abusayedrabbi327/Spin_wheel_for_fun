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

  const user = getUserFromRequest(req);
  if (!user || user.role !== "ADMIN") {
    return unauthorized(res, "Admin access required");
  }

  try {
    // GET - List all users
    if (req.method === "GET") {
      const { limit, offset, search } = req.query;

      const take = limit ? parseInt(Array.isArray(limit) ? limit[0] : limit) : 20;
      const skip = offset ? parseInt(Array.isArray(offset) ? offset[0] : offset) : 0;
      const searchStr = Array.isArray(search) ? search[0] : search;

      const where = searchStr
        ? {
            OR: [
              { name: { contains: searchStr, mode: "insensitive" as const } },
              { email: { contains: searchStr, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            _count: {
              select: { wheels: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take,
          skip,
        }),
        prisma.user.count({ where }),
      ]);

      return success(res, {
        users: users.map((u: { id: string; email: string; name: string | null; role: string; createdAt: Date; _count: { wheels: number } }) => ({
          ...u,
          wheelCount: u._count.wheels,
          _count: undefined,
        })),
        total,
        limit: take,
        offset: skip,
      });
    }

    // Handle user ID based operations
    const { id } = req.query;
    const userId = Array.isArray(id) ? id[0] : id;

    if (!userId) {
      return error(res, "User ID is required for this operation");
    }

    // PUT - Update user role
    if (req.method === "PUT") {
      const { role } = req.body;

      if (!role || !["USER", "ADMIN"].includes(role)) {
        return error(res, "Valid role is required (USER or ADMIN)");
      }

      // Prevent self-demotion
      if (userId === user.userId && role !== "ADMIN") {
        return error(res, "You cannot demote yourself");
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        return notFound(res, "User not found");
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      return success(res, updatedUser);
    }

    // DELETE - Delete user
    if (req.method === "DELETE") {
      // Prevent self-deletion
      if (userId === user.userId) {
        return error(res, "You cannot delete yourself");
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        return notFound(res, "User not found");
      }

      // Delete user (cascade deletes wheels and spins)
      await prisma.user.delete({
        where: { id: userId },
      });

      return success(res, { message: "User deleted successfully" });
    }

    return methodNotAllowed(res);
  } catch (err) {
    return serverError(res, err);
  }
}
