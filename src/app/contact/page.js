import InfoPageLayout from "@/components/InfoPageLayout";

export const metadata = { title:"Contact Us — CrestCapital" };

export default function ContactPage() {
  return (
    <InfoPageLayout title="Contact Us" subtitle="We're here 24/7 — reach out and we'll respond as quickly as possible.">

      <h2>Get in Touch</h2>
      <p>Whether you have a question about your account, need help with a deposit or withdrawal, or want to learn more about our investment plans — our support team is always available.</p>

      <h2>Support Channels</h2>
      <h3>📧 Email Support</h3>
      <p><a href="mailto:crestcapitalsuport@outlook.com">crestcapitalsuport@outlook.com</a></p>
      <p>Response time: within 2 hours during business hours, within 24 hours on weekends.</p>

      <h3>💼 Business & Partnerships</h3>
      <p><a href="mailto:business@crestcapital.com">business@crestcapital.com</a></p>

      <h3>⚖️ Legal & Compliance</h3>
      <p><a href="mailto:legal@crestcapital.com">legal@crestcapital.com</a></p>

      <h3>🔒 Security Reports</h3>
      <p><a href="mailto:security@crestcapital.com">security@crestcapital.com</a></p>

      <h2>Registered Office</h2>
      <p>
        CrestCapital Ltd<br/>
        Stortingsgata 6<br/>
        0161 Oslo<br/>
        Norway
      </p>

      <h2>Support Hours</h2>
      <p>Our support team operates <strong>24 hours a day, 7 days a week</strong>, including public holidays. For urgent account-related issues (suspected fraud, account access problems), please email us with the subject line <strong>"URGENT"</strong> for priority handling.</p>

      <h2>Before Contacting Support</h2>
      <p>You may find a faster answer in our resources:</p>
      <ul>
        <li><a href="/#faq">Frequently Asked Questions</a> — covers most common queries</li>
        <li><a href="/security">Security Guide</a> — account security best practices</li>
        <li><a href="/terms">Terms & Conditions</a> — investment rules and policies</li>
        <li><a href="/fraud-prevention">Fraud Prevention</a> — how to stay safe</li>
      </ul>

      <h2>What to Include in Your Email</h2>
      <p>To help us resolve your issue faster, please include:</p>
      <ul>
        <li>Your registered email address or username</li>
        <li>A clear description of the issue</li>
        <li>Any relevant transaction IDs or dates</li>
        <li>Screenshots (if applicable)</li>
      </ul>
      <p><strong>Never include your password or PIN in support messages.</strong> Our team will never ask for these.</p>

    </InfoPageLayout>
  );
}
