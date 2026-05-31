import InfoPageLayout from "@/components/InfoPageLayout";

export const metadata = { title:"Security — CrestCapital" };

export default function SecurityPage() {
  return (
    <InfoPageLayout title="Security" subtitle="Your funds and data are protected by multiple layers of security.">

      <h2>Our Security Architecture</h2>
      <p>CrestCapital was built with security as a first principle. Every layer of our platform — from authentication to data storage — is designed to protect your funds and personal information.</p>

      <h2>Account Security</h2>
      <h3>Two-Step Login</h3>
      <p>Every login requires two separate verifications: your password AND your personal 5-digit PIN. Even if someone obtains your password, they cannot access your account without your PIN.</p>

      <h3>Email Verification</h3>
      <p>New accounts require email verification via a time-limited 6-digit OTP (One-Time Password). OTPs expire after 10 minutes and can only be used once.</p>

      <h3>Two-Factor Authentication (2FA)</h3>
      <p>Users can enable additional 2FA protection from their Profile settings, adding a third layer of verification to every login.</p>

      <h3>Bcrypt Password Hashing</h3>
      <p>Passwords and PINs are hashed using bcrypt with a cost factor of 12. This means even in the extremely unlikely event of a database breach, your actual password cannot be recovered.</p>

      <h2>Data Security</h2>
      <h3>Encryption in Transit</h3>
      <p>All data transmitted between your browser and our servers is encrypted using TLS 1.3. We enforce HTTPS on all connections and do not allow HTTP access.</p>

      <h3>Encrypted Database</h3>
      <p>Sensitive fields in our database are encrypted at rest. Our MongoDB database uses encryption at the storage level, ensuring your data is protected even if physical media is compromised.</p>

      <h3>Minimal Data Collection</h3>
      <p>We only collect information that is strictly necessary for operating the platform. We do not track your browsing behaviour outside of CrestCapital or sell your data.</p>

      <h2>Financial Security</h2>
      <h3>Withdrawal Approval</h3>
      <p>All withdrawal requests go through a manual admin review before funds are sent. This prevents automated draining of accounts in the event of credential compromise.</p>

      <h3>Wallet Address Verification</h3>
      <p>Withdrawal wallet addresses are recorded at the time of each request. We strongly recommend verifying your wallet address before submitting a withdrawal request.</p>

      <h3>Session Management</h3>
      <p>Authentication sessions use signed JWT tokens with a 30-day maximum lifespan. Sessions are invalidated on logout and cannot be extended beyond the maximum.</p>

      <h2>Best Practices for Members</h2>
      <ul>
        <li>Use a unique, strong password (minimum 8 characters with numbers and symbols)</li>
        <li>Never share your password or PIN with anyone — CrestCapital staff will never ask for them</li>
        <li>Enable two-factor authentication in your Profile settings</li>
        <li>Always verify withdrawal wallet addresses before confirming</li>
        <li>Log out of your account when using shared or public devices</li>
        <li>Keep your registered email account secure — it is the recovery method for your account</li>
        <li>Report suspicious activity immediately to <a href="mailto:security@crestcapital.com">security@crestcapital.com</a></li>
      </ul>

      <h2>Reporting Security Issues</h2>
      <p>If you discover a security vulnerability in our platform, please report it responsibly to <a href="mailto:security@crestcapital.com">security@crestcapital.com</a>. We take all reports seriously and aim to respond within 24 hours.</p>

    </InfoPageLayout>
  );
}
