// ============================================================
//  CrestCapital — Landing Page  (Step 1 / Phase 1)
//  FILE LOCATION: src/app/page.jsx   (Next.js App Router)
//                 OR src/pages/index.jsx (Next.js Pages Router)
//
//  Fonts loaded in:  src/app/layout.jsx  (see note at bottom)
//  Fully responsive: mobile / tablet / desktop
// ============================================================

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
export default function CrestCapitalLanding() {
  const router = useRouter();
  const go = (path) => router.push(path);
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ background:t.navy, color:t.white, fontFamily:"'DM Sans',sans-serif", overflowX:"hidden" }}>
        <Navbar  onLogin={()=>go("/auth/login")} onSignup={()=>go("/auth/signup")} />
        <Hero    onSignup={()=>go("/auth/signup")} />
        <BridgeSection onLogin={()=>go("/auth/login")} />
        <HowItWorks />
        <PressCoverage />
        <Plans   onSignup={()=>go("/auth/signup")} />
        <Leaders />
        <Arbitrage />
        <Loans   onSignup={()=>go("/auth/signup")} />
        <RealEstateSection onSignup={()=>go("/auth/signup")} />
        <WhyUs   onSignup={()=>go("/auth/signup")} />
        <WhatElse onSignup={()=>go("/auth/signup")} />
        <Counters />
        <Reviews />
        <FAQ />
        <CTABanner onSignup={()=>go("/auth/signup")} />
        <Footer />
      </div>
    </>
  );
}

// ─── THEME ────────────────────────────────────────────────────────────────────
const t = {
  navy:        "#050d1a",
  navyMid:     "#08142a",
  navyLight:   "#0f2040",
  navyCard:    "rgba(10,22,40,0.92)",
  navyBorder:  "#1a3a6b",
  cyan:        "#00d4ff",
  cyanDim:     "#00a8cc",
  cyanGlow:    "rgba(0,212,255,0.16)",
  cyanGlow2:   "rgba(0,212,255,0.07)",
  gold:        "#f0c040",
  white:       "#eef5ff",
  muted:       "#6a8fb0",
  mutedLight:  "#8eaece",
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { background:${t.navy}; color:${t.white}; font-family:'DM Sans',sans-serif; overflow-x:hidden; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${t.navy}; }
  ::-webkit-scrollbar-thumb { background:${t.navyBorder}; border-radius:3px; }
  ::-webkit-scrollbar-thumb:hover { background:${t.cyan}; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ticker   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 10px ${t.cyan}} 50%{box-shadow:0 0 28px ${t.cyan}} }

  /* ── Responsive utility classes ── */
  .hide-mobile  { display:flex; }
  .show-mobile  { display:none; }
  .nav-links    { display:flex; }
  .nav-actions  { display:flex; }

  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:64px; }
  .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
  .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:22px; }
  .grid-auto-280 { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:22px; }
  .grid-auto-240 { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:18px; }
  .counter-grid  { display:grid; grid-template-columns:repeat(4,1fr); }
  .footer-grid   { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; gap:40px; }
  .stats-row     { display:flex; gap:0; }

  @media (max-width:1024px) {
    .grid-2        { grid-template-columns:1fr; gap:40px; }
    .footer-grid   { grid-template-columns:1fr 1fr; gap:32px; }
    .counter-grid  { grid-template-columns:repeat(2,1fr); }
    .stats-row     { flex-wrap:wrap; }
  }

  @media (max-width:768px) {
    .hide-mobile  { display:none !important; }
    .show-mobile  { display:flex !important; }
    .nav-links    { display:none !important; }
    .nav-actions  { display:none !important; }
    .grid-3       { grid-template-columns:1fr; }
    .grid-4       { grid-template-columns:1fr 1fr; gap:14px; }
    .grid-auto-280{ grid-template-columns:1fr; }
    .grid-auto-240{ grid-template-columns:1fr; }
    .counter-grid { grid-template-columns:1fr 1fr; }
    .footer-grid  { grid-template-columns:1fr; gap:28px; }
    .stats-row    { flex-direction:column; align-items:center; }
    .hero-ctas    { flex-direction:column; align-items:center; }
    .plans-grid   { grid-template-columns:1fr !important; }
    .pill-grid    { grid-template-columns:1fr 1fr !important; }
    .loan-inner   { grid-template-columns:1fr !important; text-align:center; }
    .asset-table  { display:none; }
    .arbitrage-grid { grid-template-columns:1fr !important; }
  }

  @media (max-width:480px) {
    .grid-4       { grid-template-columns:1fr; }
    .counter-grid { grid-template-columns:1fr 1fr; }
    .pill-grid    { grid-template-columns:1fr !important; }
    .mobile-full  { width:100% !important; }
  }

  /* Hover card lift */
  .lift:hover { transform:translateY(-4px); transition:transform .25s,border-color .25s; }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const GlowOrb = ({ style }) => (
  <div style={{ position:"absolute", borderRadius:"50%", filter:"blur(90px)", pointerEvents:"none", zIndex:0, ...style }} />
);
const Tag = ({ children }) => (
  <div style={{ fontSize:11, fontWeight:700, letterSpacing:"3px", color:t.cyan, textTransform:"uppercase", marginBottom:14 }}>
    {children}
  </div>
);
const SectionTitle = ({ children, style }) => (
  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(24px,4vw,46px)",
    letterSpacing:"-1px", lineHeight:1.1, ...style }}>{children}</h2>
);
const Divider = () => <div style={{ height:1, background:t.navyBorder }} />;

const btnBase = { fontFamily:"'DM Sans',sans-serif", cursor:"pointer", border:"none", borderRadius:10, fontWeight:700, transition:"all .22s" };
const BtnPrimary = ({ children, onClick, style, className }) => (
  <button onClick={onClick} className={className}
    style={{ ...btnBase, background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
      color:t.navy, padding:"13px 28px", fontSize:15, boxShadow:`0 6px 28px ${t.cyanGlow}`, ...style }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 12px 40px ${t.cyanGlow}`;}}
    onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 6px 28px ${t.cyanGlow}`;}}>
    {children}
  </button>
);
const BtnOutline = ({ children, onClick, style, className }) => (
  <button onClick={onClick} className={className}
    style={{ ...btnBase, background:"transparent", border:`1px solid ${t.navyBorder}`,
      color:t.white, padding:"13px 28px", fontSize:15, ...style }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=t.cyan;e.currentTarget.style.color=t.cyan;}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=t.navyBorder;e.currentTarget.style.color=t.white;}}>
    {children}
  </button>
);

// ─── DATA ─────────────────────────────────────────────────────────────────────
const HERO_PILLS = [
  { icon:"🔍", title:"Full Transparency",   desc:"Fund distribution under strict control of financiers and auditors, completely ruling out inaccuracies." },
  { icon:"🔒", title:"Fully Encrypted",     desc:"Complete security of every transaction powered by blockchain technology and cryptocurrency." },
  { icon:"⚡", title:"Instant Withdrawal",  desc:"Our AI system processes all transactions instantly when due — intelligently queued during peak periods." },
  { icon:"🛡️", title:"Safe and Secure",     desc:"A new strategy for crypto arbitrage where only you act as the custodian of your personal assets." },
];

const HOW_IT_WORKS = [
  { n:"01", icon:"👤", title:"Open an Account",            desc:"Register with your email and personal info in minutes. Receive a confirmation and get instant access to your member dashboard." },
  { n:"02", icon:"💳", title:"Account Funding",            desc:"Go to the deposit section, choose an investment plan, and fund it. Each deposit is treated as a separate investment." },
  { n:"03", icon:"📈", title:"Watch Your Investment Grow", desc:"Earnings accrue hourly on autopilot. Be anywhere in the world — your interest keeps building automatically." },
  { n:"04", icon:"🏦", title:"Initiate Withdrawals",       desc:"Withdrawals take seconds to request. Funds are processed to your verified wallet address within minutes." },
  { n:"05", icon:"🔗", title:"Refer Your Friends",         desc:"No active deposit needed. Share your affiliate link and earn 8% first-level commission on your referral's first deposit." },
  { n:"06", icon:"☕", title:"That's It",                  desc:"Relax while we do the hard work. Our AI engine and expert team manage everything — you simply watch your portfolio grow." },
];

const SERVICES = [
  "A Better Way to Invest","Finance Planning","Stake And Share In One Account",
  "Store Crypto-Currency Value","The Simplest Way To Invest In Crypto",
  "Loans And Crypto Lending","Affiliates and Partnerships","Investing in Real Estate",
];

const PLANS = [
  { name:"Starter",  rate:"0.9", dur:"10 Days", min:"$100",    max:"$999",      ref:"8%", featured:false },
  { name:"Growth",   rate:"1.4", dur:"15 Days", min:"$1,000",  max:"$4,999",    ref:"8%", featured:true  },
  { name:"Advanced", rate:"2.0", dur:"21 Days", min:"$5,000",  max:"$19,999",   ref:"8%", featured:false },
  { name:"Premium",  rate:"3.5", dur:"30 Days", min:"$20,000", max:"Unlimited", ref:"8%", featured:false },
];

const PRESS = ["NNL","NYWEEKLY","VENTS","DISRUPT","FOX INTERVIEWER","LA PROGRESSIVE","BALTIMORE","BLOCKPUBLISHER",
  "NEWSMARITIME","METAPRESS","LOOP21","BITTFLEX","THEHACKPOST","MARKETWATCH","ENEWS","NASDAQ","YAHOO FINANCE",
  "BLOOMBERG","THEMARKETINGFOLKS","INVESTING.COM","DAILYCOIN"];

const PILLARS = [
  { icon:"🤖", title:"Artificial Intelligence", desc:"AI operating systems will transform investment operations and foster ultra-fast processing of funds — just as the Internet once did." },
  { icon:"⛓️", title:"Blockchain Technology",   desc:"With blockchain, more of everything in the world becomes fungible, liquid, and quantified — creating real investable value." },
  { icon:"⚙️", title:"Digital Automations",     desc:"We engage clients on a new level of asset management experience, accessible from anywhere, at any time." },
  { icon:"💎", title:"Added Value",             desc:"We empower customers to take control of their money management and make smarter financial decisions every day." },
];

const WHY_US = [
  { icon:"⚖️", title:"Legal Company",      desc:"Certified to operate investment business. Fully compliant and operating within all applicable legal frameworks." },
  { icon:"🏅", title:"High Reliability",    desc:"Trusted by a huge number of people. We constantly improve our security systems to minimize all possible risks." },
  { icon:"⚡", title:"Quick Withdrawal",    desc:"All withdrawals processed spontaneously once requested, with high maximum limits and no unnecessary delays." },
  { icon:"🔗", title:"Referral Program",    desc:"Earn 8% commission on referral income through our affiliate program — increase your income by referring others." },
  { icon:"📞", title:"24/7 Support",        desc:"Support representatives available around the clock to help you with any difficulty at any time." },
  { icon:"🖥️", title:"Dedicated Server",    desc:"We use a dedicated server which allows us exclusive use of all resources — ensuring maximum uptime and speed." },
  { icon:"🔐", title:"SSL Security",        desc:"Comodo Essential-SSL encryption confirms all content is genuine and legitimate, protecting every transaction." },
  { icon:"🛡️", title:"DDoS Protection",     desc:"We partner with one of the most experienced and trusted DDoS protection and mitigation providers available." },
];

const TRADE_ASSETS = ["Stocks","Forex","Commodities","Indices","Precious Metals","NFP","Energies","Shares","Real Estate"];

const FAQS = [
  { q:"What is CrestCapital?",
    a:"CrestCapital is a full digital investment company accessible via smartphones and smart devices. It offers easy, fast, and reliable solutions designed not only to meet your investment needs but to ultimately improve the quality of your life." },
  { q:"What are the benefits of CrestCapital?",
    a:"CrestCapital lets you control where, when, and how your cryptocurrencies yield interest. Say goodbye to volatility — the platform acts as a hedge against unexpected market outcomes or sharp declines in crypto prices." },
  { q:"Who can use CrestCapital?",
    a:"Individuals (18 years and above), Institutional and Organizational Investors, and Corporates are all welcome to invest." },
  { q:"How do I make a withdrawal?",
    a:"Your deposit must complete its accumulation period based on your chosen plan. Update your wallet address in your dashboard, click Request Withdrawal, enter the amount, and admin processes the payment with a deposit proof sent to you." },
  { q:"How do I make a deposit?",
    a:"Log in, click Make Deposit, select your plan and coin, and enter your amount. A QR code will be generated — scan it or copy the wallet address. Your account is updated once admin approves your payment." },
  { q:"Where do you generate the interest you pay?",
    a:"We engage in Real Estate, Shipping of Goods and Services, Gold Mining, CFDs on Stocks, ETFs, Government Bonds, Recycling of Waste Materials, and Bitcoin Mining — among several other diversified income streams." },
  { q:"How does my interest accumulate?",
    a:"Returns are calculated based on the investment plan you chose at deposit. Each plan has a daily accumulation rate — interest accrues every hour automatically with no action required from you." },
];

const REVIEWS = [
  { name:"Alexander M.",   loc:"Russia",         year:2023, text:"Joining CrestCapital was one of the best financial decisions I have made. The platform is transparent, and the returns have been consistent. Every step is well explained and you always feel in control." },
  { name:"Emily Carter",   loc:"United Kingdom", year:2024, text:"I was initially skeptical, but CrestCapital completely changed my perspective. The onboarding was smooth, the strategies are well explained, and I've seen steady growth in my portfolio." },
  { name:"Rajesh Patel",   loc:"India",          year:2025, text:"As a first-time investor I needed guidance — they delivered beyond expectations. User-friendly platform, supportive team, and truly rewarding returns that have made investing simple and accessible." },
  { name:"Maria González", loc:"Spain",          year:2023, text:"Consistency and reliability are everything in investment, and that is exactly what CrestCapital delivers. Smooth transactions, timely payouts, and excellent communication at every turn." },
  { name:"Michael Chen",   loc:"Canada",         year:2024, text:"CrestCapital stands out for their focus on long-term value. Regular updates and transparent strategy make you feel like a valued partner, not just a client. My portfolio has grown steadily since day one." },
];

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); setMenuOpen(false); };

  const navLinks = [["about","Who We Are"],["how-it-works","How It Works"],["plans","Plans"],["faq","FAQ"],["contact","Mail Us"]];

  return (
    <>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, height:70,
        display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 5%",
        background: scrolled ? "rgba(5,13,26,0.97)" : "rgba(5,13,26,0.75)",
        backdropFilter:"blur(24px)", borderBottom:`1px solid ${scrolled ? t.navyBorder : "transparent"}`,
        transition:"all .3s" }}>

        {/* Logo */}
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.5px",
          display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={()=>go("top")}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:t.cyan,
            boxShadow:`0 0 14px ${t.cyan}`, display:"inline-block", animation:"glow 2s infinite" }} />
          CrestCapital
        </div>

        {/* Desktop links */}
        <ul className="nav-links" style={{ gap:34, listStyle:"none", padding:0 }}>
          {navLinks.map(([id,label]) => (
            <li key={id} style={{ color:t.muted, fontSize:14, fontWeight:500, cursor:"pointer", transition:"color .2s" }}
              onClick={()=>go(id)}
              onMouseEnter={e=>e.target.style.color=t.white}
              onMouseLeave={e=>e.target.style.color=t.muted}>{label}</li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="nav-actions" style={{ gap:10 }}>
          <BtnOutline onClick={onLogin}  style={{ padding:"8px 20px", fontSize:14 }}>Login</BtnOutline>
          <BtnPrimary onClick={onSignup} style={{ padding:"8px 20px", fontSize:14 }}>Sign Up</BtnPrimary>
        </div>

        {/* Mobile hamburger */}
        <button className="show-mobile" onClick={()=>setMenuOpen(!menuOpen)}
          style={{ background:"transparent", border:`1px solid ${t.navyBorder}`, color:t.white,
            padding:"8px 12px", borderRadius:8, cursor:"pointer", fontSize:18, alignItems:"center" }}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ position:"fixed", top:70, left:0, right:0, zIndex:199,
          background:"rgba(5,13,26,0.98)", backdropFilter:"blur(24px)",
          borderBottom:`1px solid ${t.navyBorder}`, padding:"24px 5%",
          display:"flex", flexDirection:"column", gap:4 }}>
          {navLinks.map(([id,label]) => (
            <div key={id} onClick={()=>go(id)}
              style={{ padding:"14px 16px", color:t.muted, fontSize:15, fontWeight:500, cursor:"pointer",
                borderRadius:8, transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=t.navyLight;e.currentTarget.style.color=t.white;}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=t.muted;}}>
              {label}
            </div>
          ))}
          <div style={{ display:"flex", gap:10, marginTop:12 }}>
            <BtnOutline onClick={onLogin}  style={{ flex:1, padding:"11px", fontSize:14, textAlign:"center" }}>Login</BtnOutline>
            <BtnPrimary onClick={onSignup} style={{ flex:1, padding:"11px", fontSize:14 }}>Sign Up</BtnPrimary>
          </div>
        </div>
      )}
    </>
  );
}

// ─── HERO CANVAS (animated particle network) ──────────────────────────────────
function HeroCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 90;
    const pts = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.8 + 0.8,
      ph: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark background gradient
      const bg = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.35, 0,
        canvas.width * 0.5, canvas.height * 0.35, canvas.width * 0.75
      );
      bg.addColorStop(0, "rgba(8,20,42,0.98)");
      bg.addColorStop(1, "rgba(5,13,26,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Move particles
      pts.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.ph += 0.018;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx   = pts[i].x - pts[j].x;
          const dy   = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const a = 0.18 * (1 - dist / 160);
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${a})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      pts.forEach(p => {
        const glow = 0.55 + Math.sin(p.ph) * 0.25;
        // Outer glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        grad.addColorStop(0, `rgba(0,212,255,${glow * 0.25})`);
        grad.addColorStop(1, "rgba(0,212,255,0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${glow})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={ref} style={{
      position:"absolute", inset:0, width:"100%", height:"100%", zIndex:0, display:"block",
    }} />
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onSignup }) {
  const [counts, setCounts] = useState({ investors:0, assets:0, countries:0, uptime:0 });
  useEffect(() => {
    const targets = { investors:42, assets:280, countries:100, uptime:99 };
    let f = 0;
    const id = setInterval(() => {
      f++; const p = 1 - Math.pow(1 - f/70, 3);
      setCounts({ investors:Math.floor(p*targets.investors), assets:Math.floor(p*targets.assets),
        countries:Math.floor(p*targets.countries), uptime:Math.floor(p*targets.uptime) });
      if(f>=70) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="top" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", textAlign:"center", padding:"120px 5% 60px", position:"relative", overflow:"hidden" }}>

      {/* Hero background photo */}
      <div style={{ position:"absolute", inset:0, zIndex:0,
        backgroundImage:"url('/hero-bg.png')",
        backgroundSize:"cover", backgroundPosition:"center", backgroundRepeat:"no-repeat" }} />

      {/* Dark overlay to preserve readability */}
      <div style={{ position:"absolute", inset:0, zIndex:0,
        background:"linear-gradient(180deg,rgba(4,10,28,0.72) 0%,rgba(4,10,28,0.55) 50%,rgba(4,10,28,0.82) 100%)" }} />

      {/* Animated particle network background */}
      <HeroCanvas />

      <div style={{ position:"absolute", inset:0, zIndex:0,
        backgroundImage:`linear-gradient(rgba(0,212,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.018) 1px,transparent 1px)`,
        backgroundSize:"64px 64px" }} />
      <GlowOrb style={{ width:"min(700px,90vw)", height:"min(700px,90vw)", background:"rgba(0,212,255,0.04)", top:"5%", left:"50%", transform:"translateX(-50%)" }} />
      <GlowOrb style={{ width:280, height:280, background:"rgba(0,80,200,0.08)", top:"25%", left:"3%" }} />
      <GlowOrb style={{ width:220, height:220, background:"rgba(0,212,255,0.06)", bottom:"20%", right:"5%" }} />

      <div style={{ position:"relative", zIndex:1, animation:"fadeUp .7s ease both", width:"100%" }}>
        {/* Badge */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:t.cyanGlow2,
          border:`1px solid rgba(0,212,255,0.22)`, borderRadius:100, padding:"6px 18px",
          fontSize:"clamp(11px,2vw,13px)", color:t.cyan, marginBottom:28, fontWeight:500 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:t.cyan,
            display:"inline-block", animation:"pulse 2s infinite" }} />
          Next-Generation Digital Investment Platform
        </div>

        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(36px,7vw,82px)",
          lineHeight:1.04, letterSpacing:"clamp(-1px,-0.03em,-2.5px)", maxWidth:920, margin:"0 auto 22px",
          background:`linear-gradient(140deg,${t.white} 35%,${t.cyan})`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          Invest and Secure<br />the Future!
        </h1>

        <p style={{ fontSize:"clamp(15px,2vw,19px)", color:t.muted, maxWidth:560, margin:"0 auto 14px", lineHeight:1.72 }}>
          Digital Investment Management for all — bridge your crypto and cash with AI-powered precision.
        </p>
        <p style={{ fontSize:"clamp(13px,1.5vw,15px)", color:t.mutedLight, maxWidth:500, margin:"0 auto 40px", lineHeight:1.7, fontStyle:"italic" }}>
          "We share a purpose to inspire and build better wealth — combining tools, skills, expertise, and a passion for innovation."
        </p>

        <div className="hero-ctas" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginBottom:52 }}>
          <BtnPrimary onClick={onSignup} style={{ padding:"clamp(12px,2vw,16px) clamp(24px,4vw,40px)", fontSize:"clamp(14px,2vw,16px)" }}
            className="mobile-full">Get Started →</BtnPrimary>
          <BtnOutline style={{ padding:"clamp(12px,2vw,16px) clamp(24px,4vw,40px)", fontSize:"clamp(14px,2vw,16px)" }}
            className="mobile-full"
            onClick={()=>document.getElementById("how-it-works")?.scrollIntoView({behavior:"smooth"})}>
            How It Works
          </BtnOutline>
        </div>

        {/* Stats bar */}
        <div className="stats-row" style={{ justifyContent:"center", background:t.navyCard,
          border:`1px solid ${t.navyBorder}`, borderRadius:16, overflow:"hidden",
          maxWidth:720, margin:"0 auto 52px", width:"100%" }}>
          {[
            [`${counts.investors}K+`, "Active Investors"],
            [`$${counts.assets}M+`,  "Assets Managed"],
            [`${counts.countries}+`, "Countries Served"],
            [`${counts.uptime}%`,    "Platform Uptime"],
          ].map(([num, label], i) => (
            <div key={i} style={{ flex:1, minWidth:120, padding:"22px 14px", textAlign:"center",
              borderRight: i < 3 ? `1px solid ${t.navyBorder}` : "none" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(22px,3vw,28px)", fontWeight:800,
                color:t.cyan, letterSpacing:"-1px" }}>{num}</div>
              <div style={{ fontSize:"clamp(11px,1.2vw,12px)", color:t.muted, marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Hero Pills */}
        <div className="pill-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          gap:14, maxWidth:1000, width:"100%", margin:"0 auto" }}>
          {HERO_PILLS.map((p, i) => (
            <div key={i} className="lift" style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
              borderRadius:14, padding:"22px 18px", textAlign:"left",
              animation:`fadeUp .6s ${0.1*i}s ease both` }}>
              <div style={{ fontSize:22, marginBottom:10 }}>{p.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"clamp(13px,1.5vw,15px)", marginBottom:8 }}>{p.title}</div>
              <div style={{ color:t.muted, fontSize:13, lineHeight:1.65 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BRIDGE SECTION ───────────────────────────────────────────────────────────
function BridgeSection({ onLogin }) {
  return (
    <section style={{ background:t.navyMid, padding:"80px 5%" }}>
      <div className="grid-2" style={{ maxWidth:1100, margin:"0 auto", alignItems:"center" }}>
        <div>
          <Tag>Bridge Your Crypto & Cash</Tag>
          <SectionTitle style={{ marginBottom:20 }}>
            A Better Financial Experience for{" "}
            <span style={{ color:t.cyan }}>Everyone</span>
          </SectionTitle>
          <p style={{ color:t.muted, fontSize:"clamp(14px,1.6vw,17px)", lineHeight:1.78, marginBottom:32 }}>
            With our combined tools, skills, resources, expertise, collective passion, and commitment to innovation,
            we're creating a better financial experience to help individuals and businesses achieve more.
          </p>
          <BtnPrimary onClick={onLogin}>Login to Your Account →</BtnPrimary>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {SERVICES.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:t.navyCard,
              border:`1px solid ${t.navyBorder}`, borderRadius:10, padding:"13px 18px",
              transition:"all .22s", cursor:"default" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=t.cyan;e.currentTarget.style.paddingLeft="22px";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=t.navyBorder;e.currentTarget.style.paddingLeft="18px";}}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:t.cyan,
                boxShadow:`0 0 8px ${t.cyan}`, flexShrink:0 }} />
              <span style={{ fontSize:14, fontWeight:500 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding:"100px 5%" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <Tag>Process</Tag>
        <SectionTitle style={{ marginBottom:14 }}>How CrestCapital Works</SectionTitle>
        <p style={{ color:t.muted, fontSize:17, lineHeight:1.75, maxWidth:560, marginBottom:52 }}>
          A guide on how to get started and get your account operational — six simple steps.
        </p>
        <div className="grid-auto-280">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={i} className="lift" style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
              borderRadius:16, padding:"32px 24px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:12, right:18, fontFamily:"'Syne',sans-serif",
                fontSize:64, fontWeight:800, color:"rgba(0,212,255,0.05)", lineHeight:1, userSelect:"none" }}>{s.n}</div>
              <div style={{ width:44, height:44, borderRadius:12, background:t.cyanGlow2,
                border:`1px solid rgba(0,212,255,0.2)`, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:20, marginBottom:18 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, marginBottom:10 }}>{s.title}</div>
              <div style={{ color:t.muted, fontSize:14, lineHeight:1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRESS COVERAGE ───────────────────────────────────────────────────────────
function PressCoverage() {
  const repeated = [...PRESS, ...PRESS];
  return (
    <div style={{ background:t.navyMid, borderTop:`1px solid ${t.navyBorder}`,
      borderBottom:`1px solid ${t.navyBorder}`, padding:"24px 0", overflow:"hidden" }}>
      <div style={{ textAlign:"center", fontSize:11, fontWeight:700, letterSpacing:"3px",
        color:t.muted, textTransform:"uppercase", marginBottom:18 }}>Our Press Coverage</div>
      <div style={{ overflow:"hidden" }}>
        <div style={{ display:"flex", gap:0, animation:"ticker 35s linear infinite", width:"max-content" }}>
          {repeated.map((name, i) => (
            <div key={i} style={{ padding:"10px 30px", fontSize:12, fontWeight:700,
              color:t.muted, letterSpacing:"1.5px", textTransform:"uppercase", whiteSpace:"nowrap",
              borderRight:`1px solid ${t.navyBorder}`, cursor:"pointer", transition:"color .2s" }}
              onMouseEnter={e=>e.target.style.color=t.cyan}
              onMouseLeave={e=>e.target.style.color=t.muted}>{name}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PLANS ────────────────────────────────────────────────────────────────────
function Plans({ onSignup }) {
  const [livePlans, setLivePlans] = useState([]);
  useEffect(() => {
    fetch("/api/plans").then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length) setLivePlans(d); }).catch(()=>{});
  }, []);

  const displayPlans = livePlans.length ? livePlans.map((p,i)=>({
    name: p.name, rate: String(p.rate),
    dur:  `${p.duration} Days`,
    min:  `$${p.min.toLocaleString()}`,
    max:  p.max>=999999 ? "Unlimited" : `$${p.max.toLocaleString()}`,
    ref:  "8%",
    featured: i === 1,
    color: p.color,
  })) : PLANS;

  return (
    <section id="plans" style={{ background:t.navyMid, padding:"100px 5%" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <Tag>Investment Plans</Tag>
          <SectionTitle style={{ marginBottom:14 }}>Simply Earn More</SectionTitle>
          <p style={{ color:t.muted, fontSize:17, lineHeight:1.75, maxWidth:560, margin:"0 auto" }}>
            Get started — we offer the best services to simplify your digital financial life and grow your wealth consistently.
          </p>
        </div>

        <div className="plans-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20 }}>
          {displayPlans.map((plan, i) => (
            <div key={i} className={plan.featured ? "" : "lift"} style={{
              background: plan.featured ? `linear-gradient(160deg,${t.navyLight},#0b2048)` : t.navyCard,
              border:`1px solid ${plan.featured ? t.cyan : t.navyBorder}`,
              borderRadius:20, padding:"36px 26px", display:"flex", flexDirection:"column",
              gap:20, position:"relative", overflow:"hidden",
              boxShadow: plan.featured ? `0 0 48px ${t.cyanGlow}` : "none",
              transition:"all .25s" }}>

              {plan.featured && (
                <div style={{ position:"absolute", top:16, right:16, background:t.cyan, color:t.navy,
                  fontSize:10, fontWeight:800, padding:"3px 10px", borderRadius:100,
                  letterSpacing:"1.5px", textTransform:"uppercase" }}>Most Popular</div>
              )}

              <div>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:"2.5px",
                  color:t.muted, textTransform:"uppercase", marginBottom:10 }}>{plan.name} Plan</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(40px,5vw,54px)", fontWeight:800,
                  color: plan.featured ? t.cyan : t.cyanDim, letterSpacing:"-2px", lineHeight:1 }}>
                  {plan.rate}%
                </div>
                <div style={{ fontSize:13, color:t.muted, marginTop:4 }}>Daily Returns</div>
              </div>

              <Divider />

              <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                {[["DURATION",plan.dur],["MIN-DEPOSIT",plan.min],["MAX-DEPOSIT",plan.max],["REFERRAL",plan.ref],["WITHDRAWAL","INSTANT"]].map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:14 }}>
                    <span style={{ color:t.muted }}>{k}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>

              <button onClick={onSignup} style={{ ...btnBase, marginTop:"auto", padding:14, borderRadius:10, fontSize:14,
                background: plan.featured ? `linear-gradient(135deg,${t.cyan},${t.cyanDim})` : "transparent",
                border: plan.featured ? "none" : `1px solid ${t.navyBorder}`,
                color: plan.featured ? t.navy : t.white, fontWeight: plan.featured ? 700 : 500 }}
                onMouseEnter={e=>{ if(!plan.featured){e.target.style.borderColor=t.cyan;e.target.style.color=t.cyan;} }}
                onMouseLeave={e=>{ if(!plan.featured){e.target.style.borderColor=t.navyBorder;e.target.style.color=t.white;} }}>
                Sign Up
              </button>
            </div>
          ))}
        </div>

        {/* Market links */}
        <div style={{ display:"flex", gap:14, justifyContent:"center", marginTop:32, flexWrap:"wrap" }}>
          {[["Cryptocurrency Markets","https://www.tradingview.com/markets/cryptocurrencies/prices-all/"],
            ["Exchange Rates","https://www.tradingview.com/markets/currencies/forex-cross-rates/"]].map(([label,url])=>(
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:t.cyan,
                background:t.cyanGlow2, border:`1px solid rgba(0,212,255,0.2)`,
                borderRadius:8, padding:"8px 18px", transition:"all .2s", textDecoration:"none" }}
              onMouseEnter={e=>e.currentTarget.style.background=t.cyanGlow}
              onMouseLeave={e=>e.currentTarget.style.background=t.cyanGlow2}>
              📊 {label} ↗
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── LEADERS / PILLARS ────────────────────────────────────────────────────────
function Leaders() {
 const FIXED_GAINS  = ["2.41","1.87","3.12","0.94","2.76","1.53","2.08","3.31","1.65"];
const FIXED_LOSSES = ["0.83","1.24","0.61","1.08","0.47","1.31","0.72","0.95","1.18"];

const [gains]  = useState(FIXED_GAINS);
const [losses] = useState(FIXED_LOSSES);
  return (
    <section style={{ padding:"100px 5%" }}>
      <div className="grid-2" style={{ maxWidth:1280, margin:"0 auto", alignItems:"center" }}>
        <div>
          <Tag>Industry Leaders</Tag>
          <SectionTitle style={{ marginBottom:20 }}>Leaders in the Asset<br />Management Industry</SectionTitle>
          <p style={{ color:t.muted, fontSize:16, lineHeight:1.78, marginBottom:32 }}>
            A place for everyone who wants to simply invest in cryptocurrency. Our AI and blockchain-powered platform
            gives you a competitive edge in digital asset investment.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {PILLARS.map((p, i) => (
              <div key={i} className="lift" style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
                borderRadius:14, padding:"20px 16px" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=t.cyan}
                onMouseLeave={e=>e.currentTarget.style.borderColor=t.navyBorder}>
                <div style={{ fontSize:22, marginBottom:8 }}>{p.icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:6 }}>{p.title}</div>
                <div style={{ color:t.muted, fontSize:13, lineHeight:1.65 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:20, padding:"36px 28px" }}>
          <Tag>Digital Investment Solutions</Tag>
          <SectionTitle style={{ fontSize:24, marginBottom:12 }}>Digital Asset Investments</SectionTitle>
          <p style={{ color:t.muted, fontSize:14, lineHeight:1.75, marginBottom:24 }}>
            Our investment management specializes in digital assets. We enable investors to gain exposure to
            a new asset class through traditional financial products fully embedded in a new digital banking setup.
          </p>
          <div className="asset-table" style={{ border:`1px solid ${t.navyBorder}`, borderRadius:12, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
              background:t.navyLight, padding:"12px 16px", fontSize:11, fontWeight:700,
              letterSpacing:"1.5px", color:t.muted, textTransform:"uppercase" }}>
              <span>Asset</span>
              <span style={{ textAlign:"center" }}>Status</span>
              <span style={{ textAlign:"center", color:"#22cc88" }}>Gain</span>
              <span style={{ textAlign:"center", color:"#ff5566" }}>Loss</span>
            </div>
            {TRADE_ASSETS.map((asset, i) => (
              <div key={asset} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
                padding:"11px 16px", borderTop:`1px solid ${t.navyBorder}`, fontSize:13,
                background: i%2===0 ? "transparent" : "rgba(255,255,255,0.01)", transition:"background .2s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(0,212,255,0.04)"}
                onMouseLeave={e=>e.currentTarget.style.background= i%2===0 ? "transparent" : "rgba(255,255,255,0.01)"}>
                <span style={{ fontWeight:500 }}>{asset}</span>
                <span style={{ textAlign:"center" }}>
                  <span style={{ background:"rgba(34,204,136,0.15)", color:"#22cc88",
                    fontSize:10, padding:"2px 8px", borderRadius:100, fontWeight:700 }}>Active</span>
                </span>
                <span style={{ textAlign:"center", color:"#22cc88", fontWeight:600 }}>+{gains[i]}%</span>
                <span style={{ textAlign:"center", color:"#ff5566", fontWeight:600 }}>-{losses[i]}%</span>
              </div>
            ))}
          </div>
          {/* Mobile fallback for asset table */}
          <div style={{ display:"none" }} className="asset-mobile">
            {TRADE_ASSETS.map((asset,i)=>(
              <div key={asset} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0",
                borderBottom:`1px solid ${t.navyBorder}`, fontSize:13 }}>
                <span style={{ fontWeight:500 }}>{asset}</span>
                <span style={{ color:"#22cc88" }}>+{gains[i]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ARBITRAGE ────────────────────────────────────────────────────────────────
function Arbitrage() {
  return (
    <section style={{ background:t.navyMid, padding:"100px 5%" }}>
      <div className="arbitrage-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, maxWidth:1100, margin:"0 auto", alignItems:"center" }}>
        {/* Visual */}
        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:20,
          padding:"48px 32px", position:"relative", overflow:"hidden" }}>
          <GlowOrb style={{ width:240, height:240, background:t.cyanGlow2, top:"50%", left:"50%", transform:"translate(-50%,-50%)" }} />
          <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:18 }}>
            {[["Market A","$42,800",""],["⚙️ Arbitrage Engine","→ Profit","featured"],["Market B","$43,150",""]].map(([label,val,type],i)=>(
              <div key={i} style={{ background: type==="featured" ? `linear-gradient(135deg,${t.cyan},${t.cyanDim})` : t.navyLight,
                borderRadius:12, padding:"18px 22px", textAlign:"center",
                border: type!=="featured" ? `1px solid ${t.navyBorder}` : "none" }}>
                <div style={{ fontSize:12, color: type==="featured" ? t.navy : t.muted, fontWeight:600, marginBottom:4 }}>{label}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(18px,3vw,22px)", fontWeight:800,
                  color: type==="featured" ? t.navy : t.cyan }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Tag>Strategy</Tag>
          <SectionTitle style={{ marginBottom:18 }}>Arbitrage Strategy</SectionTitle>
          <p style={{ color:t.muted, fontSize:15, lineHeight:1.8, marginBottom:20 }}>
            Arbitrage is trading that exploits tiny differences in price between identical assets in two or more markets.
            The arbitrage trader buys the asset in one market and sells it in another simultaneously to pocket the price difference.
            Arbitrage trades are made in stocks, commodities, and currencies.
          </p>
          <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
            borderRadius:14, padding:"22px", marginBottom:28 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:10, color:t.cyan }}>
              Understanding Arbitrage
            </div>
            <p style={{ color:t.muted, fontSize:14, lineHeight:1.8 }}>
              Arbitrage can be used whenever any stock, commodity, or currency may be purchased in one market at a given price
              and simultaneously sold in another at a higher price — creating an opportunity for a risk-free profit for the trader.
            </p>
          </div>
          <BtnPrimary>Learn More →</BtnPrimary>
        </div>
      </div>
    </section>
  );
}

// ─── LOANS ────────────────────────────────────────────────────────────────────
function Loans({ onSignup }) {
  return (
    <section style={{ padding:"80px 5%" }}>
      <div style={{ maxWidth:960, margin:"0 auto", background:`linear-gradient(135deg,${t.navyLight},#0b2048)`,
        border:`1px solid ${t.navyBorder}`, borderRadius:24, padding:"clamp(36px,5vw,56px) clamp(24px,4vw,48px)",
        position:"relative", overflow:"hidden" }}>
        <GlowOrb style={{ width:300, height:300, background:t.cyanGlow2, bottom:"-50%", right:"-10%" }} />
        <div className="loan-inner" style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:40, alignItems:"center", position:"relative", zIndex:1 }}>
          <div>
            <Tag>Crypto Loans</Tag>
            <SectionTitle style={{ marginBottom:14 }}>Don't Sell Your Crypto.</SectionTitle>
            <p style={{ color:t.muted, fontSize:"clamp(14px,1.6vw,16px)", lineHeight:1.78, maxWidth:480 }}>
              Use your digital assets as collateral towards a cryptocurrency-backed loan to pay for daily expenses
              or finance more ambitious plans — without losing your position in the market.
            </p>
          </div>
          <BtnPrimary onClick={onSignup} style={{ whiteSpace:"nowrap" }} className="mobile-full">Apply for Loan →</BtnPrimary>
        </div>
      </div>
    </section>
  );
}

// ─── REAL ESTATE SECTION ──────────────────────────────────────────────────────
function RealEstateSection({ onSignup }) {
  const properties = [
    { title:"Manhattan Skyline Residences", location:"New York, USA",      type:"Residential", return:18, duration:24, min:5000,  funded:72, img:"🏘️", highlights:["Prime Location","Concierge Service","24/7 Security"] },
    { title:"Dubai Marina Commercial Hub",  location:"Dubai, UAE",         type:"Commercial",  return:22, duration:36, min:10000, funded:45, img:"🏢", highlights:["CBD Location","High Foot Traffic","Smart Building"] },
    { title:"Monaco Waterfront Luxury",     location:"Monte Carlo, Monaco",type:"Mixed Use",   return:25, duration:30, min:20000, funded:89, img:"🏙️", highlights:["Seafront View","Luxury Finishes","Smart Home"] },
  ];

  return (
    <section id="realestate" style={{ background:t.navy, padding:"100px 5%" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:60 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`rgba(0,212,255,0.08)`,
            border:`1px solid rgba(0,212,255,0.2)`, borderRadius:100, padding:"8px 20px",
            fontSize:13, color:t.cyan, fontWeight:600, marginBottom:20, letterSpacing:"0.5px" }}>
            🏠 REAL ESTATE INVESTMENTS
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:800,
            letterSpacing:"-1px", marginBottom:16, lineHeight:1.15 }}>
            Invest in the World's Most<br/>
            <span style={{ color:t.cyan }}>Lucrative Properties</span>
          </h2>
          <p style={{ color:t.muted, fontSize:"clamp(15px,2vw,17px)", maxWidth:600, margin:"0 auto", lineHeight:1.75 }}>
            Invest in carefully vetted global real estate projects with guaranteed annual returns.
            Start with as little as $5,000 and earn monthly income from premium properties worldwide.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:60 }}>
          {[["$50M+","Properties Managed"],["18–25%","Annual Returns"],["500+","Active Investors"],["100%","Capital Protected"]].map(([val,label])=>(
            <div key={label} style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
              borderRadius:16, padding:"24px 20px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:t.cyan, marginBottom:6 }}>{val}</div>
              <div style={{ fontSize:13, color:t.muted }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Property cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:24, marginBottom:60 }}>
          {properties.map((p,i) => (
            <div key={i} style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
              borderRadius:20, overflow:"hidden", transition:"transform .22s, border-color .22s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor=t.cyan;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=t.navyBorder;}}>
              {/* Image placeholder */}
              <div style={{ height:200, background:`linear-gradient(135deg,${t.navyLight},#0c2050)`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:64, position:"relative" }}>
                {p.img}
                <div style={{ position:"absolute", top:16, left:16, background:`rgba(0,212,255,0.15)`,
                  backdropFilter:"blur(8px)", border:`1px solid rgba(0,212,255,0.3)`,
                  color:t.cyan, fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>
                  {p.type}
                </div>
                <div style={{ position:"absolute", top:16, right:16, background:`rgba(0,224,150,0.15)`,
                  backdropFilter:"blur(8px)", border:`1px solid rgba(0,224,150,0.3)`,
                  color:t.green, fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>
                  {p.funded}% Funded
                </div>
              </div>
              <div style={{ padding:24 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginBottom:6 }}>{p.title}</div>
                <div style={{ fontSize:13, color:t.muted, marginBottom:18 }}>📍 {p.location}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18 }}>
                  {[["Annual", `${p.return}%`, t.green],["Duration", `${p.duration}mo`, t.cyan],["Min", `$${(p.min/1000).toFixed(0)}K`, t.gold]].map(([k,v,c])=>(
                    <div key={k} style={{ background:t.navyLight, borderRadius:10, padding:"10px", textAlign:"center" }}>
                      <div style={{ fontSize:10, color:t.muted }}>{k}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:c, marginTop:3 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Funding bar */}
                <div style={{ marginBottom:18 }}>
                  <div style={{ height:5, background:t.navyBorder, borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${p.funded}%`,
                      background:`linear-gradient(90deg,${t.cyan},${t.green})`, borderRadius:3 }} />
                  </div>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
                  {p.highlights.map((h,j) => (
                    <span key={j} style={{ fontSize:11, background:`rgba(0,212,255,0.07)`,
                      color:t.cyan, padding:"3px 10px", borderRadius:20, border:`1px solid rgba(0,212,255,0.15)` }}>
                      ✓ {h}
                    </span>
                  ))}
                </div>
                <button onClick={onSignup}
                  style={{ width:"100%", padding:"13px", background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
                    border:"none", borderRadius:12, color:t.navy, fontWeight:700, fontSize:14,
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.opacity=".88"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  Invest Now →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ background:`linear-gradient(135deg,rgba(0,212,255,0.08),rgba(0,224,150,0.06))`,
          border:`1px solid rgba(0,212,255,0.2)`, borderRadius:24, padding:"48px 40px",
          display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24 }}>
          <div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(20px,3vw,28px)", fontWeight:800, marginBottom:10 }}>
              Ready to invest in real estate?
            </h3>
            <p style={{ color:t.muted, fontSize:15, maxWidth:520, lineHeight:1.7 }}>
              Create your account today and get access to exclusive property deals with returns
              of up to <span style={{ color:t.green, fontWeight:700 }}>25% annually</span>.
              Your capital is secured and returns are guaranteed.
            </p>
          </div>
          <button onClick={onSignup}
            style={{ padding:"16px 36px", background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
              border:"none", borderRadius:14, color:t.navy, fontWeight:800, fontSize:16,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap",
              boxShadow:`0 8px 32px rgba(0,212,255,0.3)` }}>
            Start Investing 🏠
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── WHY US ───────────────────────────────────────────────────────────────────
function WhyUs({ onSignup }) {
  return (
    <section id="about" style={{ background:t.navyMid, padding:"100px 5%" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <Tag>Why Choose Us</Tag>
          <SectionTitle style={{ marginBottom:14 }}>Built on Trust, Backed by Technology</SectionTitle>
          <p style={{ color:t.muted, fontSize:17, lineHeight:1.75, maxWidth:560, margin:"0 auto" }}>
            Eight pillars that make CrestCapital the platform serious investors choose.
          </p>
        </div>
        <div className="grid-auto-240">
          {WHY_US.map((item, i) => (
            <div key={i} className="lift" style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
              borderRadius:14, padding:"28px 22px", display:"flex", flexDirection:"column", gap:10 }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=t.cyan;e.currentTarget.style.background=t.navyLight;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=t.navyBorder;e.currentTarget.style.background=t.navyCard;}}>
              <div style={{ fontSize:26 }}>{item.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16 }}>{item.title}</div>
              <div style={{ color:t.muted, fontSize:13.5, lineHeight:1.65, flex:1 }}>{item.desc}</div>
              <button onClick={onSignup} style={{ ...btnBase, background:"transparent",
                border:`1px solid ${t.navyBorder}`, color:t.cyan, padding:"8px 0",
                fontSize:13, borderRadius:8, marginTop:6 }}
                onMouseEnter={e=>e.target.style.borderColor=t.cyan}
                onMouseLeave={e=>e.target.style.borderColor=t.navyBorder}>
                Get Started →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHAT ELSE ────────────────────────────────────────────────────────────────
function WhatElse({ onSignup }) {
  return (
    <section style={{ padding:"80px 5%" }}>
      <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
        <Tag>What Else?</Tag>
        <SectionTitle style={{ marginBottom:14 }}>
          Our Goal is to Simplify Your Finances<br />and Upgrade Your Lifestyle
        </SectionTitle>
        <p style={{ color:t.muted, fontSize:16, lineHeight:1.78, maxWidth:600, margin:"0 auto 40px" }}>
          CrestCapital! A platform designed with one mission — make your financial life effortless and your future brighter.
        </p>
        <div className="grid-2" style={{ marginBottom:40, textAlign:"left", gap:20 }}>
          {[
            { icon:"🤝", title:"Affiliate Partnership", desc:"Introduce colleagues by sharing the amazing opportunity of CrestCapital and get rewarded as soon as they sign up and start investing." },
            { icon:"💬", title:"Help Us Serve You Better", desc:"Our 24/7 customer support is open to suggestions on how to make your investment experience easier and more rewarding." },
          ].map((item, i) => (
            <div key={i} className="lift" style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
              borderRadius:16, padding:"28px 22px", display:"flex", gap:16 }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=t.cyan}
              onMouseLeave={e=>e.currentTarget.style.borderColor=t.navyBorder}>
              <div style={{ fontSize:28, flexShrink:0 }}>{item.icon}</div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:8 }}>{item.title}</div>
                <div style={{ color:t.muted, fontSize:14, lineHeight:1.72 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <BtnPrimary onClick={onSignup} style={{ fontSize:15, padding:"14px 36px" }} className="mobile-full">
          Join CrestCapital Today →
        </BtnPrimary>
      </div>
    </section>
  );
}

// ─── COUNTERS ─────────────────────────────────────────────────────────────────
function Counters() {
  const [counts, setCounts] = useState({ investors:0, feedback:0, workers:0, contributors:0 });
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if(entry.isIntersecting && !done.current) {
        done.current = true;
        const targets = { investors:15, feedback:12, workers:85, contributors:200 };
        let f=0;
        const id = setInterval(() => {
          f++; const p = 1 - Math.pow(1-f/60, 3);
          setCounts({ investors:Math.floor(p*targets.investors), feedback:Math.floor(p*targets.feedback),
            workers:Math.floor(p*targets.workers), contributors:Math.floor(p*targets.contributors) });
          if(f>=60) clearInterval(id);
        }, 30);
      }
    }, { threshold:0.3 });
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ background:t.navyMid, padding:"80px 5%", textAlign:"center" }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>
        <p style={{ color:t.muted, fontSize:15, marginBottom:6 }}>We always try to understand customer expectations</p>
        <SectionTitle style={{ marginBottom:44, fontSize:"clamp(22px,3vw,32px)" }}>
          Our Customer's Peace of Mind is Our Pride
        </SectionTitle>

        <div className="counter-grid" style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
          borderRadius:16, overflow:"hidden", marginBottom:18 }}>
          {[
            [`${counts.investors}K+`, "Happy Investors"],
            [`${counts.feedback}K+`,  "Positive Feedback"],
            [`${counts.workers}+`,    "Team Members"],
            [`${counts.contributors}+`,"Contributors"],
          ].map(([num, label], i) => (
            <div key={i} style={{ padding:"clamp(24px,4vw,36px) 14px",
              borderRight:`1px solid ${t.navyBorder}`, borderBottom:"none" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(28px,4vw,40px)", fontWeight:800,
                color:t.cyan, letterSpacing:"-1.5px" }}>{num}</div>
              <div style={{ fontSize:13, color:t.muted, marginTop:6 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div className="grid-3" style={{ gap:14, marginBottom:28 }}>
          {[["⏱️","2 Minutes","Signup Process"],["🔒","Secured Funds","Encrypted Accounts"],["✅","$0 Loss","Safe Investment"]].map(([icon,val,label],i)=>(
            <div key={i} style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:12, padding:"22px 14px" }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(18px,3vw,22px)", color:t.cyan }}>{val}</div>
              <div style={{ fontSize:12, color:t.muted, marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{ color:t.muted, marginBottom:14, fontSize:15 }}>Have any question about us?</p>
        <BtnOutline onClick={()=>document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}>
          Contact Us
        </BtnOutline>
      </div>
    </section>
  );
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
function Reviews() {
  return (
    <section style={{ padding:"100px 5%" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <Tag>Reviews</Tag>
        <SectionTitle style={{ marginBottom:14 }}>What Our Investors Say</SectionTitle>
        <p style={{ color:t.muted, fontSize:17, lineHeight:1.75, maxWidth:560, marginBottom:48 }}>
          Real experiences from investors across the globe.
        </p>
        <div className="grid-auto-280">
          {REVIEWS.map((r, i) => (
            <div key={i} className="lift" style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
              borderRadius:16, padding:"28px 22px" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=t.cyanDim}
              onMouseLeave={e=>e.currentTarget.style.borderColor=t.navyBorder}>
              <div style={{ color:t.gold, fontSize:14, letterSpacing:3, marginBottom:14 }}>★★★★★</div>
              <p style={{ color:t.muted, fontSize:14, lineHeight:1.78, marginBottom:20, fontStyle:"italic" }}>"{r.text}"</p>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:"50%",
                  background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:t.navy, flexShrink:0 }}>
                  {r.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{r.name}</div>
                  <div style={{ color:t.muted, fontSize:12, marginTop:2 }}>{r.loc} · Joined {r.year}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" style={{ background:t.navyMid, padding:"100px 5%" }}>
      <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
        <Tag>FAQ</Tag>
        <SectionTitle style={{ marginBottom:14 }}>Frequently Asked Questions</SectionTitle>
        <p style={{ color:t.muted, fontSize:17, lineHeight:1.75, maxWidth:560, margin:"0 auto 48px" }}>
          Everything you need to know before investing with CrestCapital.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"left" }}>
          {FAQS.map((item, i) => (
            <div key={i} style={{ background:t.navyCard,
              border:`1px solid ${open===i ? t.cyan : t.navyBorder}`,
              borderRadius:12, overflow:"hidden", transition:"border-color .2s" }}>
              <div style={{ padding:"clamp(16px,2.5vw,20px) clamp(16px,3vw,24px)", display:"flex",
                justifyContent:"space-between", alignItems:"center", cursor:"pointer",
                fontWeight:600, fontSize:"clamp(14px,1.6vw,15px)", color: open===i ? t.cyan : t.white }}
                onClick={()=>setOpen(open===i ? null : i)}>
                <span style={{ paddingRight:12 }}>{item.q}</span>
                <span style={{ fontSize:22, color:t.muted, flexShrink:0,
                  transform: open===i ? "rotate(45deg)" : "none", transition:"transform .25s" }}>+</span>
              </div>
              {open===i && (
                <div style={{ padding:"0 clamp(16px,3vw,24px) 20px", color:t.muted,
                  fontSize:"clamp(13px,1.5vw,14px)", lineHeight:1.8 }}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA BANNER ───────────────────────────────────────────────────────────────
function CTABanner({ onSignup }) {
  return (
    <section style={{ padding:"80px 5% 100px" }}>
      <div style={{ maxWidth:960, margin:"0 auto", background:`linear-gradient(135deg,${t.navyLight},#0c2050)`,
        border:`1px solid ${t.navyBorder}`, borderRadius:24,
        padding:"clamp(40px,6vw,72px) clamp(24px,5vw,48px)",
        textAlign:"center", position:"relative", overflow:"hidden" }}>
        <GlowOrb style={{ width:500, height:500, background:"rgba(0,212,255,0.07)", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <Tag>Ready to Get Started?</Tag>
          <SectionTitle style={{ marginBottom:16 }}>Get Your CrestCapital Account</SectionTitle>
          <p style={{ color:t.muted, fontSize:16, lineHeight:1.78, maxWidth:520, margin:"0 auto 36px" }}>
            It's time to live the life of convenience, freedom, and control you have always wanted.
            Open an account and sign up in minutes to join the CrestCapital community now.
          </p>
          <BtnPrimary onClick={onSignup} style={{ fontSize:16, padding:"16px 44px" }} className="mobile-full">
            Create Free Account →
          </BtnPrimary>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const FOOTER_LINKS = {
  Company:   [["About Us","/about"],["Investment Plans","/#plans"],["Real Estate","/#real-estate"],["Security","/security"],["Contact Us","/contact"],["FAQ","/#faq"]],
  Accounts:  [["Register","/auth/signup"],["Login","/auth/login"],["Dashboard","/dashboard"],["Affiliate Programme","/affiliate"]],
  Legal:     [["Privacy Policy","/privacy"],["Terms & Conditions","/terms"],["Fraud Prevention","/fraud-prevention"],["Legal Notice","/legal"],["Security Policy","/security"]],
  Investors: [["Whitepaper","/whitepaper"],["Company Certificate","/company-certificate"],["Investment Plans","/#plans"],["Referral Programme","/affiliate"]],
};

function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:"2px", color:t.muted,
        textTransform:"uppercase", marginBottom:18 }}>{title}</div>
      <ul style={{ listStyle:"none", padding:0, display:"flex", flexDirection:"column", gap:10 }}>
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} style={{ color:t.muted, fontSize:13, textDecoration:"none", transition:"color .2s" }}
              onMouseEnter={e=>e.target.style.color=t.cyan}
              onMouseLeave={e=>e.target.style.color=t.muted}>{label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  return (
    <footer id="contact" style={{ borderTop:`1px solid ${t.navyBorder}`, padding:"64px 5% 32px" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div className="footer-grid" style={{ marginBottom:48 }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"-0.5px",
              display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:t.cyan,
                boxShadow:`0 0 14px ${t.cyan}`, display:"inline-block" }} />
              CrestCapital
            </div>
            <p style={{ color:t.muted, fontSize:14, lineHeight:1.78, maxWidth:260, marginBottom:18 }}>
              Next-generation digital investment platform. Secure, transparent, and AI-powered returns for investors worldwide.
            </p>
            <div style={{ color:t.muted, fontSize:13, lineHeight:1.9 }}>
              <div>📍 Stortingsgata 6, 0161 Oslo, Norway</div>
              <div style={{ marginTop:4 }}>
                ✉️{" "}
                <a href="mailto:crestcapitalsuport@outlook.com" style={{ color:t.cyan, textDecoration:"none", transition:"opacity .2s" }}
                  onMouseEnter={e=>e.target.style.opacity="0.7"}
                  onMouseLeave={e=>e.target.style.opacity="1"}>
                  crestcapitalsuport@outlook.com
                </a>
              </div>
            </div>
            <div style={{ display:"flex", gap:12, marginTop:18 }}>
              {[["𝕏","https://x.com"],["in","https://linkedin.com"],["f","https://facebook.com"],["▶","https://youtube.com"]].map(([icon,href])=>(
                <a key={icon} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ width:34, height:34, borderRadius:8, background:t.navyLight, border:`1px solid ${t.navyBorder}`,
                    display:"flex", alignItems:"center", justifyContent:"center", color:t.muted,
                    fontSize:13, fontWeight:700, textDecoration:"none", transition:"all .2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=t.cyan;e.currentTarget.style.color=t.cyan;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=t.navyBorder;e.currentTarget.style.color=t.muted;}}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Company"          links={FOOTER_LINKS.Company}   />
          <FooterCol title="Accounts"         links={FOOTER_LINKS.Accounts}  />
          <FooterCol title="Investor Relations" links={FOOTER_LINKS.Investors} />
          <FooterCol title="Legal"            links={FOOTER_LINKS.Legal}     />
        </div>

        <Divider />
        <div style={{ paddingTop:24, display:"flex", justifyContent:"space-between",
          flexWrap:"wrap", gap:12, alignItems:"center" }}>
          <div style={{ color:t.muted, fontSize:13 }}>
            © {new Date().getFullYear()} CrestCapital Ltd. All rights reserved. Registered in Luxembourg.
          </div>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {[["Legal Notice","/legal"],["Privacy Policy","/privacy"],["Terms","/terms"]].map(([l,href])=>(
              <a key={l} href={href} style={{ color:t.muted, fontSize:13, textDecoration:"none", transition:"color .2s" }}
                onMouseEnter={e=>e.target.style.color=t.cyan}
                onMouseLeave={e=>e.target.style.color=t.muted}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

// ─── NEXT.JS LAYOUT NOTE ──────────────────────────────────────────────────────
// In src/app/layout.jsx add these font imports to <head>:
//
// import { Syne, DM_Sans } from 'next/font/google'
//
// OR just leave the @import in GLOBAL_CSS above — it works fine for development.
// For production, use next/font for best performance.