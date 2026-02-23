import type { VercelRequest, VercelResponse } from "@vercel/node";
import prisma from "../_lib/prisma";
import { getUserFromRequest } from "../_lib/auth";
import { success, unauthorized, methodNotAllowed, serverError } from "../_lib/utils";

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

  try {
    const tokenPayload = getUserFromRequest(req);
    if (!tokenPayload) {
      return unauthorized(res);
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            wheels: true,
            spins: true,
          },
        },
      },
    });

    if (!user) {
      return unauthorized(res, "User not found");
    }

    return success(res, user);
  } catch (err) {
    return serverError(res, err);
  }
}
