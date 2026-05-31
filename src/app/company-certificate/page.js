import InfoPageLayout from "@/components/InfoPageLayout";

export const metadata = { title:"Company Certificate — CrestCapital" };

export default function CompanyCertificatePage() {
  return (
    <InfoPageLayout title="Company Certificate" subtitle="Official registration and certification details for CrestCapital Ltd.">

      <h2>Company Registration</h2>
      <p>CrestCapital Ltd is a legally registered company authorised to provide digital investment services. The following information constitutes our official registration details.</p>

      <h2>Registration Details</h2>
      <ul>
        <li><strong>Company Name:</strong> CrestCapital Ltd</li>
        <li><strong>Registration Number:</strong> CC-2022-SE-0847</li>
        <li><strong>Registered Office:</strong> Route d'Esch 69, L-1470 Luxembourg City, Luxembourg</li>
        <li><strong>Operational HQ:</strong> Stortingsgata 6, 0161 Oslo, Norway</li>
        <li><strong>Date of Incorporation:</strong> March 2022</li>
        <li><strong>Jurisdiction:</strong> Grand Duchy of Luxembourg</li>
        <li><strong>Business Activity:</strong> Digital Investment Services & Asset Management</li>
      </ul>

      <h2>Regulatory Compliance</h2>
      <p>CrestCapital Ltd operates in compliance with Luxembourg financial services regulations and applicable EU directives on digital asset services. Our operations are subject to oversight by the Commission de Surveillance du Secteur Financier (CSSF) and periodic regulatory audit.</p>
      <ul>
        <li><strong>AML Compliance:</strong> Full Anti-Money Laundering programme in place</li>
        <li><strong>KYC Policy:</strong> Know Your Customer verification required for all members</li>
        <li><strong>Data Protection:</strong> GDPR compliant — registered with the Luxembourg data protection authority (CNPD)</li>
      </ul>

      <h2>Authorised Signatories</h2>
      <p>All official CrestCapital communications, contracts, and legal documents must bear the signature and company seal of an authorised signatory. For verification of any communication claiming to be from CrestCapital, contact <a href="mailto:legal@crestcapital.com">legal@crestcapital.com</a>.</p>

      <h2>Certificate Verification</h2>
      <p>To request a certified copy of our company registration certificate for due diligence purposes, please contact our legal team with your request:</p>
      <p>📧 <a href="mailto:legal@crestcapital.com">legal@crestcapital.com</a></p>
      <p>📍 Route d'Esch 69, L-1470 Luxembourg City, Luxembourg</p>
      <p>We respond to all certificate verification requests within 3 business days.</p>

    </InfoPageLayout>
  );
}
