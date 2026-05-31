// POST /api/user/invest — invest from balance into a plan
// Body: { planId, amount }
// Deducts from balance immediately and creates an active investment.

// GET /api/user/invest — returns all active plans available to invest in

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
import Settings from "@/models/Settings";
import Investment from "@/models/Investment";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const plans = await Plan.find({ active: true }).sort({ minAmount: 1 }).lean();

  return NextResponse.json(plans.map(p => ({
    id:       p._id.toString(),
    name:     p.name,
    rate:     p.rate,
    duration: p.duration,
    min:      p.minAmount,
    max:      p.maxAmount,
    color:    p.color,
  })));
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { planId, amount } = await req.json();

    if (!planId || !amount)
      return NextResponse.json({ error: "Plan and amount are required." }, { status: 400 });

    await connectDB();

    const [user, plan] = await Promise.all([
      User.findById(session.user.id),
      Plan.findById(planId),
    ]);

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (!plan || !plan.active) return NextResponse.json({ error: "Plan not found or inactive." }, { status: 404 });

    if (amount < plan.minAmount || amount > plan.maxAmount)
      return NextResponse.json({
        error: `Amount must be between $${plan.minAmount.toLocaleString()} and $${plan.maxAmount >= 999999 ? "unlimited" : plan.maxAmount.toLocaleString()}.`,
      }, { status: 400 });

    if (user.balance < amount)
      return NextResponse.json({ error: "Insufficient balance. Please deposit funds first." }, { status: 400 });

    // Deduct from balance
    user.balance    -= amount;
    user.activePlan  = plan.name;
    await user.save();

    // Create investment
    const startDate = new Date();
    const endDate   = new Date(startDate.getTime() + plan.duration * 86400000);

    const investment = await Investment.create({
      userId:   user._id,
      planId:   plan._id,
      planName: plan.name,
      amount,
      rate:     plan.rate,
      duration: plan.duration,
      startDate,
      endDate,
      status:   "active",
    });

    await Notification.create({
      userId: user._id,
      title:  "Investment Started 🚀",
      body:   `Your $${amount.toLocaleString()} investment in the ${plan.name} Plan has started. Expected daily return: $${(amount * plan.rate / 100).toFixed(2)}.`,
      type:   "earning",
    });

    // ── Referral credit (first investment only) ──────────────────────────────
    const isFirstInvestment = (await Investment.countDocuments({ userId: user._id })) === 1;
    if (isFirstInvestment && user.referredBy) {
      const settings     = await Settings.findOne({ key:"global" }).lean();
      const referralRate = (settings?.referralRate ?? 8) / 100;
      const commission   = +(amount * referralRate).toFixed(2);

      await User.findByIdAndUpdate(user.referredBy, {
        $inc: { balance: commission, referralBonus: commission },
      });

      await Transaction.create({
        userId:   user.referredBy,
        type:     "referral",
        amount:   commission,
        planName: plan.name,
        status:   "completed",
      });

      await Notification.create({
        userId: user.referredBy,
        title:  "Referral Commission Earned 🔗",
        body:   `You earned $${commission.toLocaleString()} referral commission from a new investor's first investment.`,
        type:   "referral",
      });
    }

    return NextResponse.json({
      message:      "Investment created successfully.",
      investmentId: investment._id.toString(),
    });
  } catch (err) {
    console.error("[invest]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
