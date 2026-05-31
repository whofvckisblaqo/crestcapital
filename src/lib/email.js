// src/lib/email.js — Email delivery via Resend

import { Resend } from "resend";

const BRAND = `
  <tr>
    <td style="background:linear-gradient(135deg,#0f2040,#08142a);padding:28px 40px;text-align:center;border-bottom:1px solid #1a3a6b;">
      <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:3px;color:#00d4ff;">CRESTCAPITAL</p>
    </td>
  </tr>`;

const FOOTER = `
  <tr>
    <td style="padding:20px 40px;border-top:1px solid #1a3a6b;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:#6a8fb0;">© ${new Date().getFullYear()} CrestCapital Ltd. All rights reserved.</p>
      <p style="margin:0;font-size:12px;color:#6a8fb0;">Stortingsgata 6, 0161 Oslo, Norway</p>
    </td>
  </tr>`;

function wrap(body) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#050d1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050d1a;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#08142a;border:1px solid #1a3a6b;border-radius:16px;overflow:hidden;">
        ${BRAND}
        <tr><td style="padding:36px 40px;">${body}</td></tr>
        ${FOOTER}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function fmt(n) { return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function badge(color, text) {
  return `<div style="display:inline-block;background:${color}22;border:1px solid ${color}55;border-radius:8px;padding:6px 16px;margin-bottom:24px;">
    <span style="font-size:13px;font-weight:700;color:${color};">${text}</span>
  </div>`;
}

function infoRow(label, value) {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:#6a8fb0;border-bottom:1px solid #1a3a6b22;">${label}</td>
    <td style="padding:8px 0;font-size:13px;font-weight:600;color:#eef5ff;text-align:right;border-bottom:1px solid #1a3a6b22;">${value}</td>
  </tr>`;
}

async function send(to, subject, html) {
  console.log(`\n📧  [email] To: ${to} | Subject: ${subject}\n`);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping real delivery.");
    return;
  }

  const resend = new Resend(apiKey);
  const from   = process.env.RESEND_FROM || "CrestCapital <noreply@crestcapital.com>";

  try {
    const { data, error } = await resend.emails.send({ from, to: [to], subject, html });
    if (error) console.error("[email] Resend error:", error);
    else        console.log("[email] Sent, id:", data?.id);
  } catch (err) {
    console.error("[email] Failed:", err.message);
  }
}

// ─── OTP / Verification ────────────────────────────────────────────────────────
export async function sendOTPEmail({ to, name, otp, subject = "Your CrestCapital verification code" }) {
  console.log(`\n📧  OTP for ${to}: ${otp}\n`);

  const html = wrap(`
    <p style="margin:0 0 20px;font-size:15px;color:#8eaece;line-height:1.7;">
      Hi <strong style="color:#eef5ff;">${name || "there"}</strong>,
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#8eaece;line-height:1.7;">
      Use the verification code below to confirm your email address. It expires in <strong style="color:#eef5ff;">10 minutes</strong>.
    </p>
    <div style="background:#0f2040;border:1px solid #1a3a6b;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
      <span style="font-size:44px;font-weight:800;letter-spacing:14px;color:#00d4ff;font-family:'Courier New',monospace;">${otp}</span>
    </div>
    <p style="margin:0;font-size:13px;color:#6a8fb0;line-height:1.7;">
      If you didn't create a CrestCapital account, you can safely ignore this email. Never share this code with anyone.
    </p>`);

  await send(to, subject, html);
}

// ─── Transaction Emails ────────────────────────────────────────────────────────

// type: "deposit-pending" | "deposit-approved" | "deposit-rejected"
//     | "withdrawal-pending" | "withdrawal-approved" | "withdrawal-rejected"
export async function sendTransactionEmail({ to, name, type, amount, coin, note = "", walletAddress = "" }) {
  const configs = {
    "deposit-pending": {
      subject: "Deposit Request Received — CrestCapital",
      badgeColor: "#f0c040", badgeText: "⏳ Pending Review",
      headline: "Deposit Request Submitted",
      intro: `We've received your deposit request and it is currently under review. You will be notified once it has been approved and credited to your account.`,
      showNote: false,
    },
    "deposit-approved": {
      subject: "Deposit Approved — CrestCapital",
      badgeColor: "#00e096", badgeText: "✅ Approved",
      headline: "Your Deposit Has Been Approved",
      intro: `Great news! Your deposit has been approved and credited to your CrestCapital balance. You can now use it to start or grow your investments.`,
      showNote: false,
    },
    "deposit-rejected": {
      subject: "Deposit Not Approved — CrestCapital",
      badgeColor: "#ff4d6d", badgeText: "❌ Not Approved",
      headline: "Your Deposit Was Not Approved",
      intro: `Unfortunately your deposit could not be approved at this time. Please review the details below and contact support if you need assistance.`,
      showNote: true,
    },
    "withdrawal-pending": {
      subject: "Withdrawal Request Received — CrestCapital",
      badgeColor: "#f0c040", badgeText: "⏳ Pending Review",
      headline: "Withdrawal Request Submitted",
      intro: `Your withdrawal request has been submitted and is pending admin approval. The funds have been held from your balance and will be released to your wallet once approved.`,
      showNote: false,
    },
    "withdrawal-approved": {
      subject: "Withdrawal Approved — CrestCapital",
      badgeColor: "#00e096", badgeText: "✅ Approved",
      headline: "Your Withdrawal Has Been Approved",
      intro: `Your withdrawal has been approved and is being processed to your wallet. Please allow some time for the blockchain transaction to confirm.`,
      showNote: false,
    },
    "withdrawal-rejected": {
      subject: "Withdrawal Rejected — Funds Returned — CrestCapital",
      badgeColor: "#ff4d6d", badgeText: "❌ Rejected",
      headline: "Withdrawal Rejected — Funds Returned",
      intro: `Your withdrawal request was rejected and the funds have been returned to your CrestCapital balance. Please review the details below.`,
      showNote: true,
    },
  };

  const cfg = configs[type];
  if (!cfg) return;

  const rows = [
    infoRow("Amount", `<span style="color:#00d4ff;">$${fmt(amount)}</span>`),
    infoRow("Currency", coin || "USD"),
    ...(walletAddress && type.startsWith("withdrawal") ? [infoRow("Wallet", `<span style="font-family:monospace;font-size:12px;">${walletAddress.slice(0, 20)}…</span>`)] : []),
    infoRow("Status", `<span style="color:${cfg.badgeColor};">${cfg.badgeText.replace(/^[^\s]+\s/, "")}</span>`),
  ];

  const html = wrap(`
    ${badge(cfg.badgeColor, cfg.badgeText)}
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#eef5ff;">${cfg.headline}</h2>
    <p style="margin:0 0 8px;font-size:15px;color:#8eaece;line-height:1.7;">
      Hi <strong style="color:#eef5ff;">${name || "there"}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#8eaece;line-height:1.7;">${cfg.intro}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f2040;border:1px solid #1a3a6b;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      ${rows.join("")}
    </table>

    ${cfg.showNote && note ? `
    <div style="background:#ff4d6d11;border:1px solid #ff4d6d33;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#ff4d6d;font-weight:600;">Reason: <span style="color:#eef5ff;font-weight:400;">${note}</span></p>
    </div>` : ""}

    <p style="margin:0;font-size:13px;color:#6a8fb0;line-height:1.7;">
      If you have questions, contact us at
      <a href="mailto:crestcapitalsuport@outlook.com" style="color:#00d4ff;text-decoration:none;">crestcapitalsuport@outlook.com</a>.
    </p>`);

  await send(to, cfg.subject, html);
}

// ─── Welcome Email ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail({ to, name }) {
  const html = wrap(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#00d4ff,#00a8cc);display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">🎉</div>
      <h2 style="margin:0;font-size:22px;font-weight:800;color:#eef5ff;">Welcome to CrestCapital!</h2>
    </div>
    <p style="margin:0 0 16px;font-size:15px;color:#8eaece;line-height:1.7;">
      Hi <strong style="color:#eef5ff;">${name || "there"}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#8eaece;line-height:1.7;">
      Your account is fully verified and ready to use. You can now make your first deposit and start earning daily returns with our AI-powered investment plans.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f2040;border:1px solid #1a3a6b;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      ${infoRow("Starter Plan", "0.9% daily · 10 days · from $100")}
      ${infoRow("Growth Plan", "1.4% daily · 15 days · from $1,000")}
      ${infoRow("Advanced Plan", "2.0% daily · 21 days · from $5,000")}
      ${infoRow("Premium Plan", "3.5% daily · 30 days · from $20,000")}
    </table>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://crestcapital.com"}/dashboard"
      style="display:block;text-align:center;background:linear-gradient(135deg,#00d4ff,#00a8cc);color:#050d1a;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:24px;">
      Go to Dashboard →
    </a>
    <p style="margin:0;font-size:13px;color:#6a8fb0;line-height:1.7;">
      Questions? We're here 24/7 at
      <a href="mailto:crestcapitalsuport@outlook.com" style="color:#00d4ff;text-decoration:none;">crestcapitalsuport@outlook.com</a>.
    </p>`);

  await send(to, "Welcome to CrestCapital — Your Account is Ready", html);
}
