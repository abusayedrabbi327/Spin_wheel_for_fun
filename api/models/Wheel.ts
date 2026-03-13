import mongoose, { Document, Model } from "mongoose";

export interface IWheelItem {
    _id: mongoose.Types.ObjectId;
    label: string;
    value?: string;
    order: number;
}

export interface IWheel extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    type: "NAMES" | "NUMBERS" | "DECISIONS" | "PRIZES" | "FOOD" | "CUSTOM";
    maxSpins?: number;
    expiryDate?: Date;
    allowBetterLuck: boolean;
    isActive: boolean;
    userId: mongoose.Types.ObjectId;
    items: IWheelItem[];
    createdAt: Date;
    updatedAt: Date;
}

const wheelItemSchema = new mongoose.Schema<IWheelItem>(
    {
        label: { type: String, required: true },
        value: { type: String },
        order: { type: Number, default: 0 },
    },
    { _id: true }
);

const wheelSchema = new mongoose.Schema<IWheel>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        type: {
            type: String,
            enum: ["NAMES", "NUMBERS", "DECISIONS", "PRIZES", "FOOD", "CUSTOM"],
            default: "CUSTOM",
        },
        maxSpins: { type: Number },
        expiryDate: { type: Date },
        allowBetterLuck: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [wheelItemSchema],
    },
    { timestamps: true }
);

const Wheel: Model<IWheel> =
    mongoose.models.Wheel || mongoose.model<IWheel>("Wheel", wheelSchema);

export default Wheel;
