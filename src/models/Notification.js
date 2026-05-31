import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", index: true }, // null = admin-only
    title:   { type: String, required: true },
    body:    { type: String, required: true },
    type:    { type: String, enum: ["earning", "deposit", "withdrawal", "referral", "security", "system", "info"], default: "info" },
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
