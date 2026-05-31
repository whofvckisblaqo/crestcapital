// POST /api/admin/seed
// One-time setup: creates the admin user + default investment plans.
// Call this once after configuring your .env.local

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";

const DEFAULT_PLANS = [
  { name:"Starter",  rate:0.9,  duration:10, minAmount:100,   maxAmount:999,    color:"#00a8cc" },
  { name:"Growth",   rate:1.4,  duration:15, minAmount:1000,  maxAmount:4999,   color:"#00d4ff" },
  { name:"Advanced", rate:2.0,  duration:21, minAmount:5000,  maxAmount:19999,  color:"#00e096" },
  { name:"Premium",  rate:3.5,  duration:30, minAmount:20000, maxAmount:999999, color:"#f0c040" },
];

export async function POST(req) {
  // Basic security: require a seed key or only allow in development
  const authHeader = req.headers.get("authorization");
  const seedKey    = process.env.NEXTAUTH_SECRET || "seed";
  if (authHeader !== `Bearer ${seedKey}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // ── Create admin user ─────────────────────────────────────────────────────
    const adminEmail    = process.env.ADMIN_EMAIL    || "admin@crestcapital.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

    const existingAdmin = await User.findOne({ email: adminEmail });
    let adminCreated = false;

    if (!existingAdmin) {
      const hashed = await bcrypt.hash(adminPassword, 12);
      await User.create({
        firstName:     "Super",
        lastName:      "Admin",
        username:      "superadmin",
        email:         adminEmail,
        password:      hashed,
        role:          "admin",
        emailVerified: true,
        kycStatus:     "verified",
      });
      adminCreated = true;
    }

    // ── Seed default plans ────────────────────────────────────────────────────
    const plansCreated = [];
    for (const plan of DEFAULT_PLANS) {
      const exists = await Plan.findOne({ name: plan.name });
      if (!exists) {
        await Plan.create(plan);
        plansCreated.push(plan.name);
      }
    }

    return NextResponse.json({
      message:      "Seed complete.",
      adminCreated,
      adminEmail,
      plansCreated,
      note: adminCreated
        ? `Admin login: ${adminEmail} / ${adminPassword} — change this password immediately!`
        : "Admin already exists.",
    });
  } catch (err) {
    console.error("[seed]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
