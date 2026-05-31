import mongoose, { Schema } from "mongoose";

// Single-document settings store — always upsert the one doc with key "global"
const SettingsSchema = new Schema(
  {
    key:                 { type: String, default: "global", unique: true },
    siteName:            { type: String, default: "CrestCapital" },
    tagline:             { type: String, default: "Intelligent Yield on Your Terms" },
    maintenance:         { type: Boolean, default: false },
    minDeposit:          { type: Number, default: 100 },
    maxDeposit:          { type: Number, default: 1000000 },
    minWithdraw:         { type: Number, default: 50 },
    maxWithdraw:         { type: Number, default: 500000 },
    referralRate:        { type: Number, default: 8 },
    emailNotifs:         { type: Boolean, default: true },
    twoFARequired:       { type: Boolean, default: false },
    withdrawalApproval:  { type: Boolean, default: true },
    coins: {
      type: [{
        symbol:  { type: String },
        name:    { type: String },
        network: { type: String },
        active:  { type: Boolean, default: true },
        wallet:  { type: String, default: "" },
      }],
      default: [
        { symbol:"BTC",  name:"Bitcoin",  network:"Bitcoin Network", active:true,  wallet:"" },
        { symbol:"ETH",  name:"Ethereum", network:"ERC-20",          active:true,  wallet:"" },
        { symbol:"USDT", name:"Tether",   network:"TRC-20",          active:true,  wallet:"" },
        { symbol:"BNB",  name:"BNB",      network:"BSC",             active:true,  wallet:"" },
        { symbol:"SOL",  name:"Solana",   network:"Solana",          active:false, wallet:"" },
        { symbol:"XRP",  name:"Ripple",   network:"XRP Ledger",      active:false, wallet:"" },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
