import InfoPageLayout from "@/components/InfoPageLayout";

export const metadata = { title:"Terms & Conditions — CrestCapital" };

export default function TermsPage() {
  return (
    <InfoPageLayout title="Terms & Conditions" subtitle="Please read these terms carefully before using CrestCapital.">

      <p>By accessing or using the CrestCapital platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

      <h2>1. Eligibility</h2>
      <p>You must be at least 18 years of age to create an account on CrestCapital. By registering, you confirm that you are legally permitted to participate in investment activities in your country of residence.</p>

      <h2>2. Account Registration</h2>
      <ul>
        <li>You must provide accurate and complete information during registration</li>
        <li>You are responsible for maintaining the confidentiality of your password and PIN</li>
        <li>You must notify us immediately of any unauthorised access to your account</li>
        <li>Each person may only hold one account on the platform</li>
      </ul>

      <h2>3. Identity Verification (KYC)</h2>
      <p>To access full platform features (withdrawals above certain thresholds, higher investment limits), you must complete our Know Your Customer (KYC) verification by submitting a valid government-issued photo ID. CrestCapital reserves the right to reject or request additional documentation.</p>

      <h2>4. Investment Plans</h2>
      <p>CrestCapital offers four investment plans (Starter, Growth, Advanced, Premium) with daily return rates. These returns are generated from our diversified portfolio of digital assets, real estate, and AI-driven trading strategies.</p>
      <ul>
        <li>Returns are credited daily to your account balance</li>
        <li>Your invested principal is locked for the plan duration and returned upon maturity</li>
        <li>Plans cannot be cancelled once started; you must wait for the investment to mature</li>
        <li>Return rates are subject to change for new investments (existing investments are unaffected)</li>
      </ul>

      <h2>5. Deposits</h2>
      <ul>
        <li>Deposits are made in cryptocurrency (BTC, ETH, USDT, BNB, or other listed coins)</li>
        <li>Deposits are subject to minimum and maximum limits set by the platform</li>
        <li>Your balance is credited only after admin confirmation of receipt</li>
        <li>CrestCapital is not responsible for cryptocurrency sent to incorrect addresses</li>
      </ul>

      <h2>6. Withdrawals</h2>
      <ul>
        <li>Withdrawals are processed within 30 minutes to 24 hours, subject to admin approval</li>
        <li>Withdrawals are subject to minimum and maximum limits</li>
        <li>You are solely responsible for providing correct withdrawal wallet addresses</li>
        <li>CrestCapital cannot reverse withdrawals sent to incorrect addresses</li>
      </ul>

      <h2>7. Referral Programme</h2>
      <p>Members earn an 8% commission on the first investment made by each referred user. Commissions are credited instantly to your balance. Referral abuse (self-referral, fake accounts) will result in immediate account termination and forfeiture of commissions.</p>

      <h2>8. Prohibited Activities</h2>
      <ul>
        <li>Creating multiple accounts</li>
        <li>Self-referral or referral fraud</li>
        <li>Money laundering or financing of illegal activities</li>
        <li>Attempting to hack, exploit, or reverse-engineer the platform</li>
        <li>Providing false identity information</li>
        <li>Using the platform from sanctioned countries or jurisdictions</li>
      </ul>

      <h2>9. Risk Disclaimer</h2>
      <p>All investments carry risk. Past performance is not indicative of future results. While CrestCapital works diligently to maintain consistent returns, we cannot guarantee specific outcomes. You should only invest funds you can afford to lose.</p>

      <h2>10. Limitation of Liability</h2>
      <p>CrestCapital shall not be liable for losses arising from market conditions, force majeure events, third-party service failures, or user error (including incorrect withdrawal addresses). Our total liability to any user shall not exceed the amount invested in their account.</p>

      <h2>11. Account Suspension & Termination</h2>
      <p>CrestCapital reserves the right to suspend or terminate accounts that violate these terms, engage in suspicious activity, or fail KYC verification. In such cases, any pending investments will be liquidated and remaining balance returned after a 30-day review period.</p>

      <h2>12. Changes to Terms</h2>
      <p>We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify registered users of material changes via email.</p>

      <h2>13. Governing Law</h2>
      <p>These Terms are governed by the laws of the Grand Duchy of Luxembourg. Any disputes shall be resolved through arbitration in Luxembourg City, Luxembourg.</p>

      <h2>14. Contact</h2>
      <p>Questions about these Terms? Contact us at <a href="mailto:legal@crestcapital.com">legal@crestcapital.com</a>.</p>

    </InfoPageLayout>
  );
}
