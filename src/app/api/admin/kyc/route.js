// GET /api/admin/kyc           — list all KYC submissions
// PUT /api/admin/kyc?id=X      — approve or reject

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import KYCSubmission from "@/models/KYCSubmission";
import User from "@/models/User";
import Notification from "@/models/Notification";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const submissions = await KYCSubmission.find({})
    .populate("userId", "firstName lastName email country")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    submissions.map(k => ({
      id:          k._id.toString(),
      userId:      k.userId?._id?.toString(),
      name:        k.userId ? `${k.userId.firstName} ${k.userId.lastName}` : "Unknown",
      email:       k.userId?.email || "",
      country:     k.country || k.userId?.country || "",
      docType:     k.docType,
      docNumber:   k.docNumber || "",
      docFrontUrl: k.docFrontUrl || "",
      docBackUrl:  k.docBackUrl  || "",
      status:      k.status,
      notes:       k.adminNote || "",
      submitted:   new Date(k.createdAt).toISOString().split("T")[0],
    }))
  );
}

export async function PUT(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "KYC ID required." }, { status: 400 });

  const { action, note } = await req.json();
  if (!["approved", "rejected"].includes(action))
    return NextResponse.json({ error: "Action must be 'approved' or 'rejected'." }, { status: 400 });

  await connectDB();
  const kyc = await KYCSubmission.findByIdAndUpdate(id, { status: action, adminNote: note || "" }, { new: true });
  if (!kyc) return NextResponse.json({ error: "Submission not found." }, { status: 404 });

  // Update user's KYC status
  await User.findByIdAndUpdate(kyc.userId, { kycStatus: action === "approved" ? "verified" : "unverified" });

  // Notify user
  await Notification.create({
    userId: kyc.userId,
    title:  action === "approved" ? "KYC Approved ✅" : "KYC Rejected",
    body:   action === "approved"
      ? "Your identity has been successfully verified. You now have full access to all features."
      : `Your KYC submission was rejected. ${note ? `Reason: ${note}` : "Please re-submit with valid documents."}`,
    type: "system",
  });

  return NextResponse.json({ message: `KYC ${action}.` });
}
