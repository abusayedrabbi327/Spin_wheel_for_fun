import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import User from "../models/User.js";
import Wheel from "../models/Wheel.js";
import Spin from "../models/Spin.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { success, unauthorized, methodNotAllowed, serverError } from "../_lib/utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return methodNotAllowed(res);

  try {
    await connectDB();

    const tokenPayload = getUserFromRequest(req);
    if (!tokenPayload) return unauthorized(res);

    const user = await User.findById(tokenPayload.userId).select("-password");
    if (!user) return unauthorized(res, "User not found");

    const [wheelCount, spinCount] = await Promise.all([
      Wheel.countDocuments({ userId: user._id }),
      Spin.countDocuments({ userId: user._id }),
    ]);

    return success(res, {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      _count: { wheels: wheelCount, spins: spinCount },
    });
  } catch (err) {
    return serverError(res, err);
  }
}
