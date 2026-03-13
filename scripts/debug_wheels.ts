import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
}

mongoose.connect(uri)
    .then(async () => {
        console.log("Connected to MongoDB for debugging");

        // Quick schema reference
        const wheelSchema = new mongoose.Schema({}, { strict: false });
        const Wheel = mongoose.models.Wheel || mongoose.model("Wheel", wheelSchema);

        // Get the 3 most recent wheels
        const recentWheels = await Wheel.find().sort({ createdAt: -1 }).limit(3).lean();

        console.log("\n--- RECENT WHEELS ---");
        for (const w of recentWheels) {
            console.log(`Title: ${w.title}`);
            console.log(`Slug: ${w.slug}`);
            console.log(`isActive: ${w.isActive}`);
            console.log(`expiryDate: ${w.expiryDate} (type: ${typeof w.expiryDate})`);
            console.log(`createdAt: ${w.createdAt}`);
            console.log(`Current Date Context: ${new Date()}`);
            if (w.expiryDate) {
                console.log(`Is Expired evaluated: ${new Date(w.expiryDate) < new Date()}`);
            }
            console.log("-------------------");
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
