// POST /api/auth/check-password
// Verifies email + password WITHOUT creating a session.
// The client proceeds to the PIN screen after this; the real NextAuth session
// is only created after the PIN is also verified.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +pinHash +status");

    if (!user)
      return NextResponse.json({ error: "No account found with that email." }, { status: 401 });

    if (user.status === "suspended")
      return NextResponse.json({ error: "Your account has been suspended. Please contact support." }, { status: 403 });

    // Admin accounts skip email verification (created by seed, not self-registration)
    if (!user.emailVerified && user.role !== "admin")
      return NextResponse.json({ error: "Please verify your email first.", needsVerification: true }, { status: 403 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });

    return NextResponse.json({ ok: true, hasPIN: !!user.pinHash });
  } catch (err) {
    console.error("[check-password]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
