// GET /api/user/referrals — returns the user's referral stats and list

import { NextResponse }   from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }    from "@/lib/auth";
import { connectDB }      from "@/lib/mongodb";
import User               from "@/models/User";
import Transaction        from "@/models/Transaction";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Everyone who signed up using this user's referral code
  const referred = await User.find({ referredBy: user._id })
    .select("firstName lastName email createdAt totalDeposited status")
    .sort({ createdAt: -1 })
    .lean();

  // All referral earnings transactions for this user
  const earnings = await Transaction.find({ userId: user._id, type: "referral" })
    .sort({ createdAt: -1 })
    .lean();

  const totalEarned = earnings.reduce((s, t) => s + t.amount, 0);

  const list = referred.map(r => {
    // Mask email: j***@gmail.com
    const [local, domain] = (r.email || "").split("@");
    const masked = local.length > 2
      ? local[0] + "***@" + domain
      : "***@" + (domain || "");

    // Sum what this referrer earned from this specific person
    const earned = earnings
      .filter(e => e.referredUserId?.toString() === r._id.toString())
      .reduce((s, e) => s + e.amount, 0);

    return {
      name:      `${r.firstName} ${r.lastName[0]}.`,
      email:     masked,
      date:      new Date(r.createdAt).toISOString().split("T")[0],
      deposited: r.totalDeposited || 0,
      earned,
      status:    r.status === "suspended" ? "inactive" : (r.totalDeposited > 0 ? "active" : "pending"),
    };
  });

  return NextResponse.json({
    referralCode:  user.referralCode,
    referralBonus: user.referralBonus || 0,
    totalReferrals: referred.length,
    totalEarned,
    referrals: list,
  });
}
