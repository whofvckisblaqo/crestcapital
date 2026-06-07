// GET /api/user/investments
// Returns the user's investments AND credits any uncredited earnings lazily.
// This means earnings stay accurate even without a cron job running.

import { NextResponse }  from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }   from "@/lib/auth";
import { connectDB }     from "@/lib/mongodb";
import Investment        from "@/models/Investment";
import User              from "@/models/User";
import Transaction       from "@/models/Transaction";
import Notification      from "@/models/Notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const now         = new Date();
  const investments = await Investment.find({ userId: session.user.id }).lean();

  let totalNewEarnings = 0;
  const results = [];

  for (const inv of investments) {
    const startDate  = new Date(inv.startDate);
    const endDate    = new Date(inv.endDate);
    const isExpired  = now >= endDate;

    // Days elapsed — capped at plan duration
    const daysElapsed = Math.min(
      inv.duration,
      Math.floor((now - startDate) / 86400000)
    );

    // Total earnings this investment should have accrued by now
    const totalExpected  = +(inv.amount * inv.rate / 100 * daysElapsed).toFixed(8);
    const newEarnings    = +(totalExpected - (inv.earningsSoFar || 0)).toFixed(8);

    // Credit any uncredited earnings
    if (newEarnings > 0 && inv.status === "active") {
      await Investment.findByIdAndUpdate(inv._id, {
        $inc: { earningsSoFar: newEarnings },
      });
      totalNewEarnings += newEarnings;

      await Transaction.create({
        userId:   inv.userId,
        type:     "earning",
        amount:   +newEarnings.toFixed(2),
        planName: inv.planName || "",
        status:   "completed",
      });
    }

    // Mark expired investments as completed
    if (isExpired && inv.status === "active") {
      await Investment.findByIdAndUpdate(inv._id, { status: "completed" });

      await Notification.create({
        userId: inv.userId,
        title:  "Investment Completed 🎉",
        body:   `Your ${inv.planName || ""} Plan investment of $${inv.amount.toLocaleString()} has matured. Total earned: $${(+(inv.earningsSoFar || 0) + newEarnings).toFixed(2)}.`,
        type:   "earning",
      });
    }

    const daysLeft = Math.max(0, Math.ceil((endDate - now) / 86400000));

    results.push({
      id:        inv._id.toString(),
      plan:      inv.planName || "Unknown",
      amount:    inv.amount,
      rate:      inv.rate,
      earned:    +((inv.earningsSoFar || 0) + newEarnings).toFixed(2),
      duration:  inv.duration,
      daysLeft,
      startDate: new Date(inv.startDate).toISOString().split("T")[0],
      endDate:   new Date(inv.endDate).toISOString().split("T")[0],
      status:    isExpired ? "completed" : inv.status,
    });
  }

  // Credit total new earnings to the user's balance in one write
  if (totalNewEarnings > 0) {
    await User.findByIdAndUpdate(session.user.id, {
      $inc: {
        balance:     +totalNewEarnings.toFixed(2),
        totalEarned: +totalNewEarnings.toFixed(2),
      },
    });
  }

  return NextResponse.json(results);
}
