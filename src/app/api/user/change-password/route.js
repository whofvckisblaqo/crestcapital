// POST /api/user/change-password
// Body: { currentPassword, newPassword }

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
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword)
      return NextResponse.json({ error: "Both fields are required." }, { status: 400 });
    if (newPassword.length < 8)
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    if (currentPassword === newPassword)
      return NextResponse.json({ error: "New password must be different from current password." }, { status: 400 });

    await connectDB();
    const user = await User.findById(session.user.id).select("+password");
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("[change-password]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
