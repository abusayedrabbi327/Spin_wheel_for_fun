import mongoose, { Document, Model } from "mongoose";

export interface IEventMission {
  missionId: string;
  title: string;
  description: string;
  metric: "totalSpins" | "totalWheels" | "streakDays";
  target: number;
  rewardXp: number;
  rewardStickerCode?: string;
}

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  slug: string;
  name: string;
  occasion: string;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
  missions: IEventMission[];
  oneTimeMythicStickerCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventMissionSchema = new mongoose.Schema<IEventMission>(
  {
    missionId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    metric: { type: String, enum: ["totalSpins", "totalWheels", "streakDays"], required: true },
    target: { type: Number, required: true },
    rewardXp: { type: Number, default: 0 },
    rewardStickerCode: { type: String, trim: true, uppercase: true },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema<IEvent>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    occasion: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    missions: { type: [eventMissionSchema], default: [] },
    oneTimeMythicStickerCode: { type: String, trim: true, uppercase: true },
  },
  { timestamps: true }
);

eventSchema.index({ slug: 1 }, { unique: true });
eventSchema.index({ startAt: 1, endAt: 1, isActive: 1 });

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;
