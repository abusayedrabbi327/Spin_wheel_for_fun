import mongoose, { Document, Model } from "mongoose";

export interface IEventMissionProgress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  missionId: string;
  completedAt?: Date;
  rewardClaimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const eventMissionProgressSchema = new mongoose.Schema<IEventMissionProgress>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    missionId: { type: String, required: true, trim: true },
    completedAt: { type: Date },
    rewardClaimedAt: { type: Date },
  },
  { timestamps: true }
);

eventMissionProgressSchema.index({ userId: 1, eventId: 1, missionId: 1 }, { unique: true });

const EventMissionProgress: Model<IEventMissionProgress> =
  mongoose.models.EventMissionProgress || mongoose.model<IEventMissionProgress>("EventMissionProgress", eventMissionProgressSchema);

export default EventMissionProgress;
