import mongoose, { Schema } from "mongoose";

const PlanSchema = new Schema(
  {
    name:      { type: String, required: true, unique: true },
    rate:      { type: Number, required: true },   // daily % rate
    duration:  { type: Number, required: true },   // days
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    color:     { type: String, default: "#00d4ff" },
    active:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
