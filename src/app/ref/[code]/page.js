"use client";
// /ref/[code] — captures the referral code in a cookie then redirects to signup
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ReferralPage() {
  const router = useRouter();
  const { code } = useParams();

  useEffect(() => {
    if (code) {
      // Store in cookie for 30 days — register route reads this
      document.cookie = `ref=${code.toUpperCase()}; path=/; max-age=${30 * 24 * 3600}; SameSite=Lax`;
    }
    router.replace(`/auth/signup?ref=${code || ""}`);
  }, [code, router]);

  return (
    <div style={{ minHeight:"100vh", background:"#050d1a", display:"flex",
      alignItems:"center", justifyContent:"center", color:"#eef5ff", fontFamily:"sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:16 }}>🔗</div>
        <div style={{ fontSize:16 }}>Redirecting you to sign up…</div>
      </div>
    </div>
  );
}
