// GET  /api/user/profile  — returns current user's profile
// PUT  /api/user/profile  — updates name/phone/country

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

export async function GET() {
  const session = await getUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.id).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id:             user._id.toString(),
    name:           `${user.firstName} ${user.lastName}`,
    firstName:      user.firstName,
    lastName:       user.lastName,
    email:          user.email,
    username:       user.username,
    avatar:         (user.firstName[0] + user.lastName[0]).toUpperCase(),
    phone:          user.phone || "",
    country:        user.country || "",
    balance:        user.balance,
    totalDeposited: user.totalDeposited,
    totalWithdrawn: user.totalWithdrawn,
    totalEarned:    user.totalEarned,
    referralBonus:  user.referralBonus,
    referralCode:   user.referralCode,
    referralLink:   `${process.env.NEXT_PUBLIC_APP_URL || "https://crestcapital.com"}/ref/${user.referralCode}`,
    kycStatus:      user.kycStatus,
    twoFAEnabled:   user.twoFAEnabled,
    role:           user.role,
    joined:         user.createdAt?.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    activePlan:     user.activePlan || "",
    activeInvestments: 0, // computed separately
  });
}

export async function PUT(req) {
  const session = await getUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { firstName, lastName, phone, country, twoFAEnabled } = await req.json();

  await connectDB();
  const update = {};
  if (firstName)              update.firstName    = firstName;
  if (lastName)               update.lastName     = lastName;
  if (phone  !== undefined)   update.phone        = phone;
  if (country !== undefined)  update.country      = country;
  if (twoFAEnabled !== undefined) update.twoFAEnabled = twoFAEnabled;

  const user = await User.findByIdAndUpdate(session.id, update, { new: true });

  return NextResponse.json({ message: "Profile updated.", name: `${user.firstName} ${user.lastName}` });
}
