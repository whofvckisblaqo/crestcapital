import InfoPageLayout from "@/components/InfoPageLayout";

export const metadata = { title:"About Us — CrestCapital", description:"Learn about CrestCapital, our mission, and our investment philosophy." };

export default function AboutPage() {
  return (
    <InfoPageLayout title="About CrestCapital" subtitle="Next-generation digital investment platform built for global investors.">

      <h2>Who We Are</h2>
      <p>CrestCapital is a premier digital investment platform headquartered in Oslo, Norway, and registered in Luxembourg. Founded with the mission to democratise access to high-yield investment opportunities, we serve thousands of investors across more than 80 countries.</p>
      <p>We combine artificial intelligence, blockchain technology, and professional asset management to deliver consistent, transparent returns to our members — regardless of their financial background or experience level.</p>

      <h2>Our Mission</h2>
      <p>To build the world's most trusted digital investment platform — one that gives every individual access to the same wealth-building opportunities previously reserved for institutional investors and the ultra-wealthy.</p>

      <h2>What We Offer</h2>
      <h3>Investment Plans</h3>
      <p>Four carefully structured investment plans — Starter, Growth, Advanced, and Premium — each designed for different capital levels and risk appetites, with daily returns ranging from 0.9% to 3.5%.</p>

      <h3>Real Estate Investments</h3>
      <p>Fractional ownership in premium global real estate — from Manhattan residences to Dubai commercial hubs — allowing investors to earn from property appreciation and rental income without the complexities of direct ownership.</p>

      <h3>Referral Programme</h3>
      <p>Our industry-leading 8% referral commission programme rewards members for growing the CrestCapital community. Every time a referred investor makes their first investment, the referrer earns an instant 8% commission.</p>

      <h2>Our Technology</h2>
      <h3>Artificial Intelligence</h3>
      <p>Our AI-powered portfolio management system continuously analyses global markets, optimises asset allocation, and executes trades at machine speed — maximising returns while managing risk automatically.</p>

      <h3>Blockchain Security</h3>
      <p>All investment records are immutably logged on the blockchain, providing complete transparency and tamper-proof accountability. Members can verify every transaction independently.</p>

      <h3>Two-Factor Authentication & PIN Protection</h3>
      <p>Every account is protected by multi-layer security including email verification, a personal 5-digit PIN, and optional two-factor authentication — ensuring only you can access your funds.</p>

      <h2>Regulatory Compliance</h2>
      <p>CrestCapital operates in full compliance with applicable financial regulations. Our KYC (Know Your Customer) verification process ensures the integrity of our platform and the security of all members.</p>
      <p>We are committed to anti-money laundering (AML) best practices and maintain a zero-tolerance policy for fraudulent activity.</p>

      <h2>Our Values</h2>
      <ul>
        <li><strong>Transparency</strong> — Every fee, every return, every transaction is visible to you at all times.</li>
        <li><strong>Security</strong> — Bank-grade encryption and multi-factor authentication protect your assets.</li>
        <li><strong>Accessibility</strong> — Start investing from as little as $100 with instant account setup.</li>
        <li><strong>Integrity</strong> — We operate with honesty and accountability in everything we do.</li>
        <li><strong>Innovation</strong> — We continuously invest in technology to improve your returns and experience.</li>
      </ul>

      <h2>Contact Us</h2>
      <p>📍 Stortingsgata 6, 0161 Oslo, Norway</p>
      <p>✉️ <a href="mailto:crestcapitalsuport@outlook.com">crestcapitalsuport@outlook.com</a></p>
      <p>Our support team is available 24/7 to assist with any questions or concerns.</p>

    </InfoPageLayout>
  );
}
