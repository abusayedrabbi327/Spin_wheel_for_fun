import mongoose, { Document, Model } from "mongoose";

export interface IUserSticker extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  stickerId: mongoose.Types.ObjectId;
  stickerCode: string;
  source: "MILESTONE" | "EVENT" | "ADMIN";
  eventId?: mongoose.Types.ObjectId;
  obtainedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userStickerSchema = new mongoose.Schema<IUserSticker>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stickerId: { type: mongoose.Schema.Types.ObjectId, ref: "Sticker", required: true },
    stickerCode: { type: String, required: true, uppercase: true, trim: true },
    source: { type: String, enum: ["MILESTONE", "EVENT", "ADMIN"], default: "MILESTONE" },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    obtainedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userStickerSchema.index({ userId: 1, stickerId: 1 }, { unique: true });
userStickerSchema.index({ userId: 1, stickerCode: 1 }, { unique: true });

const UserSticker: Model<IUserSticker> =
  mongoose.models.UserSticker || mongoose.model<IUserSticker>("UserSticker", userStickerSchema);

export default UserSticker;
