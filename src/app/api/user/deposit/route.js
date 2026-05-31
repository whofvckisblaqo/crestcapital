// POST /api/user/deposit — submit a crypto deposit request (limits from admin Settings)
// GET  /api/user/deposit — wallet addresses from admin-managed Settings

import { NextResponse }  from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }   from "@/lib/auth";
import { connectDB }     from "@/lib/mongodb";
import User              from "@/models/User";
import Transaction       from "@/models/Transaction";
import Settings          from "@/models/Settings";
import { notifyAdmins }          from "@/lib/notifyAdmins";
import { sendTransactionEmail } from "@/lib/email";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount, coin } = await req.json();

    if (!amount || !coin)
      return NextResponse.json({ error: "Amount and coin are required." }, { status: 400 });

    await connectDB();

    // Read limits from admin settings
    const settings   = await Settings.findOne({ key: "global" }).lean();
    const minDeposit = settings?.minDeposit ?? 100;
    const maxDeposit = settings?.maxDeposit ?? 1000000;

    if (amount < minDeposit)
      return NextResponse.json({ error: `Minimum deposit is $${minDeposit.toLocaleString()}.` }, { status: 400 });
    if (amount > maxDeposit)
      return NextResponse.json({ error: `Maximum deposit is $${maxDeposit.toLocaleString()}.` }, { status: 400 });

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const tx = await Transaction.create({
      userId: user._id,
      type:   "deposit",
      amount,
      coin,
      status: "pending",
    });

    const userName = `${user.firstName} ${user.lastName}`;
    await notifyAdmins(
      "New Deposit Request 💰",
      `${userName} submitted a deposit of $${amount.toLocaleString()} (${coin}). Awaiting approval.`,
      "deposit"
    );

    // Email user
    sendTransactionEmail({
      to: user.email, name: user.firstName,
      type: "deposit-pending", amount, coin,
    }).catch(() => {});

    return NextResponse.json({
      message: "Deposit request submitted. Your balance will be credited once admin approves.",
      txId:    tx.txId,
    });
  } catch (err) {
    console.error("[deposit]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const settings = await Settings.findOne({ key: "global" }).lean();

  const coins = ((settings?.coins) || [])
    .filter(c => c.active && c.wallet)
    .map(c => ({
      id:      c.symbol.toLowerCase(),
      symbol:  c.symbol,
      name:    c.name,
      network: c.network || c.symbol,
      address: c.wallet,
    }));

  return NextResponse.json(coins);
}
