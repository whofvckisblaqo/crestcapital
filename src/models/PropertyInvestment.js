import mongoose, { Schema } from "mongoose";

const PropertyInvestmentSchema = new Schema(
  {
    userId:         { type: Schema.Types.ObjectId, ref: "User",     required: true, index: true },
    propertyId:     { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    propertyTitle:  { type: String },
    amount:         { type: Number, required: true },
    annualReturn:   { type: Number, required: true },
    durationMonths: { type: Number, required: true },
    earningsSoFar:  { type: Number, default: 0 },
    startDate:      { type: Date,   default: Date.now },
    endDate:        { type: Date,   required: true },
    status:         { type: String, enum: ["active","completed","cancelled"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.PropertyInvestment ||
  mongoose.model("PropertyInvestment", PropertyInvestmentSchema);
