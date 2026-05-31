// POST /api/auth/verify-otp
// Verifies the 6-digit email OTP, marks email as verified

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return NextResponse.json({ error: "Email and code are required." }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).select("+otpHash +otpExpiry");

    if (!user)       return NextResponse.json({ error: "No account found." }, { status: 404 });
    if (!user.otpHash) return NextResponse.json({ error: "No OTP pending. Please register first." }, { status: 400 });
    if (user.otpExpiry < new Date()) return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 410 });

    const valid = await bcrypt.compare(String(otp), user.otpHash);
    if (!valid) return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 401 });

    // Mark verified, clear OTP
    user.emailVerified = true;
    user.otpHash       = undefined;
    user.otpExpiry     = undefined;
    await user.save();

    return NextResponse.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// POST /api/auth/verify-otp/resend — resend a fresh OTP
export async function PUT(req) {
  try {
    const { email } = await req.json();
    await connectDB();
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.emailVerified)
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    const { sendOTPEmail } = await import("@/lib/email");
    const bcryptLib = await import("bcryptjs");
    const otp       = String(Math.floor(100000 + Math.random() * 900000));
    user.otpHash    = await bcryptLib.default.hash(otp, 10);
    user.otpExpiry  = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail({ to: user.email, name: user.firstName, otp });
    return NextResponse.json({ message: "New code sent." });
  } catch (err) {
    return NextResponse.json({ error: "Could not resend." }, { status: 500 });
  }
}
