// GET    /api/admin/realestate       — list all properties
// POST   /api/admin/realestate       — create property
// PUT    /api/admin/realestate?id=X  — update property
// DELETE /api/admin/realestate?id=X  — delete property

import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { connectDB }        from "@/lib/mongodb";
import Property             from "@/models/Property";
import PropertyInvestment   from "@/models/PropertyInvestment";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

const normalize = (p) => ({
  id:             p._id.toString(),
  title:          p.title,
  location:       p.location,
  type:           p.type,
  description:    p.description,
  imageUrl:       p.imageUrl || "",
  targetAmount:   p.targetAmount,
  raisedAmount:   p.raisedAmount,
  minInvestment:  p.minInvestment,
  annualReturn:   p.annualReturn,
  durationMonths: p.durationMonths,
  investorCount:  p.investorCount,
  active:         p.active,
  status:         p.status,
  highlights:     p.highlights || [],
  fundingPct:     p.targetAmount > 0 ? Math.min(100, Math.round((p.raisedAmount / p.targetAmount) * 100)) : 0,
  createdAt:      new Date(p.createdAt).toISOString().split("T")[0],
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const props = await Property.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(props.map(normalize));
}

export async function POST(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, location, type, description, imageUrl, targetAmount, minInvestment, annualReturn, durationMonths, highlights } = body;

  if (!title || !location || !targetAmount || !minInvestment || !annualReturn || !durationMonths)
    return NextResponse.json({ error: "Required fields missing." }, { status: 400 });

  await connectDB();
  const p = await Property.create({
    title, location, type: type || "residential", description: description || "",
    imageUrl: imageUrl || "", targetAmount, minInvestment, annualReturn, durationMonths,
    highlights: highlights || [],
  });

  return NextResponse.json({ message: "Property created.", property: normalize(p) }, { status: 201 });
}

export async function PUT(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id   = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Property ID required." }, { status: 400 });

  const body = await req.json();
  await connectDB();

  // Prevent overwriting _id
  const { _id, ...safeBody } = body;
  const p = await Property.findByIdAndUpdate(id, safeBody, { new: true });
  if (!p) return NextResponse.json({ error: "Property not found." }, { status: 404 });

  return NextResponse.json({ message: "Property updated.", property: normalize(p.toObject()) });
}

export async function DELETE(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Property ID required." }, { status: 400 });

  await connectDB();
  await Property.findByIdAndDelete(id);
  await PropertyInvestment.deleteMany({ propertyId: id });

  return NextResponse.json({ message: "Property deleted." });
}
