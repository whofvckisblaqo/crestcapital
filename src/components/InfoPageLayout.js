"use client";
// Shared layout for all legal/info pages (About, Privacy, Terms, etc.)

const t = {
  navy:"#050d1a", navyMid:"#08142a", navyLight:"#0f2040",
  navyBorder:"#1a3a6b", navyCard:"rgba(10,22,40,0.95)",
  cyan:"#00d4ff", cyanDim:"#00a8cc", cyanGlow2:"rgba(0,212,255,0.07)",
  green:"#00e096", white:"#eef5ff", muted:"#6a8fb0", mutedLight:"#8eaece",
};

export default function InfoPageLayout({ title, subtitle, children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@0,300;0,400;0,500;0,600;0,700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { background:${t.navy}; color:${t.white}; font-family:'DM Sans',sans-serif; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:${t.navy}; }
        ::-webkit-scrollbar-thumb { background:${t.navyBorder}; border-radius:3px; }
        h2 { font-family:'Syne',sans-serif; font-weight:700; font-size:22px; color:${t.white}; margin:36px 0 14px; }
        h3 { font-family:'Syne',sans-serif; font-weight:600; font-size:17px; color:${t.cyan}; margin:24px 0 10px; }
        p  { color:${t.muted}; font-size:15px; line-height:1.85; margin-bottom:14px; }
        ul { color:${t.muted}; font-size:15px; line-height:1.85; padding-left:22px; margin-bottom:14px; }
        ul li { margin-bottom:6px; }
        a  { color:${t.cyan}; text-decoration:none; } a:hover { opacity:.8; }
        strong { color:${t.white}; }
      `}</style>

      {/* Navbar */}
      <nav style={{ borderBottom:`1px solid ${t.navyBorder}`, padding:"18px 5%",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        position:"sticky", top:0, background:"rgba(5,13,26,0.95)", backdropFilter:"blur(12px)", zIndex:100 }}>
        <a href="/" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20,
          color:t.white, textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:t.cyan,
            boxShadow:`0 0 12px ${t.cyan}`, display:"inline-block" }} />
          CrestCapital
        </a>
        <div style={{ display:"flex", gap:12 }}>
          <a href="/auth/login"
            style={{ padding:"8px 20px", borderRadius:8, border:`1px solid ${t.navyBorder}`,
              color:t.white, fontSize:14, fontWeight:500, textDecoration:"none", transition:"all .2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=t.cyan;e.currentTarget.style.color=t.cyan;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=t.navyBorder;e.currentTarget.style.color=t.white;}}>
            Login
          </a>
          <a href="/auth/signup"
            style={{ padding:"8px 20px", borderRadius:8,
              background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
              color:t.navy, fontSize:14, fontWeight:700, textDecoration:"none" }}>
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding:"72px 5% 48px", background:`linear-gradient(180deg,${t.navyMid},${t.navy})`,
        borderBottom:`1px solid ${t.navyBorder}` }}>
        <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
            fontSize:"clamp(28px,4vw,48px)", letterSpacing:"-1px", marginBottom:16 }}>
            {title}
          </div>
          {subtitle && <p style={{ fontSize:17, color:t.muted, maxWidth:560, margin:"0 auto" }}>{subtitle}</p>}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"56px 5% 80px" }}>
        {children}
      </div>

      {/* Footer */}
      <footer style={{ borderTop:`1px solid ${t.navyBorder}`, padding:"32px 5%",
        display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12, alignItems:"center" }}>
        <div style={{ color:t.muted, fontSize:13 }}>
          © {new Date().getFullYear()} CrestCapital Ltd. All rights reserved.
        </div>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
          {[["Home","/"],["Privacy","/privacy"],["Terms","/terms"],["Legal","/legal"],["Contact","/contact"]].map(([l,href])=>(
            <a key={l} href={href} style={{ color:t.muted, fontSize:13, textDecoration:"none",
              transition:"color .2s" }}
              onMouseEnter={e=>e.target.style.color=t.cyan}
              onMouseLeave={e=>e.target.style.color=t.muted}>{l}</a>
          ))}
        </div>
      </footer>
    </>
  );
}
