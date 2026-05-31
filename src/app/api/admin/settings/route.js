// GET /api/admin/settings  — read site settings (persisted in MongoDB)
// PUT /api/admin/settings  — update site settings

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

async function getSettings() {
  await connectDB();
  // Upsert: always return the single global settings doc
  let s = await Settings.findOne({ key: "global" });
  if (!s) s = await Settings.create({ key: "global" });
  return s;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const s = await getSettings();
    return NextResponse.json(s.toObject());
  } catch (err) {
    console.error("[settings GET]", err);
    return NextResponse.json({ error: "Failed to load settings." }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const raw = await req.json();

  // Strip MongoDB metadata — never overwrite _id, __v, key, timestamps
  const { _id, __v, key, createdAt, updatedAt, ...updates } = raw;

  await connectDB();
  const s = await Settings.findOneAndUpdate(
    { key: "global" },
    { $set: updates },
    { new: true, upsert: true }
  );

  return NextResponse.json({ message: "Settings saved.", settings: s.toObject() });
}
