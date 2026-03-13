import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../_lib/mongodb.js";
import Wheel from "../_models/Wheel.js";
import Spin from "../_models/Spin.js";
import { getUserFromRequest } from "../_lib/auth.js";
import { success, error, notFound, unauthorized, methodNotAllowed, serverError } from "../_lib/utils.js";
import mongoose from "mongoose";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();

    const user = getUserFromRequest(req);
    if (!user || user.role !== "ADMIN") return unauthorized(res, "Admin access required");

    try {
        await connectDB();

        // GET - List all wheels with spin counts and owner info
        if (req.method === "GET") {
            const { limit, offset, search, status } = req.query;

            const take = limit ? parseInt(Array.isArray(limit) ? limit[0] : limit) : 20;
            const skip = offset ? parseInt(Array.isArray(offset) ? offset[0] : offset) : 0;
            const searchStr = Array.isArray(search) ? search[0] : search;
            const statusStr = Array.isArray(status) ? status[0] : status;

            const query: any = {};

            if (searchStr) {
                query.title = { $regex: searchStr, $options: "i" };
            }

            if (statusStr && statusStr !== "All") {
                if (statusStr === "Active") query.isActive = true;
                if (statusStr === "Inactive" || statusStr === "Closed") query.isActive = false;
            }

            const [wheels, total] = await Promise.all([
                Wheel.find(query).populate("userId", "name email").sort({ createdAt: -1 }).skip(skip).limit(take).lean(),
                Wheel.countDocuments(query),
            ]);

            const wheelsWithData = await Promise.all(
                wheels.map(async (w: any) => {
                    const spinCount = await Spin.countDocuments({ wheelId: w._id });
                    return {
                        id: w._id.toString(),
                        title: w.title,
                        slug: w.slug,
                        type: w.type,
                        isActive: w.isActive,
                        itemCount: w.items?.length || 0,
                        allowBetterLuck: w.allowBetterLuck,
                        createdAt: w.createdAt,
                        owner: w.userId, // Populated object { _id, name, email }
                        totalSpins: spinCount,
                    };
                })
            );

            return success(res, { wheels: wheelsWithData, total, limit: take, offset: skip });
        }

        return methodNotAllowed(res);
    } catch (err) {
        return serverError(res, err);
    }
}
