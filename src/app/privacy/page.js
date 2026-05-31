import InfoPageLayout from "@/components/InfoPageLayout";

export const metadata = { title:"Privacy Policy — CrestCapital" };

export default function PrivacyPage() {
  return (
    <InfoPageLayout title="Privacy Policy" subtitle="Last updated: January 2025">

      <p>CrestCapital Ltd ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and share your data when you use our platform.</p>

      <h2>1. Information We Collect</h2>
      <h3>Account Information</h3>
      <ul>
        <li>Full name, email address, username, and phone number provided during registration</li>
        <li>Country of residence and address</li>
        <li>Password (stored as a one-way bcrypt hash — we never store plain-text passwords)</li>
        <li>Security PIN (stored as a one-way bcrypt hash)</li>
      </ul>

      <h3>Identity Verification (KYC)</h3>
      <ul>
        <li>Government-issued ID documents (passport, national ID, or driver's licence)</li>
        <li>Front and back images of identity documents</li>
        <li>Country of origin and document type</li>
      </ul>

      <h3>Financial Information</h3>
      <ul>
        <li>Cryptocurrency wallet addresses you provide for withdrawals</li>
        <li>Transaction history, investment records, and balance information</li>
        <li>Deposit and withdrawal amounts and dates</li>
      </ul>

      <h3>Technical Information</h3>
      <ul>
        <li>IP address and device information</li>
        <li>Browser type and operating system</li>
        <li>Pages visited and actions taken on our platform</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To create and manage your account</li>
        <li>To process deposits, investments, and withdrawals</li>
        <li>To verify your identity (KYC compliance)</li>
        <li>To send security alerts, OTP codes, and important account notifications</li>
        <li>To prevent fraud and comply with anti-money laundering (AML) regulations</li>
        <li>To improve our platform and personalise your experience</li>
        <li>To send service communications (we do not send unsolicited marketing emails)</li>
      </ul>

      <h2>3. Data Storage & Security</h2>
      <p>Your data is stored in encrypted MongoDB databases. All sensitive fields (passwords, PINs) are hashed using bcrypt and are never stored in plain text. We use industry-standard TLS encryption for all data in transit.</p>
      <p>Session tokens are managed via NextAuth.js using signed JWT tokens with a 30-day expiry. We do not store session tokens in our database.</p>

      <h2>4. Data Sharing</h2>
      <p>We do not sell your personal data. We may share data with:</p>
      <ul>
        <li><strong>Resend</strong> — email delivery for OTP codes and notifications</li>
        <li><strong>Legal authorities</strong> — only when required by law or court order</li>
        <li><strong>Service providers</strong> — trusted third parties who help operate our platform, bound by confidentiality agreements</li>
      </ul>

      <h2>5. Cookies</h2>
      <p>We use minimal cookies, strictly necessary for authentication (session tokens) and referral code tracking. We do not use advertising or analytics cookies.</p>

      <h2>6. Your Rights</h2>
      <ul>
        <li><strong>Access</strong> — Request a copy of your personal data</li>
        <li><strong>Correction</strong> — Update incorrect information via your Profile settings</li>
        <li><strong>Deletion</strong> — Request account deletion by contacting support</li>
        <li><strong>Portability</strong> — Request your data in a machine-readable format</li>
        <li><strong>Objection</strong> — Object to processing of your data for direct marketing</li>
      </ul>

      <h2>7. Data Retention</h2>
      <p>We retain your account data for the duration of your membership plus 7 years as required by financial regulations. KYC documents are retained for 5 years after account closure.</p>

      <h2>8. Contact</h2>
      <p>For privacy-related enquiries, contact us at <a href="mailto:privacy@crestcapital.com">privacy@crestcapital.com</a> or write to us at Stortingsgata 6, 0161 Oslo, Norway.</p>

    </InfoPageLayout>
  );
}
