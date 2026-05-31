// GET  /api/user/kyc  — returns user's KYC status + latest submission
// POST /api/user/kyc  — submit a new KYC application (with front/back images as base64)

import { NextResponse }  from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }   from "@/lib/auth";
import { connectDB }     from "@/lib/mongodb";
import User              from "@/models/User";
import KYCSubmission     from "@/models/KYCSubmission";
import { notifyAdmins } from "@/lib/notifyAdmins";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB per image

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user   = await User.findById(session.user.id).lean();
  const latest = await KYCSubmission.findOne({ userId: session.user.id })
    .sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    kycStatus:  user?.kycStatus || "unverified",
    submission: latest ? {
      id:          latest._id.toString(),
      docType:     latest.docType,
      docNumber:   latest.docNumber,
      country:     latest.country,
      hasFront:    !!latest.docFrontUrl,
      hasBack:     !!latest.docBackUrl,
      status:      latest.status,
      adminNote:   latest.adminNote,
      submitted:   new Date(latest.createdAt).toISOString().split("T")[0],
    } : null,
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { docType, docNumber, country, docFront, docBack } = await req.json();

    if (!docType || !country)
      return NextResponse.json({ error: "Document type and country are required." }, { status: 400 });
    if (!docFront)
      return NextResponse.json({ error: "Front image of ID is required." }, { status: 400 });

    // Validate base64 size
    const frontBytes = Buffer.byteLength(docFront, "base64");
    const backBytes  = docBack ? Buffer.byteLength(docBack, "base64") : 0;
    if (frontBytes > MAX_IMAGE_BYTES || backBytes > MAX_IMAGE_BYTES)
      return NextResponse.json({ error: "Each image must be under 3 MB." }, { status: 400 });

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (user.kycStatus === "verified")
      return NextResponse.json({ error: "Your KYC is already verified." }, { status: 400 });

    // Cancel any previous pending submission
    await KYCSubmission.updateMany(
      { userId: user._id, status: "pending" },
      { status: "rejected", adminNote: "Superseded by new submission" }
    );

    const submission = await KYCSubmission.create({
      userId:      user._id,
      docType,
      docNumber:   docNumber || "",
      country,
      docFrontUrl: docFront,
      docBackUrl:  docBack  || "",
      status:      "pending",
    });

    user.kycStatus = "pending";
    await user.save();

    await notifyAdmins(
      "New KYC Submission 🪪",
      `${user.firstName} ${user.lastName} submitted a KYC document (${docType}) from ${country}. Awaiting review.`,
      "system"
    );

    return NextResponse.json({
      message: "KYC submitted successfully. Our team will review within 24 hours.",
      id:      submission._id.toString(),
    });
  } catch (err) {
    console.error("[kyc submit]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
