import mongoose, { Document, Model } from "mongoose";

export interface IAIUsage extends Document {
  _id: mongoose.Types.ObjectId;
  dateKey: string;
  tokensUsed: number;
  requestCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const aiUsageSchema = new mongoose.Schema<IAIUsage>(
  {
    dateKey: { type: String, required: true, unique: true, trim: true },
    tokensUsed: { type: Number, default: 0 },
    requestCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

aiUsageSchema.index({ dateKey: 1 }, { unique: true });

const AIUsage: Model<IAIUsage> =
  mongoose.models.AIUsage || mongoose.model<IAIUsage>("AIUsage", aiUsageSchema);

export default AIUsage;
