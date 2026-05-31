import mongoose, { Schema } from "mongoose";

const InvestmentSchema = new Schema(
  {
    userId:        { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId:        { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    planName:      { type: String },
    amount:        { type: Number, required: true },
    rate:          { type: Number, required: true },    // daily % at time of investment
    duration:      { type: Number, required: true },   // days
    earningsSoFar: { type: Number, default: 0 },
    startDate:     { type: Date, default: Date.now },
    endDate:       { type: Date, required: true },
    status:        { type: String, enum: ["active", "completed", "cancelled", "frozen"], default: "active" },
  },
  { timestamps: true }
);

// Virtual: days left
InvestmentSchema.virtual("daysLeft").get(function () {
  const diff = Math.ceil((this.endDate - new Date()) / 86400000);
  return Math.max(diff, 0);
});

export default mongoose.models.Investment || mongoose.model("Investment", InvestmentSchema);
