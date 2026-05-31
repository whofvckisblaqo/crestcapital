// GET    /api/admin/plans       — list all plans
// POST   /api/admin/plans       — create a plan
// PUT    /api/admin/plans?id=X  — update a plan
// DELETE /api/admin/plans?id=X  — delete a plan

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import Investment from "@/models/Investment";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const plans = await Plan.find({}).sort({ minAmount: 1 }).lean();

  // Aggregate investment stats per plan
  const stats = await Investment.aggregate([
    { $group: { _id: "$planId", count: { $sum: 1 }, total: { $sum: "$amount" } } },
  ]);
  const statsMap = Object.fromEntries(stats.map(s => [s._id.toString(), s]));

  return NextResponse.json(
    plans.map(p => ({
      id:            p._id.toString(),
      name:          p.name,
      rate:          p.rate,
      duration:      p.duration,
      min:           p.minAmount,
      max:           p.maxAmount,
      color:         p.color,
      active:        p.active,
      investments:   statsMap[p._id.toString()]?.count  || 0,
      totalInvested: statsMap[p._id.toString()]?.total  || 0,
    }))
  );
}

export async function POST(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, rate, duration, min, max, color, active } = await req.json();
  if (!name || !rate || !duration || !min || !max)
    return NextResponse.json({ error: "All plan fields are required." }, { status: 400 });

  await connectDB();
  const plan = await Plan.create({ name, rate, duration, minAmount: min, maxAmount: max, color: color || "#00d4ff", active: active !== false });
  return NextResponse.json({ message: "Plan created.", id: plan._id.toString() }, { status: 201 });
}

export async function PUT(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Plan ID required." }, { status: 400 });

  const body = await req.json();
  const update = {};
  if (body.name     !== undefined) update.name      = body.name;
  if (body.rate     !== undefined) update.rate      = body.rate;
  if (body.duration !== undefined) update.duration  = body.duration;
  if (body.min      !== undefined) update.minAmount = body.min;
  if (body.max      !== undefined) update.maxAmount = body.max;
  if (body.color    !== undefined) update.color     = body.color;
  if (body.active   !== undefined) update.active    = body.active;

  await connectDB();
  await Plan.findByIdAndUpdate(id, update);
  return NextResponse.json({ message: "Plan updated." });
}

export async function DELETE(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Plan ID required." }, { status: 400 });

  await connectDB();
  await Plan.findByIdAndDelete(id);
  return NextResponse.json({ message: "Plan deleted." });
}
