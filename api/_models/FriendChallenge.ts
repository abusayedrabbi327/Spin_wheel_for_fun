import mongoose, { Document, Model } from "mongoose";

export type ChallengeStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "DECLINED" | "EXPIRED";

export interface IFriendChallenge extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  creatorUserId: mongoose.Types.ObjectId;
  opponentUserId: mongoose.Types.ObjectId;
  status: ChallengeStatus;
  creatorScore: number;
  opponentScore: number;
  winnerUserId?: mongoose.Types.ObjectId;
  expiresAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const friendChallengeSchema = new mongoose.Schema<IFriendChallenge>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    opponentUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "COMPLETED", "DECLINED", "EXPIRED"], default: "PENDING" },
    creatorScore: { type: Number, default: 0 },
    opponentScore: { type: Number, default: 0 },
    winnerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

friendChallengeSchema.index({ creatorUserId: 1, opponentUserId: 1, createdAt: -1 });
friendChallengeSchema.index({ opponentUserId: 1, status: 1 });
friendChallengeSchema.index({ expiresAt: 1 });

const FriendChallenge: Model<IFriendChallenge> =
  mongoose.models.FriendChallenge || mongoose.model<IFriendChallenge>("FriendChallenge", friendChallengeSchema);

export default FriendChallenge;
