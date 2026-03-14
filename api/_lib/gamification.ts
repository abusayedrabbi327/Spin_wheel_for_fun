import mongoose from "mongoose";
import UserProgress from "../_models/UserProgress.js";
import Sticker from "../_models/Sticker.js";
import UserSticker from "../_models/UserSticker.js";
import Event from "../_models/Event.js";
import EventMissionProgress from "../_models/EventMissionProgress.js";

export const XP_REWARDS = {
  DAILY_ACTIVE: 5,
  CREATE_WHEEL: 30,
  SPIN_PLAYED: 15,
  EVENT_MISSION_BASE: 20,
} as const;

const LEVEL_STEP = 120;

export function calculateLevelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / LEVEL_STEP) + 1);
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isYesterday(lastDate: Date, now: Date): boolean {
  const last = new Date(lastDate);
  last.setUTCHours(0, 0, 0, 0);

  const curr = new Date(now);
  curr.setUTCHours(0, 0, 0, 0);

  const diff = curr.getTime() - last.getTime();
  return diff === 24 * 60 * 60 * 1000;
}

export async function ensureUserProgress(userId: string) {
  const now = new Date();
  const progress = await UserProgress.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $setOnInsert: { userId: new mongoose.Types.ObjectId(userId), xp: 0, level: 1, streakDays: 0, totalSpins: 0, totalWheels: 0, totalSessions: 0 } },
    { new: true, upsert: true }
  );

  const last = progress.lastActiveDate;
  const sameDay = last && toDateKey(last) === toDateKey(now);

  if (!sameDay) {
    if (!last) {
      progress.streakDays = 1;
    } else if (isYesterday(last, now)) {
      progress.streakDays += 1;
    } else {
      progress.streakDays = 1;
    }

    progress.lastActiveDate = now;
    progress.totalSessions += 1;
    progress.xp += XP_REWARDS.DAILY_ACTIVE;
    progress.level = calculateLevelFromXp(progress.xp);
    await progress.save();
  }

  return progress;
}

export async function addXp(userId: string, amount: number) {
  const progress = await ensureUserProgress(userId);
  progress.xp += Math.max(0, amount);
  progress.level = calculateLevelFromXp(progress.xp);
  await progress.save();
  return progress;
}

export async function incrementUserMetric(userId: string, metric: "totalSpins" | "totalWheels", delta = 1) {
  const progress = await ensureUserProgress(userId);
  if (metric === "totalSpins") progress.totalSpins += Math.max(0, delta);
  if (metric === "totalWheels") progress.totalWheels += Math.max(0, delta);
  await progress.save();
  return progress;
}

const STICKER_SEED = [
  { code: "BATCH01_SPARK", name: "Spark Starter", batch: "Batch 01", rarity: "COMMON", pointsRequired: 20 },
  { code: "BATCH02_BUDDY", name: "Buddy Spinner", batch: "Batch 02", rarity: "COMMON", pointsRequired: 60 },
  { code: "BATCH03_TEAM", name: "Team Captain", batch: "Batch 03", rarity: "COMMON", pointsRequired: 120 },
  { code: "BATCH04_FAMILY", name: "Family Joy", batch: "Batch 04", rarity: "RARE", pointsRequired: 180 },
  { code: "BATCH05_WEEKLY", name: "Weekly Warrior", batch: "Batch 05", rarity: "RARE", pointsRequired: 260 },
  { code: "BATCH06_PARTY", name: "Party Pulse", batch: "Batch 06", rarity: "RARE", pointsRequired: 340 },
  { code: "BATCH07_SOCIAL", name: "Social Star", batch: "Batch 07", rarity: "EPIC", pointsRequired: 420 },
  { code: "BATCH08_MASTER", name: "Spin Master", batch: "Batch 08", rarity: "EPIC", pointsRequired: 520 },
  { code: "BATCH09_VETERAN", name: "Wheel Veteran", batch: "Batch 09", rarity: "EPIC", pointsRequired: 620 },
  { code: "BATCH10_LEGEND", name: "Friendship Legend", batch: "Batch 10", rarity: "LEGENDARY", pointsRequired: 760 },
  { code: "BATCH11_GLOW", name: "Glow Badge", batch: "Batch 11", rarity: "COMMON", pointsRequired: 840 },
  { code: "BATCH12_PULSE", name: "Pulse Badge", batch: "Batch 12", rarity: "COMMON", pointsRequired: 920 },
  { code: "BATCH13_ORBIT", name: "Orbit Badge", batch: "Batch 13", rarity: "RARE", pointsRequired: 1020 },
  { code: "BATCH14_COMET", name: "Comet Badge", batch: "Batch 14", rarity: "RARE", pointsRequired: 1140 },
  { code: "BATCH15_SOLAR", name: "Solar Crest", batch: "Batch 15", rarity: "EPIC", pointsRequired: 1260 },
  { code: "BATCH16_NOVA", name: "Nova Crest", batch: "Batch 16", rarity: "EPIC", pointsRequired: 1380 },
  { code: "BATCH17_CROWN", name: "Crown of Fun", batch: "Batch 17", rarity: "LEGENDARY", pointsRequired: 1520 },
  { code: "BATCH18_ELITE", name: "Elite Circle", batch: "Batch 18", rarity: "LEGENDARY", pointsRequired: 1660 },
  { code: "BATCH19_MYTH", name: "Mythic Vibe", batch: "Batch 19", rarity: "MYTHIC", pointsRequired: 1820 },
  { code: "BATCH20_INFINITY", name: "Infinite Joy", batch: "Batch 20", rarity: "MYTHIC", pointsRequired: 2000 },
] as const;

export async function ensureStickerCatalogSeeded() {
  const count = await Sticker.countDocuments();
  if (count > 0) return;

  await Sticker.insertMany(
    STICKER_SEED.map((item) => ({
      ...item,
      isLifetimeExclusive: item.rarity === "MYTHIC",
      active: true,
    }))
  );
}

export async function awardMilestoneStickers(userId: string, xp: number) {
  await ensureStickerCatalogSeeded();

  const eligible = await Sticker.find({ active: true, pointsRequired: { $lte: xp } }).lean();
  if (!eligible.length) return [] as string[];

  const owned = await UserSticker.find({ userId: new mongoose.Types.ObjectId(userId) }).select("stickerCode").lean();
  const ownedCodes = new Set(owned.map((s) => s.stickerCode));

  const newAwards = eligible.filter((s) => !ownedCodes.has(s.code));
  if (!newAwards.length) return [] as string[];

  await UserSticker.insertMany(
    newAwards.map((s) => ({
      userId: new mongoose.Types.ObjectId(userId),
      stickerId: s._id,
      stickerCode: s.code,
      source: "MILESTONE",
      obtainedAt: new Date(),
    }))
  );

  return newAwards.map((s) => s.code);
}

export async function ensureSeasonalEventsSeeded() {
  const existing = await Event.countDocuments();
  if (existing > 0) return;

  const year = new Date().getUTCFullYear();
  await Event.insertMany([
    {
      slug: `eid-${year}`,
      name: `Eid Joy Festival ${year}`,
      occasion: "Eid",
      startAt: new Date(Date.UTC(year, 2, 20)),
      endAt: new Date(Date.UTC(year, 3, 10)),
      isActive: true,
      oneTimeMythicStickerCode: "EID_MYTHIC_ONE",
      missions: [
        {
          missionId: "eid-spin-20",
          title: "Festival Spinner",
          description: "Complete 20 spins during the festival.",
          metric: "totalSpins",
          target: 20,
          rewardXp: 120,
          rewardStickerCode: "BATCH12_PULSE",
        },
        {
          missionId: "eid-wheel-3",
          title: "Host of Joy",
          description: "Create 3 wheels for family and friends.",
          metric: "totalWheels",
          target: 3,
          rewardXp: 100,
          rewardStickerCode: "BATCH14_COMET",
        },
      ],
    },
    {
      slug: `puja-${year}`,
      name: `Puja Celebration ${year}`,
      occasion: "Puja",
      startAt: new Date(Date.UTC(year, 8, 20)),
      endAt: new Date(Date.UTC(year, 9, 10)),
      isActive: true,
      oneTimeMythicStickerCode: "PUJA_MYTHIC_ONE",
      missions: [
        {
          missionId: "puja-spin-25",
          title: "Celebration Spinner",
          description: "Complete 25 spins during Puja event.",
          metric: "totalSpins",
          target: 25,
          rewardXp: 130,
          rewardStickerCode: "BATCH15_SOLAR",
        },
      ],
    },
  ]);
}

export async function evaluateActiveEventProgress(userId: string) {
  await ensureSeasonalEventsSeeded();
  const now = new Date();

  const activeEvent = await Event.findOne({ isActive: true, startAt: { $lte: now }, endAt: { $gte: now } }).lean();
  if (!activeEvent) return { activeEvent: null, completedMissionIds: [] as string[], grantedStickerCodes: [] as string[] };

  const progress = await ensureUserProgress(userId);
  const completedMissionIds: string[] = [];
  const grantedStickerCodes: string[] = [];

  for (const mission of activeEvent.missions) {
    const metricValue =
      mission.metric === "totalSpins"
        ? progress.totalSpins
        : mission.metric === "totalWheels"
          ? progress.totalWheels
          : progress.streakDays;

    if (metricValue < mission.target) continue;

    const existing = await EventMissionProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      eventId: activeEvent._id,
      missionId: mission.missionId,
    });

    if (!existing) {
      await EventMissionProgress.create({
        userId: new mongoose.Types.ObjectId(userId),
        eventId: activeEvent._id,
        missionId: mission.missionId,
        completedAt: new Date(),
        rewardClaimedAt: new Date(),
      });

      if (mission.rewardXp > 0) {
        await addXp(userId, mission.rewardXp + XP_REWARDS.EVENT_MISSION_BASE);
      }

      if (mission.rewardStickerCode) {
        const sticker = await Sticker.findOne({ code: mission.rewardStickerCode, active: true });
        if (sticker) {
          const alreadyOwned = await UserSticker.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            stickerCode: sticker.code,
          });

          if (!alreadyOwned) {
            await UserSticker.create({
              userId: new mongoose.Types.ObjectId(userId),
              stickerId: sticker._id,
              stickerCode: sticker.code,
              source: "EVENT",
              eventId: activeEvent._id,
              obtainedAt: new Date(),
            });
            grantedStickerCodes.push(sticker.code);
          }
        }
      }
    }

    completedMissionIds.push(mission.missionId);
  }

  return { activeEvent, completedMissionIds, grantedStickerCodes };
}
