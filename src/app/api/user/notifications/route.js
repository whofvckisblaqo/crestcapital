// GET  /api/user/notifications        — fetch notifications
// PUT  /api/user/notifications        — mark all as read
// PUT  /api/user/notifications?id=X   — mark one as read

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const notifs = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(
    notifs.map(n => ({
      id:    n._id.toString(),
      type:  n.type,
      title: n.title,
      body:  n.body,
      time:  timeAgo(n.createdAt),
      read:  n.read,
    }))
  );
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await connectDB();
  if (id) {
    await Notification.findOneAndUpdate({ _id: id, userId: session.user.id }, { read: true });
  } else {
    await Notification.updateMany({ userId: session.user.id, read: false }, { read: true });
  }
  return NextResponse.json({ message: "Updated." });
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return "Just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)    return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}
