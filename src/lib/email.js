// src/lib/email.js — Email delivery via Resend
// OTP is always printed to the terminal so dev works without an API key.

import { Resend } from "resend";

/**
 * Send an OTP / verification email.
 *
 * @param {object} opts
 * @param {string} opts.to      - recipient address
 * @param {string} opts.name    - recipient first name
 * @param {string} opts.otp     - 6-digit code
 * @param {string} opts.subject - email subject line
 */
export async function sendOTPEmail({ to, name, otp, subject = "Your CrestCapital verification code" }) {
  // Always log — full flow works in dev with no API key
  console.log(`\n📧  OTP for ${to}: ${otp}\n`);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping real delivery, use OTP above.");
    return;
  }

  const resend  = new Resend(apiKey);
  const from    = process.env.RESEND_FROM || "CrestCapital <onboarding@resend.dev>";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#050d1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050d1a;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#08142a;border:1px solid #1a3a6b;border-radius:16px;overflow:hidden;">

        <tr>
          <td style="background:linear-gradient(135deg,#0f2040,#08142a);padding:32px 40px;text-align:center;border-bottom:1px solid #1a3a6b;">
            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:3px;color:#00d4ff;">CRESTCAPITAL</p>
            <h1 style="margin:12px 0 0;font-size:22px;font-weight:700;color:#eef5ff;">${subject}</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:15px;color:#8eaece;line-height:1.7;">
              Hi <strong style="color:#eef5ff;">${name || "there"}</strong>,
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#8eaece;line-height:1.7;">
              Use the code below to continue. It expires in <strong style="color:#eef5ff;">10 minutes</strong>.
            </p>

            <div style="background:#0f2040;border:1px solid #1a3a6b;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
              <span style="font-size:44px;font-weight:800;letter-spacing:14px;color:#00d4ff;font-family:'Courier New',monospace;">
                ${otp}
              </span>
            </div>

            <p style="margin:0;font-size:13px;color:#6a8fb0;line-height:1.7;">
              If you didn't request this, you can safely ignore this email. Never share this code with anyone.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 40px;border-top:1px solid #1a3a6b;text-align:center;">
            <p style="margin:0;font-size:12px;color:#6a8fb0;">© ${new Date().getFullYear()} CrestCapital. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({ from, to: [to], subject, html });
    if (error) console.error("[email] Resend error:", error);
    else        console.log("[email] Sent via Resend, id:", data?.id);
  } catch (err) {
    console.error("[email] Failed to send:", err.message);
  }
}
