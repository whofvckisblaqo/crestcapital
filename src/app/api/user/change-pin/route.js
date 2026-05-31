// POST /api/user/change-pin
// Body: { currentPin, newPin }

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { currentPin, newPin } = await req.json();

    if (!currentPin || !newPin)
      return NextResponse.json({ error: "Both fields are required." }, { status: 400 });
    if (String(newPin).length !== 5 || !/^\d{5}$/.test(String(newPin)))
      return NextResponse.json({ error: "PIN must be exactly 5 digits." }, { status: 400 });
    if (currentPin === newPin)
      return NextResponse.json({ error: "New PIN must be different from current PIN." }, { status: 400 });

    await connectDB();
    const user = await User.findById(session.user.id).select("+pinHash");
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (!user.pinHash) return NextResponse.json({ error: "No PIN set on this account." }, { status: 400 });

    const valid = await bcrypt.compare(String(currentPin), user.pinHash);
    if (!valid) return NextResponse.json({ error: "Current PIN is incorrect." }, { status: 401 });

    user.pinHash = await bcrypt.hash(String(newPin), 12);
    await user.save();

    return NextResponse.json({ message: "PIN updated successfully." });
  } catch (err) {
    console.error("[change-pin]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
