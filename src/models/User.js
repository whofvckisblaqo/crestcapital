import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    firstName:    { type: String, required: true, trim: true },
    lastName:     { type: String, required: true, trim: true },
    username:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true, select: false },
    phone:        { type: String, default: "" },
    country:      { type: String, default: "" },
    role:         { type: String, enum: ["user", "admin"], default: "user" },

    // Financials
    balance:          { type: Number, default: 0 },
    totalDeposited:   { type: Number, default: 0 },
    totalWithdrawn:   { type: Number, default: 0 },
    totalEarned:      { type: Number, default: 0 },
    referralBonus:    { type: Number, default: 0 },

    // Auth extras
    pinHash:           { type: String, select: false },
    emailVerified:     { type: Boolean, default: false },
    otpHash:           { type: String, select: false },
    otpExpiry:         { type: Date },
    resetTokenHash:    { type: String, select: false },
    resetTokenExpiry:  { type: Date },

    // Account status (for admin suspend/reinstate)
    status:     { type: String, enum: ["active", "suspended"], default: "active" },

    // KYC
    kycStatus:  { type: String, enum: ["unverified", "pending", "verified"], default: "unverified" },

    // Referrals
    referralCode: { type: String, unique: true },
    referredBy:   { type: Schema.Types.ObjectId, ref: "User" },

    // Settings
    twoFAEnabled: { type: Boolean, default: false },
    activePlan:   { type: String, default: "" },
  },
  { timestamps: true }
);

// Virtual: full name
UserSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Generate referral code before saving if not present
UserSchema.pre("save", function () {
  if (!this.referralCode) {
    this.referralCode = this.firstName.toUpperCase().slice(0, 4) +
      Math.random().toString(36).slice(2, 6).toUpperCase();
  }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
