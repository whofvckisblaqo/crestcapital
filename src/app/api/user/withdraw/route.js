// POST /api/user/withdraw — creates a pending withdrawal request
// Limits are read live from admin Settings.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Notification from "@/models/Notification";
import Settings          from "@/models/Settings";
import { notifyAdmins } from "@/lib/notifyAdmins";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount, coin, walletAddress } = await req.json();

    if (!amount || !coin || !walletAddress)
      return NextResponse.json({ error: "Amount, coin, and wallet address are required." }, { status: 400 });

    await connectDB();

    // Read limits from admin settings
    const settings    = await Settings.findOne({ key: "global" }).lean();
    const minWithdraw = settings?.minWithdraw ?? 50;
    const maxWithdraw = settings?.maxWithdraw ?? 500000;

    if (amount < minWithdraw)
      return NextResponse.json({ error: `Minimum withdrawal is $${minWithdraw.toLocaleString()}.` }, { status: 400 });
    if (amount > maxWithdraw)
      return NextResponse.json({ error: `Maximum withdrawal is $${maxWithdraw.toLocaleString()}.` }, { status: 400 });

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (user.balance < amount)
      return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });

    // Deduct balance immediately (held pending admin approval)
    user.balance -= amount;
    await user.save();

    const tx = await Transaction.create({
      userId:        user._id,
      type:          "withdrawal",
      amount,
      coin,
      walletAddress,
      status:        "pending",
    });

    await Notification.create({
      userId: user._id,
      title:  "Withdrawal Requested",
      body:   `Your withdrawal of $${amount.toLocaleString()} (${coin}) is pending admin approval.`,
      type:   "withdrawal",
    });

    await notifyAdmins(
      "New Withdrawal Request ⬆️",
      `${user.firstName} ${user.lastName} requested a withdrawal of $${amount.toLocaleString()} (${coin}) to wallet: ${walletAddress.slice(0, 16)}…`,
      "withdrawal"
    );

    return NextResponse.json({ message: "Withdrawal request submitted. Pending approval.", txId: tx.txId });
  } catch (err) {
    console.error("[withdraw]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
