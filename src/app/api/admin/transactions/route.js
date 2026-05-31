// GET /api/admin/transactions          — all transactions
// PUT /api/admin/transactions?id=X     — approve or reject a withdrawal

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Notification from "@/models/Notification";
import Settings from "@/models/Settings";
import { sendTransactionEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const txns = await Transaction.find({})
    .populate("userId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    txns.map(tx => ({
      id:     tx.txId || tx._id.toString().slice(-6).toUpperCase(),
      _id:    tx._id.toString(),
      userId: tx.userId?._id?.toString(),
      user:   tx.userId ? `${tx.userId.firstName} ${tx.userId.lastName}` : "Unknown",
      email:  tx.userId?.email || "",
      type:   tx.type,
      amount: tx.amount,
      coin:   tx.coin || "",
      plan:   tx.planName || "-",
      date:   new Date(tx.createdAt).toISOString().split("T")[0],
      status: tx.status,
      hash:   tx.txHash || "-",
      wallet: tx.walletAddress || "",
      note:   tx.adminNote || "",
    }))
  );
}

export async function PUT(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Transaction ID required." }, { status: 400 });

  const { action, note } = await req.json(); // action: "approve" | "reject"
  if (!["approve", "reject"].includes(action))
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  await connectDB();
  const tx = await Transaction.findById(id);
  if (!tx) return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  if (tx.status !== "pending") return NextResponse.json({ error: "Transaction already processed." }, { status: 409 });

  tx.status    = action === "approve" ? "completed" : "rejected";
  tx.adminNote = note || "";
  await tx.save();

  const user = await User.findById(tx.userId);
  if (user) {
    // ── Deposit approval → credit balance + referral commission ───────────────
    if (action === "approve" && tx.type === "deposit") {
      const wasFirstDeposit = user.totalDeposited === 0;

      user.balance        += tx.amount;
      user.totalDeposited += tx.amount;
      await user.save();

      await Notification.create({
        userId: user._id,
        title:  "Deposit Approved ✅",
        body:   `Your deposit of $${tx.amount.toLocaleString()} (${tx.coin}) has been approved and credited to your balance.`,
        type:   "deposit",
      });
      sendTransactionEmail({
        to: user.email, name: user.firstName,
        type: "deposit-approved", amount: tx.amount, coin: tx.coin,
      }).catch(() => {});

      // ── Referral commission on FIRST deposit ──────────────────────────────
      if (wasFirstDeposit && user.referredBy) {
        const referrer = await User.findById(user.referredBy);
        if (referrer) {
          // Get commission rate from settings (default 8%)
          const settings = await Settings.findOne({ key: "global" }).lean();
          const rate      = (settings?.referralRate ?? 8) / 100;
          const commission = +(tx.amount * rate).toFixed(2);

          referrer.balance      += commission;
          referrer.referralBonus += commission;
          await referrer.save();

          await Transaction.create({
            userId:         referrer._id,
            type:           "referral",
            amount:         commission,
            coin:           tx.coin || "USD",
            planName:       "-",
            status:         "completed",
            referredUserId: user._id,
            adminNote:      `Referral commission from ${user.firstName} ${user.lastName}'s first deposit of $${tx.amount.toLocaleString()}`,
          });

          await Notification.create({
            userId: referrer._id,
            title:  "Referral Commission Earned 🎉",
            body:   `You earned $${commission.toFixed(2)} (${(rate*100).toFixed(0)}% commission) from ${user.firstName} ${user.lastName}'s first deposit of $${tx.amount.toLocaleString()}.`,
            type:   "referral",
          });
        }
      }
    }

    if (action === "reject" && tx.type === "deposit") {
      await Notification.create({
        userId: user._id,
        title:  "Deposit Rejected",
        body:   `Your deposit of $${tx.amount.toLocaleString()} (${tx.coin}) was rejected. ${note ? `Reason: ${note}` : "Please contact support."}`,
        type:   "deposit",
      });
      sendTransactionEmail({
        to: user.email, name: user.firstName,
        type: "deposit-rejected", amount: tx.amount, coin: tx.coin, note,
      }).catch(() => {});
    }

    // ── Withdrawal approval → mark withdrawn ──────────────────────────────────
    if (action === "approve" && tx.type === "withdrawal") {
      user.totalWithdrawn += tx.amount;
      await user.save();
      await Notification.create({
        userId: user._id,
        title:  "Withdrawal Approved",
        body:   `Your withdrawal of $${tx.amount.toLocaleString()} (${tx.coin}) has been approved and is being processed.`,
        type:   "withdrawal",
      });
      sendTransactionEmail({
        to: user.email, name: user.firstName,
        type: "withdrawal-approved", amount: tx.amount, coin: tx.coin,
        walletAddress: tx.walletAddress || "",
      }).catch(() => {});
    }

    // ── Withdrawal rejection → refund balance ────────────────────────────────
    if (action === "reject" && tx.type === "withdrawal") {
      user.balance += tx.amount;
      await user.save();
      await Notification.create({
        userId: user._id,
        title:  "Withdrawal Rejected",
        body:   `Your withdrawal of $${tx.amount.toLocaleString()} was rejected and refunded to your balance. ${note ? `Reason: ${note}` : "Please contact support."}`,
        type:   "withdrawal",
      });
      sendTransactionEmail({
        to: user.email, name: user.firstName,
        type: "withdrawal-rejected", amount: tx.amount, coin: tx.coin, note,
        walletAddress: tx.walletAddress || "",
      }).catch(() => {});
    }
  }

  return NextResponse.json({ message: `Transaction ${action === "approve" ? "approved" : "rejected"}.` });
}
