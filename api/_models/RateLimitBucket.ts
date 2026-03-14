import mongoose, { Document, Model } from "mongoose";

export interface IRateLimitBucket extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  count: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const rateLimitBucketSchema = new mongoose.Schema<IRateLimitBucket>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

rateLimitBucketSchema.index({ key: 1 }, { unique: true });
rateLimitBucketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimitBucket: Model<IRateLimitBucket> =
  mongoose.models.RateLimitBucket || mongoose.model<IRateLimitBucket>("RateLimitBucket", rateLimitBucketSchema);

export default RateLimitBucket;
