import mongoose, { Document, Model } from "mongoose";

export type StickerRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";

export interface ISticker extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  name: string;
  batch: string;
  rarity: StickerRarity;
  pointsRequired: number;
  occasion?: string;
  isLifetimeExclusive: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const stickerSchema = new mongoose.Schema<ISticker>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    batch: { type: String, required: true, trim: true },
    rarity: { type: String, enum: ["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"], default: "COMMON" },
    pointsRequired: { type: Number, default: 0 },
    occasion: { type: String, trim: true },
    isLifetimeExclusive: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

stickerSchema.index({ code: 1 }, { unique: true });
stickerSchema.index({ pointsRequired: 1 });

const Sticker: Model<ISticker> =
  mongoose.models.Sticker || mongoose.model<ISticker>("Sticker", stickerSchema);

export default Sticker;
