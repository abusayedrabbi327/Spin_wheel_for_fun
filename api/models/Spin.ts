import mongoose, { Document, Model } from "mongoose";

export interface ISpin extends Document {
    _id: mongoose.Types.ObjectId;
    wheelId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    participantName: string;
    participantPhone?: string;
    result: string;
    createdAt: Date;
}

const spinSchema = new mongoose.Schema<ISpin>(
    {
        wheelId: { type: mongoose.Schema.Types.ObjectId, ref: "Wheel", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        participantName: { type: String, default: "Anonymous" },
        participantPhone: { type: String },
        result: { type: String, required: true },
    },
    { timestamps: true }
);

const Spin: Model<ISpin> =
    mongoose.models.Spin || mongoose.model<ISpin>("Spin", spinSchema);

export default Spin;
