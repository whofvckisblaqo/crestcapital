import InfoPageLayout from "@/components/InfoPageLayout";

export const metadata = { title:"Whitepaper — CrestCapital" };

export default function WhitepaperPage() {
  return (
    <InfoPageLayout title="CrestCapital Whitepaper" subtitle="Our investment methodology, technology, and platform architecture — explained.">

      <h2>Executive Summary</h2>
      <p>CrestCapital is a next-generation digital investment platform that leverages artificial intelligence, blockchain technology, and diversified asset management to deliver consistent daily returns to retail and institutional investors worldwide. This whitepaper outlines our investment strategy, technology infrastructure, security model, and governance framework.</p>

      <h2>1. The Problem We Solve</h2>
      <p>Traditional investment vehicles — savings accounts, bonds, real estate — remain inaccessible to the majority of the global population due to high entry barriers, complex processes, and geographic restrictions. Meanwhile, digital asset markets operate 24/7 and offer significantly higher yield potential, but remain intimidating and technically complex for most investors.</p>
      <p>CrestCapital bridges this gap: a single platform that combines the simplicity of a savings account with the return potential of professional digital asset management.</p>

      <h2>2. Investment Strategy</h2>
      <h3>2.1 AI-Driven Trading</h3>
      <p>Our proprietary AI trading system analyses over 200 market signals across 40+ cryptocurrency pairs, executing trades at microsecond speed. The model is trained on 8+ years of historical market data and continuously learns from current conditions, achieving an average daily return that funds our investment plan payouts.</p>

      <h3>2.2 Arbitrage Operations</h3>
      <p>CrestCapital exploits price inefficiencies across centralised and decentralised exchanges through automated arbitrage. Because arbitrage captures the spread between identical assets on different venues, it generates returns largely independent of broader market direction — providing stability during volatile conditions.</p>

      <h3>2.3 Real Estate Portfolio</h3>
      <p>A portion of capital is allocated to fractional ownership of premium global real estate. Properties are selected in high-demand locations (New York, Dubai, Monaco) with strong rental yield and appreciation potential. Rental income supplements trading returns and provides portfolio stability.</p>

      <h3>2.4 Diversification</h3>
      <p>Capital is distributed across AI trading (55%), real estate (25%), staking/yield farming (15%), and cash reserves (5%), ensuring that no single strategy failure can jeopardise member returns.</p>

      <h2>3. Investment Plans</h2>
      <p>CrestCapital offers four tiered investment plans to accommodate different capital levels:</p>
      <ul>
        <li><strong>Starter:</strong> 0.9% daily · 10 days · $100–$999</li>
        <li><strong>Growth:</strong> 1.4% daily · 15 days · $1,000–$4,999</li>
        <li><strong>Advanced:</strong> 2.0% daily · 21 days · $5,000–$19,999</li>
        <li><strong>Premium:</strong> 3.5% daily · 30 days · $20,000+</li>
      </ul>
      <p>Returns are credited daily. Principal is returned in full upon plan maturity.</p>

      <h2>4. Technology Infrastructure</h2>
      <h3>4.1 Platform</h3>
      <p>CrestCapital is built on Next.js 16 with a MongoDB database, providing a scalable, high-performance architecture capable of handling millions of concurrent users. All API endpoints are server-rendered and secured with JWT authentication.</p>

      <h3>4.2 Security</h3>
      <p>Multi-layer security includes: bcrypt password and PIN hashing (cost factor 12), email OTP verification, two-factor authentication, session JWT tokens, and TLS 1.3 encryption for all data in transit. Withdrawal requests require manual admin approval as an additional fraud prevention layer.</p>

      <h3>4.3 Blockchain Integration</h3>
      <p>Transaction records are immutably logged, providing a complete and tamper-proof audit trail. Members can verify any transaction independently.</p>

      <h2>5. Compliance & Governance</h2>
      <p>CrestCapital operates a full KYC (Know Your Customer) verification programme, requiring members to provide government-issued identity documents. We maintain strict AML (Anti-Money Laundering) policies and report suspicious activity to relevant authorities as required by law.</p>

      <h2>6. Risk Management</h2>
      <p>Investment returns are generated from real trading and asset activities. While we work diligently to maintain consistent returns, all investments carry inherent risk. CrestCapital maintains a capital reserve fund equivalent to 20% of total member deposits to cover any shortfall in a given period.</p>

      <h2>7. Referral & Affiliate Programme</h2>
      <p>CrestCapital's 8% referral commission programme rewards members for growing the community. Commissions are paid instantly on the referred user's first investment, creating a self-sustaining growth engine.</p>

      <h2>Contact</h2>
      <p>For investor enquiries: <a href="mailto:investors@crestcapital.com">investors@crestcapital.com</a></p>

    </InfoPageLayout>
  );
}
