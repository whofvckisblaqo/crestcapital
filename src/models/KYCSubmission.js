import mongoose, { Schema } from "mongoose";

const KYCSchema = new Schema(
  {
    userId:      { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    docType:     { type: String, required: true },
    docNumber:   { type: String, default: "" },
    country:     { type: String, default: "" },
    docFrontUrl: { type: String, default: "" },
    docBackUrl:  { type: String, default: "" },
    selfieUrl:   { type: String, default: "" },
    status:      { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminNote:   { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.KYCSubmission || mongoose.model("KYCSubmission", KYCSchema);
