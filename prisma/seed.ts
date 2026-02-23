import * as dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");
  console.log("Connecting to:", process.env.DATABASE_URL?.substring(0, 50) + "...");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("✅ Connected to database");

  // Create admin user
  const adminPassword = await bcrypt.hash("sayed@admin_327", 12);
  const adminResult = await client.query(
    `INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET password = $2, "updatedAt" = NOW()
     RETURNING email`,
    ["abusayed102188@gmail.com", adminPassword, "Admin", "ADMIN"]
  );
  
  if (adminResult.rowCount && adminResult.rowCount > 0) {
    console.log("✅ Admin user created/updated: abusayed102188@gmail.com");
  } else {
    console.log("ℹ️  Admin user update failed");
  }

  // Create demo user
  const userPassword = await bcrypt.hash("demo123", 12);
  const demoResult = await client.query(
    `INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email`,
    ["demo@spinwheel.com", userPassword, "Demo User", "USER"]
  );

  if (demoResult.rowCount && demoResult.rowCount > 0) {
    console.log("✅ Demo user created: demo@spinwheel.com");
    
    const demoUserId = demoResult.rows[0].id;

    // Create sample wheels for demo user
    const sampleWheels = [
      {
        title: "Pizza Night Choices",
        slug: "pizza-night-choices",
        type: "FOOD",
        items: ["Pepperoni", "Margherita", "BBQ Chicken", "Hawaiian", "Veggie Supreme", "Meat Lovers"],
      },
      {
        title: "Team Lunch Decision",
        slug: "team-lunch-decision",
        type: "DECISIONS",
        items: ["Indian", "Chinese", "Mexican", "Italian", "Thai", "Japanese"],
      },
      {
        title: "Lucky Draw Winners",
        slug: "lucky-draw-winners",
        type: "NAMES",
        items: ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"],
      },
    ];

    for (const wheelData of sampleWheels) {
      const wheelResult = await client.query(
        `INSERT INTO "Wheel" (id, title, slug, type, "userId", "isActive", "allowBetterLuck", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, true, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING
         RETURNING id, title`,
        [wheelData.title, wheelData.slug, wheelData.type, demoUserId]
      );

      if (wheelResult.rowCount && wheelResult.rowCount > 0) {
        const wheelId = wheelResult.rows[0].id;
        
        // Insert items
        for (let i = 0; i < wheelData.items.length; i++) {
          await client.query(
            `INSERT INTO "WheelItem" (id, label, "order", "wheelId")
             VALUES (gen_random_uuid(), $1, $2, $3)`,
            [wheelData.items[i], i, wheelId]
          );
        }
        console.log("✅ Sample wheel created:", wheelData.title);
      }
    }
  } else {
    console.log("ℹ️  Demo user already exists");
  }

  await client.end();
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  });
