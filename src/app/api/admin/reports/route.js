// GET /api/admin/reports — real aggregated stats for the Reports tab

import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { connectDB }        from "@/lib/mongodb";
import User                 from "@/models/User";
import Transaction          from "@/models/Transaction";
import Investment           from "@/models/Investment";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const now   = new Date();
  const months = [];

  // Build last 6 months labels + date ranges
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    months.push({ label: d.toLocaleString("en-US",{month:"short"}), start: d, end });
  }

  // Monthly deposit/withdrawal/earning totals
  const revenueData = await Promise.all(months.map(async ({ label, start, end }) => {
    const [deposits, withdrawals, earnings] = await Promise.all([
      Transaction.aggregate([{ $match:{ type:"deposit",    status:"completed", createdAt:{ $gte:start, $lt:end } } }, { $group:{ _id:null, total:{ $sum:"$amount" } } }]),
      Transaction.aggregate([{ $match:{ type:"withdrawal", status:"completed", createdAt:{ $gte:start, $lt:end } } }, { $group:{ _id:null, total:{ $sum:"$amount" } } }]),
      Transaction.aggregate([{ $match:{ type:"earning",    status:"completed", createdAt:{ $gte:start, $lt:end } } }, { $group:{ _id:null, total:{ $sum:"$amount" } } }]),
    ]);
    return {
      month:       label,
      deposits:    deposits[0]?.total    || 0,
      withdrawals: withdrawals[0]?.total || 0,
      revenue:     earnings[0]?.total    || 0,
    };
  }));

  // Monthly user registration counts
  const growthData = await Promise.all(months.map(async ({ label, start, end }) => {
    const count = await User.countDocuments({ createdAt:{ $gte:start, $lt:end } });
    return { month: label, users: count };
  }));

  // All-time totals
  const [totalUsers, totalDeposits, totalWithdrawals, totalEarnings, activeInvestments] = await Promise.all([
    User.countDocuments({}),
    Transaction.aggregate([{ $match:{ type:"deposit",    status:"completed" } }, { $group:{ _id:null, t:{ $sum:"$amount" } } }]),
    Transaction.aggregate([{ $match:{ type:"withdrawal", status:"completed" } }, { $group:{ _id:null, t:{ $sum:"$amount" } } }]),
    Transaction.aggregate([{ $match:{ type:"earning",    status:"completed" } }, { $group:{ _id:null, t:{ $sum:"$amount" } } }]),
    Investment.countDocuments({ status:"active" }),
  ]);

  // Plan distribution
  const planStats = await Investment.aggregate([
    { $group: { _id:"$planName", count:{ $sum:1 }, total:{ $sum:"$amount" } } },
    { $sort:  { total: -1 } },
  ]);

  return NextResponse.json({
    revenueData,
    growthData,
    totals: {
      users:       totalUsers,
      deposits:    totalDeposits[0]?.t    || 0,
      withdrawals: totalWithdrawals[0]?.t || 0,
      earnings:    totalEarnings[0]?.t    || 0,
      activeInvs:  activeInvestments,
    },
    planStats: planStats.map(p => ({ name: p._id || "Unknown", count: p.count, total: p.total })),
  });
}
