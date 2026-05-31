// POST /api/auth/set-pin
// Stores a hashed 5-digit PIN for the user after email verification

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const { email, pin } = await req.json();

    if (!email || !pin) return NextResponse.json({ error: "Email and PIN required." }, { status: 400 });
    if (!/^\d{5}$/.test(String(pin))) return NextResponse.json({ error: "PIN must be exactly 5 digits." }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)             return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (!user.emailVerified) return NextResponse.json({ error: "Email not verified." }, { status: 403 });

    user.pinHash = await bcrypt.hash(String(pin), 12);
    await user.save();

    // Send welcome email now that account is fully set up
    sendWelcomeEmail({ to: user.email, name: user.firstName }).catch(() => {});

    return NextResponse.json({ message: "PIN set successfully." });
  } catch (err) {
    console.error("[set-pin]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
