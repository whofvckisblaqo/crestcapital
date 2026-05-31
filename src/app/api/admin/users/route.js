// GET  /api/admin/users                       — list all users
// GET  /api/admin/users?investments=userId    — list a user's active/frozen investments
// PUT  /api/admin/users?id=X                 — suspend / reinstate / verifyKYC / creditBalance / cancelInvestment / freezeInvestment / unfreezeInvestment

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Investment from "@/models/Investment";
import Transaction from "@/models/Transaction";
import Notification from "@/models/Notification";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();

  // ── Return investments for a specific user ──────────────────────────────────
  const { searchParams } = new URL(req.url);
  const investmentsUserId = searchParams.get("investments");
  if (investmentsUserId) {
    const investments = await Investment.find({
      userId: investmentsUserId,
      status: { $in: ["active", "frozen"] },
    }).lean();
    return NextResponse.json(
      investments.map(inv => ({
        id:           inv._id.toString(),
        planName:     inv.planName || "—",
        amount:       inv.amount,
        rate:         inv.rate,
        duration:     inv.duration,
        earningsSoFar: inv.earningsSoFar || 0,
        startDate:    inv.startDate,
        endDate:      inv.endDate,
        status:       inv.status,
      }))
    );
  }

  const users = await User.find({}).sort({ createdAt: -1 }).lean();

  const activeCounts = await Investment.aggregate([
    { $match: { status: "active" } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(activeCounts.map(x => [x._id.toString(), x.count]));

  return NextResponse.json(
    users.map(u => ({
      id:            u._id.toString(),
      name:          `${u.firstName} ${u.lastName}`,
      email:         u.email,
      username:      u.username,
      balance:       u.balance,
      deposited:     u.totalDeposited,
      withdrawn:     u.totalWithdrawn,
      joined:        new Date(u.createdAt).toISOString().split("T")[0],
      kyc:           u.kycStatus,
      status:        u.status || (u.role === "admin" ? "admin" : "active"),
      plan:          u.activePlan || "-",
      country:       u.country || "-",
      referrals:     0,
      activeInvests: countMap[u._id.toString()] || 0,
      role:          u.role,
    }))
  );
}

export async function PUT(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "User ID required." }, { status: 400 });

  const body = await req.json();
  await connectDB();

  const user = await User.findById(id);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // ── Suspend / Reinstate ─────────────────────────────────────────────────────
  if (body.action === "suspend")   { user.status    = "suspended"; await user.save(); }
  if (body.action === "reinstate") { user.status    = "active";    await user.save(); }
  if (body.action === "verifyKYC") { user.kycStatus = "verified";  await user.save(); }

  // ── Credit balance ──────────────────────────────────────────────────────────
  if (body.action === "creditBalance") {
    const amount = Number(body.amount);
    const coin   = body.coin   || "USD";
    const note   = body.note   || "Admin credit";

    if (!amount || amount <= 0)
      return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });

    user.balance        += amount;
    user.totalDeposited += amount;
    await user.save();

    await Transaction.create({
      userId:    user._id,
      type:      "deposit",
      amount,
      coin,
      status:    "completed",
      adminNote: note,
    });

    await Notification.create({
      userId: user._id,
      title:  "Balance Credited 💰",
      body:   `$${amount.toLocaleString()} has been added to your account balance${coin !== "USD" ? ` (${coin})` : ""}. ${note !== "Admin credit" ? note : ""}`.trim(),
      type:   "deposit",
    });
  }

  // ── Cancel investment ───────────────────────────────────────────────────────
  if (body.action === "cancelInvestment") {
    const inv = await Investment.findById(body.investmentId);
    if (!inv || inv.userId.toString() !== id)
      return NextResponse.json({ error: "Investment not found." }, { status: 404 });
    if (!["active", "frozen"].includes(inv.status))
      return NextResponse.json({ error: "Investment cannot be cancelled." }, { status: 400 });

    inv.status = "cancelled";
    await inv.save();

    // Refund principal to user balance
    user.balance += inv.amount;
    await user.save();

    await Transaction.create({
      userId:    user._id,
      type:      "deposit",
      amount:    inv.amount,
      status:    "completed",
      adminNote: "Investment cancelled by admin — principal refunded",
    });

    await Notification.create({
      userId: user._id,
      title:  "Investment Cancelled",
      body:   `Your ${inv.planName || ""} Plan has been cancelled by the platform. Your principal of $${inv.amount.toLocaleString()} has been refunded to your balance.`,
      type:   "earning",
    });
  }

  // ── Freeze investment ────────────────────────────────────────────────────────
  if (body.action === "freezeInvestment") {
    const inv = await Investment.findById(body.investmentId);
    if (!inv || inv.userId.toString() !== id)
      return NextResponse.json({ error: "Investment not found." }, { status: 404 });
    if (inv.status !== "active")
      return NextResponse.json({ error: "Only active investments can be frozen." }, { status: 400 });

    inv.status = "frozen";
    await inv.save();

    await Notification.create({
      userId: user._id,
      title:  "Investment Frozen",
      body:   `Your ${inv.planName || ""} Plan has been temporarily frozen by the platform. No further returns will accrue until the plan is reinstated.`,
      type:   "earning",
    });
  }

  // ── Unfreeze investment ──────────────────────────────────────────────────────
  if (body.action === "unfreezeInvestment") {
    const inv = await Investment.findById(body.investmentId);
    if (!inv || inv.userId.toString() !== id)
      return NextResponse.json({ error: "Investment not found." }, { status: 404 });
    if (inv.status !== "frozen")
      return NextResponse.json({ error: "Investment is not frozen." }, { status: 400 });

    inv.status = "active";
    await inv.save();

    await Notification.create({
      userId: user._id,
      title:  "Investment Reinstated",
      body:   `Your ${inv.planName || ""} Plan has been reinstated. Daily returns will continue to accrue from today.`,
      type:   "earning",
    });
  }

  return NextResponse.json({ message: "User updated.", balance: user.balance });
}
