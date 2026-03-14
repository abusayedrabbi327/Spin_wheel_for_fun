import mongoose, { Document, Model } from "mongoose";

export interface IAbuseProfile extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  score: number;
  blockedUntil?: Date;
  lastSeenAt: Date;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const abuseProfileSchema = new mongoose.Schema<IAbuseProfile>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    score: { type: Number, default: 0 },
    blockedUntil: { type: Date },
    lastSeenAt: { type: Date, default: Date.now },
    reason: { type: String, trim: true },
  },
  { timestamps: true }
);

abuseProfileSchema.index({ key: 1 }, { unique: true });

const AbuseProfile: Model<IAbuseProfile> =
  mongoose.models.AbuseProfile || mongoose.model<IAbuseProfile>("AbuseProfile", abuseProfileSchema);

export default AbuseProfile;
