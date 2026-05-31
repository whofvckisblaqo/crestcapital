// GET  /api/user/realestate  — active property listings + user's investments
// POST /api/user/realestate  — invest in a property

import { NextResponse }       from "next/server";
import { getServerSession }   from "next-auth";
import { authOptions }        from "@/lib/auth";
import { connectDB }          from "@/lib/mongodb";
import User                   from "@/models/User";
import Property               from "@/models/Property";
import PropertyInvestment     from "@/models/PropertyInvestment";
import Transaction            from "@/models/Transaction";
import Notification           from "@/models/Notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [properties, myInvestments] = await Promise.all([
    Property.find({ active: true }).sort({ createdAt: -1 }).lean(),
    PropertyInvestment.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean(),
  ]);

  // ── Credit uncredited real estate earnings lazily ──────────────────────────
  const now = new Date();
  let totalNewEarnings = 0;

  for (const inv of myInvestments) {
    if (inv.status !== "active") continue;
    const startDate   = new Date(inv.startDate);
    const endDate     = new Date(inv.endDate);
    const monthsElapsed = Math.min(
      inv.durationMonths,
      (now - startDate) / (30.44 * 86400000)   // approximate months
    );
    const totalExpected = +(inv.amount * inv.annualReturn / 100 / 12 * monthsElapsed).toFixed(8);
    const newEarnings   = +(totalExpected - (inv.earningsSoFar || 0)).toFixed(8);

    if (newEarnings > 0) {
      await PropertyInvestment.findByIdAndUpdate(inv._id, { $inc: { earningsSoFar: newEarnings } });
      totalNewEarnings += newEarnings;
    }
    if (now >= endDate) {
      await PropertyInvestment.findByIdAndUpdate(inv._id, { status: "completed" });
      await Notification.create({
        userId: session.user.id,
        title:  "Real Estate Investment Matured 🏠",
        body:   `Your investment in "${inv.propertyTitle}" has completed. Total earned: $${(+(inv.earningsSoFar||0) + newEarnings).toFixed(2)}.`,
        type:   "earning",
      });
    }
  }

  if (totalNewEarnings > 0) {
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { balance: +totalNewEarnings.toFixed(2), totalEarned: +totalNewEarnings.toFixed(2) },
    });
    // Refresh myInvestments after update
    const refreshed = await PropertyInvestment.find({ userId: session.user.id }).sort({ createdAt:-1 }).lean();
    myInvestments.splice(0, myInvestments.length, ...refreshed);
  }

  return NextResponse.json({
    properties: properties.map(p => ({
      id:             p._id.toString(),
      title:          p.title,
      location:       p.location,
      type:           p.type,
      description:    p.description,
      imageUrl:       p.imageUrl,
      targetAmount:   p.targetAmount,
      raisedAmount:   p.raisedAmount,
      minInvestment:  p.minInvestment,
      annualReturn:   p.annualReturn,
      durationMonths: p.durationMonths,
      investorCount:  p.investorCount,
      status:         p.status,
      highlights:     p.highlights || [],
      fundingPct:     p.targetAmount > 0 ? Math.min(100, Math.round((p.raisedAmount / p.targetAmount) * 100)) : 0,
    })),
    myInvestments: myInvestments.map(i => ({
      id:             i._id.toString(),
      propertyId:     i.propertyId.toString(),
      propertyTitle:  i.propertyTitle,
      amount:         i.amount,
      annualReturn:   i.annualReturn,
      durationMonths: i.durationMonths,
      earningsSoFar:  i.earningsSoFar,
      startDate:      new Date(i.startDate).toISOString().split("T")[0],
      endDate:        new Date(i.endDate).toISOString().split("T")[0],
      status:         i.status,
      monthlyReturn:  +(i.amount * i.annualReturn / 100 / 12).toFixed(2),
    })),
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { propertyId, amount } = await req.json();
    if (!propertyId || !amount)
      return NextResponse.json({ error: "Property and amount are required." }, { status: 400 });

    await connectDB();

    const [user, property] = await Promise.all([
      User.findById(session.user.id),
      Property.findById(propertyId),
    ]);

    if (!user)     return NextResponse.json({ error: "User not found."     }, { status: 404 });
    if (!property || !property.active)
      return NextResponse.json({ error: "Property not found or unavailable." }, { status: 404 });
    if (property.status !== "open")
      return NextResponse.json({ error: "This property is no longer accepting investments." }, { status: 400 });
    if (amount < property.minInvestment)
      return NextResponse.json({ error: `Minimum investment is $${property.minInvestment.toLocaleString()}.` }, { status: 400 });
    if (user.balance < amount)
      return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });

    // Deduct balance
    user.balance -= amount;
    await user.save();

    // Record investment
    const startDate = new Date();
    const endDate   = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + property.durationMonths);

    const inv = await PropertyInvestment.create({
      userId:         user._id,
      propertyId:     property._id,
      propertyTitle:  property.title,
      amount,
      annualReturn:   property.annualReturn,
      durationMonths: property.durationMonths,
      startDate,
      endDate,
    });

    // Update raised amount only — investorCount is managed manually by admin
    await Property.findByIdAndUpdate(propertyId, {
      $inc: { raisedAmount: amount },
    });

    // Transaction record
    await Transaction.create({
      userId:   user._id,
      type:     "deposit",
      amount,
      planName: `Real Estate: ${property.title}`,
      status:   "completed",
    });

    await Notification.create({
      userId: user._id,
      title:  "Real Estate Investment Confirmed 🏠",
      body:   `Your $${amount.toLocaleString()} investment in "${property.title}" has been confirmed. Expected annual return: ${property.annualReturn}%.`,
      type:   "earning",
    });

    return NextResponse.json({
      message:      "Investment successful.",
      investmentId: inv._id.toString(),
    });
  } catch (err) {
    console.error("[realestate invest]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
