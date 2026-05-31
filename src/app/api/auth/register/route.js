// POST /api/auth/register
// Creates a new user, generates + emails a 6-digit OTP

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const { firstName, lastName, username, email, phone, password, referralCode } = await req.json();

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!firstName || !lastName || !username || !email || !password)
      return NextResponse.json({ error: "All required fields must be provided." }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    await connectDB();

    // Check duplicates
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? "email" : "username";
      return NextResponse.json({ error: `That ${field} is already registered.` }, { status: 409 });
    }

    // ── Referral ───────────────────────────────────────────────────────────────
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) referredBy = referrer._id;
    }

    // ── Hash password ──────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Generate OTP (6 digits) ────────────────────────────────────────────────
    const otp      = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash  = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // ── Create user ────────────────────────────────────────────────────────────
    const user = await User.create({
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      username:  username.toLowerCase().trim(),
      email:     email.toLowerCase().trim(),
      password:  hashedPassword,
      phone:     phone || "",
      referredBy,
      otpHash,
      otpExpiry,
      emailVerified: false,
    });

    // ── Send OTP email ─────────────────────────────────────────────────────────
    await sendOTPEmail({
      to:      user.email,
      name:    user.firstName,
      otp,
      subject: "Your CrestCapital email verification code",
    });

    return NextResponse.json({
      message: "Account created. Check your email for the verification code.",
      email:   user.email,
      userId:  user._id.toString(),
    });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
