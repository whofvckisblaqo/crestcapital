// Shared helper — creates a notification for every admin user
// Called from deposit, withdrawal, and KYC routes

import User         from "@/models/User";
import Notification from "@/models/Notification";

export async function notifyAdmins(title, body, type = "system") {
  try {
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    if (!admins.length) return;

    await Notification.insertMany(
      admins.map(a => ({ userId: a._id, title, body, type, read: false }))
    );
  } catch (err) {
    // Never let a notification failure break the main flow
    console.error("[notifyAdmins]", err.message);
  }
}
