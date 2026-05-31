// GET /api/plans — public endpoint, returns active investment plans (no auth required)
import { NextResponse } from "next/server";
import { connectDB }    from "@/lib/mongodb";
import Plan             from "@/models/Plan";

export async function GET() {
  try {
    await connectDB();
    const plans = await Plan.find({ active: true }).sort({ minAmount: 1 }).lean();
    return NextResponse.json(
      plans.map(p => ({
        id:       p._id.toString(),
        name:     p.name,
        rate:     p.rate,
        duration: p.duration,
        min:      p.minAmount,
        max:      p.maxAmount,
        color:    p.color,
      }))
    );
  } catch {
    return NextResponse.json([], { status: 200 }); // fallback to empty, not error
  }
}
