// POST /api/auth/verify-pin
// Checks a PIN against the stored hash — called after password login succeeds

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { email, pin } = await req.json();
    if (!email || !pin) return NextResponse.json({ error: "Email and PIN are required." }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).select("+pinHash");
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (!user.pinHash) {
      // No PIN set — allow through (new user who skipped PIN somehow)
      return NextResponse.json({ valid: true, noPinSet: true });
    }

    const valid = await bcrypt.compare(String(pin), user.pinHash);
    if (!valid) return NextResponse.json({ valid: false, error: "Incorrect PIN." }, { status: 401 });

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("[verify-pin]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
