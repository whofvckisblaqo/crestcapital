import InfoPageLayout from "@/components/InfoPageLayout";

export const metadata = { title:"Affiliate Programme — CrestCapital" };

export default function AffiliatePage() {
  return (
    <InfoPageLayout title="Affiliate Programme" subtitle="Earn 8% commission on every referral — unlimited earning potential.">

      <h2>Turn Your Network into Income</h2>
      <p>The CrestCapital Affiliate Programme is one of the most rewarding referral programmes in the digital investment space. Share your unique referral link, and earn an <strong>8% commission</strong> every time someone you refer makes their first investment.</p>

      <h2>How It Works</h2>
      <h3>Step 1 — Get Your Referral Link</h3>
      <p>Log in to your CrestCapital account and navigate to the <strong>Referrals</strong> tab in your dashboard. Your unique referral link and code are displayed there, ready to share.</p>

      <h3>Step 2 — Share with Your Network</h3>
      <p>Share your link on social media, messaging apps, email, or your blog. Anyone who signs up through your link will be permanently linked to your account as your referral.</p>

      <h3>Step 3 — Earn Instantly</h3>
      <p>When your referred contact makes their first investment on CrestCapital, you receive <strong>8% of their investment amount</strong> instantly credited to your balance. No waiting, no minimum thresholds.</p>

      <h2>Commission Structure</h2>
      <ul>
        <li><strong>Commission rate:</strong> 8% of the referred user's first investment</li>
        <li><strong>Payment:</strong> Instant — credited to your balance the moment they invest</li>
        <li><strong>Limit:</strong> No limit — refer as many people as you like</li>
        <li><strong>Tracking:</strong> Real-time referral dashboard showing your referred users and earnings</li>
      </ul>

      <h2>Example Earnings</h2>
      <ul>
        <li>Referral invests <strong>$1,000</strong> → You earn <strong>$80</strong></li>
        <li>Referral invests <strong>$5,000</strong> → You earn <strong>$400</strong></li>
        <li>Referral invests <strong>$20,000</strong> → You earn <strong>$1,600</strong></li>
        <li>10 referrals × $1,000 each → You earn <strong>$800</strong></li>
      </ul>

      <h2>Programme Rules</h2>
      <ul>
        <li>Commission is paid on the referred user's <strong>first investment only</strong></li>
        <li>Self-referral is strictly prohibited and will result in account suspension</li>
        <li>Fake accounts or fraudulent referrals will be reversed and penalised</li>
        <li>Referral commissions are non-withdrawable for 24 hours after crediting (fraud prevention)</li>
        <li>CrestCapital reserves the right to modify commission rates for future referrals with 30 days notice</li>
      </ul>

      <h2>Affiliate Dashboard</h2>
      <p>Track all your referrals in real time from your <strong>Referrals tab</strong> in the dashboard. You can see:</p>
      <ul>
        <li>Total number of referrals</li>
        <li>Total commission earned</li>
        <li>Individual referral activity (masked email for privacy)</li>
        <li>Status of each referral (active / pending)</li>
      </ul>

      <h2>Ready to Start?</h2>
      <p><a href="/auth/signup">Create your free account</a> and access your referral link instantly. Start earning today.</p>

    </InfoPageLayout>
  );
}
