// POST /api/auth/forgot-password  — sends a 6-digit reset OTP
// POST /api/auth/forgot-password?action=verify  — verifies OTP
// POST /api/auth/forgot-password?action=reset   — sets new password

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action"); // null | "verify" | "reset"

  try {
    await connectDB();
    const body = await req.json();

    // ── Step 1: Send reset OTP ────────────────────────────────────────────────
    if (!action) {
      const { email } = body;
      if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

      const user = await User.findOne({ email: email.toLowerCase() });
      // Always return success to prevent email enumeration
      if (!user) return NextResponse.json({ message: "If that email exists, a code has been sent." });

      const otp       = String(Math.floor(100000 + Math.random() * 900000));
      user.resetTokenHash   = await bcrypt.hash(otp, 10);
      user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendOTPEmail({ to: user.email, name: user.firstName, otp, subject: "Your CrestCapital password reset code" });
      return NextResponse.json({ message: "If that email exists, a code has been sent." });
    }

    // ── Step 2: Verify reset OTP ──────────────────────────────────────────────
    if (action === "verify") {
      const { email, otp } = body;
      const user = await User.findOne({ email: email?.toLowerCase() }).select("+resetTokenHash +resetTokenExpiry");

      if (!user?.resetTokenHash) return NextResponse.json({ error: "No reset in progress." }, { status: 400 });
      if (user.resetTokenExpiry < new Date()) return NextResponse.json({ error: "Code expired." }, { status: 410 });

      const valid = await bcrypt.compare(String(otp), user.resetTokenHash);
      if (!valid) return NextResponse.json({ error: "Incorrect code." }, { status: 401 });

      return NextResponse.json({ message: "Code verified.", email: user.email });
    }

    // ── Step 3: Set new password ──────────────────────────────────────────────
    if (action === "reset") {
      const { email, otp, newPassword } = body;
      if (!newPassword || newPassword.length < 8)
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

      const user = await User.findOne({ email: email?.toLowerCase() }).select("+resetTokenHash +resetTokenExpiry +password");

      if (!user?.resetTokenHash) return NextResponse.json({ error: "No reset in progress." }, { status: 400 });
      if (user.resetTokenExpiry < new Date()) return NextResponse.json({ error: "Session expired. Please start over." }, { status: 410 });

      const valid = await bcrypt.compare(String(otp), user.resetTokenHash);
      if (!valid) return NextResponse.json({ error: "Invalid token." }, { status: 401 });

      user.password         = await bcrypt.hash(newPassword, 12);
      user.resetTokenHash   = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      return NextResponse.json({ message: "Password reset successfully." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
