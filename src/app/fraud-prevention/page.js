import InfoPageLayout from "@/components/InfoPageLayout";

export const metadata = { title:"Fraud Prevention — CrestCapital" };

export default function FraudPage() {
  return (
    <InfoPageLayout title="Fraud Prevention" subtitle="Protect yourself — know how to identify genuine CrestCapital communications.">

      <h2>Protecting Our Members</h2>
      <p>CrestCapital takes fraud prevention extremely seriously. As our platform grows, so does the risk of impersonators and scammers attempting to exploit our members. This page helps you identify genuine CrestCapital communications and avoid fraud.</p>

      <h2>What CrestCapital Will NEVER Do</h2>
      <ul>
        <li><strong>Never</strong> ask for your password or PIN — not by email, chat, or phone</li>
        <li><strong>Never</strong> ask you to send cryptocurrency to "verify your account"</li>
        <li><strong>Never</strong> contact you via WhatsApp, Telegram, or personal social media to request funds</li>
        <li><strong>Never</strong> promise guaranteed returns beyond our published plan rates</li>
        <li><strong>Never</strong> ask you to download remote access software (TeamViewer, AnyDesk, etc.)</li>
        <li><strong>Never</strong> request your 2FA codes or OTP verification codes</li>
        <li><strong>Never</strong> ask you to pay a "withdrawal fee" or "tax clearance fee" to release funds</li>
      </ul>

      <h2>Official Communication Channels</h2>
      <p>CrestCapital <strong>only</strong> communicates through these official channels:</p>
      <ul>
        <li>📧 Email from <strong>crestcapitalsuport@outlook.com</strong> (our official support address)</li>
        <li>🌐 Our website at the official domain</li>
        <li>🔔 In-platform notifications (only visible when you are logged in)</li>
      </ul>
      <p>If you receive communication claiming to be from CrestCapital from any other email address or source, treat it as fraudulent.</p>

      <h2>Common Scam Tactics</h2>
      <h3>Fake Account Recovery Scams</h3>
      <p>Scammers may contact you claiming your account has been "flagged" or "frozen" and that you must send funds to restore access. This is always a scam. Contact us directly through official channels if you have access issues.</p>

      <h3>Impersonator Accounts</h3>
      <p>Fraudsters create fake social media profiles pretending to be CrestCapital or CrestCapital staff. Always verify any social media account is our official, verified account before engaging.</p>

      <h3>"Upgrade Fee" Scams</h3>
      <p>No legitimate investment platform charges fees to release your own money. If anyone asks you to pay to "unlock" a withdrawal or "upgrade" your account, it is a scam.</p>

      <h3>Phishing Emails</h3>
      <p>Fraudulent emails may mimic our branding and direct you to fake login pages designed to steal your credentials. Always check that the URL in your browser shows our official domain before entering your login details.</p>

      <h2>How to Stay Safe</h2>
      <ul>
        <li>Bookmark our official website and always navigate directly to it</li>
        <li>Never click links in unsolicited emails — type our address directly</li>
        <li>Enable two-factor authentication on your CrestCapital account</li>
        <li>Use a unique password not used on any other website</li>
        <li>Regularly check your account's transaction history for suspicious activity</li>
        <li>Trust your instincts — if something feels wrong, it probably is</li>
      </ul>

      <h2>Report Suspicious Activity</h2>
      <p>If you believe you have been targeted by fraud or have identified a scam impersonating CrestCapital, please report it immediately:</p>
      <p>📧 <a href="mailto:crestcapitalsuport@outlook.com">crestcapitalsuport@outlook.com</a></p>
      <p>Include as much detail as possible: contact details of the scammer, screenshots, and any other relevant information. Your report helps protect our entire community.</p>

    </InfoPageLayout>
  );
}
