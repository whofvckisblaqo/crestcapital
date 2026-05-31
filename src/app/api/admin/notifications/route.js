// GET /api/admin/notifications  — admin's own notifications
// PUT /api/admin/notifications  — mark all read

import { NextResponse }    from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }     from "@/lib/auth";
import { connectDB }       from "@/lib/mongodb";
import Notification        from "@/models/Notification";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const notifs = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(
    notifs.map(n => ({
      id:    n._id.toString(),
      msg:   n.body,
      title: n.title,
      time:  timeAgo(new Date(n.createdAt)),
      read:  n.read,
      type:  n.type === "deposit" ? "warning" : n.type === "withdrawal" ? "warning" : n.type === "system" ? "info" : "success",
    }))
  );
}

export async function PUT() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  await Notification.updateMany({ userId: session.user.id, read: false }, { read: true });
  return NextResponse.json({ message: "All marked read." });
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
