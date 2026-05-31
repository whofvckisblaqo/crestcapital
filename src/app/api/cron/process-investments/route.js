// POST /api/cron/process-investments
//
// Runs daily to:
//   1. Credit earned returns (amount × rate%) to each active investment
//   2. Mark investments whose endDate has passed as "completed"
//   3. Create earning transaction records and update user balances
//
// Secured with CRON_SECRET (or falls back to NEXTAUTH_SECRET).
// Vercel cron: configure in vercel.json to call this at "0 0 * * *" (midnight UTC).
// Manual call:  POST /api/cron/process-investments
//               Authorization: Bearer <CRON_SECRET>

import { NextResponse } from "next/server";
import { connectDB }    from "@/lib/mongodb";
import Investment       from "@/models/Investment";
import User             from "@/models/User";
import Transaction      from "@/models/Transaction";
import Notification     from "@/models/Notification";

export async function POST(req) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET;
  const auth   = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Vercel cron header validation (optional extra check) ───────────────────
  // If running on Vercel, they add x-vercel-cron: 1. Uncomment to require it:
  // if (process.env.NODE_ENV === "production" && !req.headers.get("x-vercel-cron")) {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  await connectDB();

  const now = new Date();
  const activeInvestments = await Investment.find({ status: "active" }).lean();

  let creditedCount   = 0;
  let completedCount  = 0;
  const errors        = [];

  for (const inv of activeInvestments) {
    try {
      const startDate  = new Date(inv.startDate);
      const endDate    = new Date(inv.endDate);
      const isExpired  = now >= endDate;

      // Days elapsed — capped at plan duration so we never over-pay
      const daysElapsed = Math.min(
        inv.duration,
        Math.floor((now - startDate) / 86400000)
      );

      // Total earnings the investment should have accrued by now
      const totalExpected = +(inv.amount * inv.rate / 100 * daysElapsed).toFixed(8);

      // How much hasn't been credited yet
      const newEarnings   = +(totalExpected - (inv.earningsSoFar || 0)).toFixed(8);

      if (newEarnings > 0) {
        // Credit earnings to user
        await User.findByIdAndUpdate(inv.userId, {
          $inc: { balance: newEarnings, totalEarned: newEarnings },
        });

        // Record earning transaction
        await Transaction.create({
          userId:   inv.userId,
          type:     "earning",
          amount:   newEarnings,
          planName: inv.planName || "",
          status:   "completed",
        });

        // Notify user (only if this is a fresh credit — not already notified)
        if (newEarnings >= 0.01) {
          await Notification.create({
            userId: inv.userId,
            title:  "Daily Returns Credited",
            body:   `$${newEarnings.toFixed(2)} earned from your ${inv.planName || ""} Plan investment.`,
            type:   "earning",
          });
        }

        // Update investment's tracked earnings
        await Investment.findByIdAndUpdate(inv._id, {
          $inc: { earningsSoFar: newEarnings },
        });

        creditedCount++;
      }

      // Mark expired investments as completed + return principal to user balance
      if (isExpired) {
        await Investment.findByIdAndUpdate(inv._id, { status: "completed" });

        // Return the original invested amount back to the user's balance
        await User.findByIdAndUpdate(inv.userId, {
          $inc: { balance: inv.amount },
        });

        const totalEarned = +((inv.earningsSoFar || 0) + newEarnings).toFixed(2);

        await Transaction.create({
          userId:   inv.userId,
          type:     "earning",
          amount:   inv.amount,
          planName: inv.planName || "",
          status:   "completed",
          adminNote: "Principal returned on investment maturity",
        });

        await Notification.create({
          userId: inv.userId,
          title:  "Investment Matured 🎉",
          body:   `Your ${inv.planName || ""} Plan has completed! Principal $${inv.amount.toLocaleString()} returned + $${totalEarned.toFixed(2)} total earnings credited to your balance.`,
          type:   "earning",
        });

        completedCount++;
      }
    } catch (err) {
      errors.push({ id: inv._id.toString(), error: err.message });
    }
  }

  return NextResponse.json({
    processed:   activeInvestments.length,
    credited:    creditedCount,
    completed:   completedCount,
    errors:      errors.length ? errors : undefined,
    runAt:       now.toISOString(),
  });
}

// Allow Vercel Cron to call via GET as well
export const GET = POST;
