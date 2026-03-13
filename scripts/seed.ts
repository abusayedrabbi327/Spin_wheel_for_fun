import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@spinwheel.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in .env");
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
        if (existing) {
            console.log(`ℹ️  Admin user already exists: ${ADMIN_EMAIL}`);
        } else {
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
            await User.create({
                email: ADMIN_EMAIL.toLowerCase(),
                password: hashedPassword,
                name: "Admin",
                role: "ADMIN",
            });
            console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
        }
    } catch (err) {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    }
}

seed();
