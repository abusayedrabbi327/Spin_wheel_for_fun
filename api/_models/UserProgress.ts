import mongoose, { Document, Model } from "mongoose";

export interface IUserProgress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate?: Date;
  totalSpins: number;
  totalWheels: number;
  totalSessions: number;
  updatedAt: Date;
  createdAt: Date;
}

const userProgressSchema = new mongoose.Schema<IUserProgress>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    totalSpins: { type: Number, default: 0 },
    totalWheels: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userProgressSchema.index({ userId: 1 }, { unique: true });

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress || mongoose.model<IUserProgress>("UserProgress", userProgressSchema);

export default UserProgress;
