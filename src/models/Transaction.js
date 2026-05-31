import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId:        { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:          { type: String, enum: ["deposit", "withdrawal", "earning", "referral"], required: true },
    amount:        { type: Number, required: true },
    coin:          { type: String, default: "" },
    planName:      { type: String, default: "-" },
    walletAddress:  { type: String, default: "" },   // for withdrawals
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for referral txns
    txHash:        { type: String, default: "-" },
    status:        { type: String, enum: ["pending", "completed", "rejected"], default: "pending" },
    adminNote:     { type: String, default: "" },
  },
  { timestamps: true }
);

// Human-readable ID: TXN + timestamp fragment
TransactionSchema.pre("save", function () {
  if (!this.txId) {
    this.txId = "TXN" + Date.now().toString().slice(-6);
  }
});

TransactionSchema.add({ txId: { type: String } });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
