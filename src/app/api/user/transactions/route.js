// GET /api/user/transactions — returns user's transaction history

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const transactions = await Transaction.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    transactions.map(tx => ({
      id:      tx.txId || tx._id.toString().slice(-6).toUpperCase(),
      type:    tx.type,
      amount:  tx.amount,
      plan:    tx.planName || "-",
      date:    new Date(tx.createdAt).toISOString().split("T")[0],
      status:  tx.status,
      coin:    tx.coin || "",
      hash:    tx.txHash || "-",
    }))
  );
}
