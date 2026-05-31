import mongoose, { Schema } from "mongoose";

const PropertySchema = new Schema(
  {
    title:          { type: String, required: true, trim: true },
    location:       { type: String, required: true, trim: true },
    type:           { type: String, enum: ["residential","commercial","land","mixed"], default: "residential" },
    description:    { type: String, default: "" },
    imageUrl:       { type: String, default: "" },   // base64 data-url or external URL
    targetAmount:   { type: Number, required: true },
    raisedAmount:   { type: Number, default: 0 },
    minInvestment:  { type: Number, required: true },
    annualReturn:   { type: Number, required: true }, // % per year
    durationMonths: { type: Number, required: true },
    investorCount:  { type: Number, default: 0 },
    active:         { type: Boolean, default: true },
    status:         { type: String, enum: ["open","funded","closed"], default: "open" },
    highlights:     [{ type: String }],              // e.g. ["Prime location","Gated community"]
  },
  { timestamps: true }
);

export default mongoose.models.Property || mongoose.model("Property", PropertySchema);
