// ============================================================
//  CrestCapital — User Dashboard  (Step 3 / Phase 3)
//
//  FILE LOCATION:  src/app/dashboard/page.jsx
//
//  TABS INCLUDED:
//    1. Overview       — portfolio stats, active investments, live chart
//    2. Deposit        — plan selector, coin selector, QR + wallet address
//    3. Withdraw       — balance, wallet input, amount, confirmation
//    4. Transactions   — filterable history, export CSV/PDF
//    5. Referrals      — affiliate link, commission stats, referral list
//    6. Profile        — account info, security settings, 2FA toggle
//    7. Notifications  — bell icon with unread count, notification list
//
//  All data is mock/simulated — replaced with Supabase in Step 5
// ============================================================

"use client";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// ─── DASHBOARD CONTEXT (provides live data to every tab) ─────────────────────
const DashCtx = createContext(null);
const useDB   = () => useContext(DashCtx);

// ─── THEME ────────────────────────────────────────────────────────────────────
const t = {
  navy:        "#050d1a",
  navyMid:     "#08142a",
  navyLight:   "#0f2040",
  navyCard:    "rgba(10,22,40,0.95)",
  navyBorder:  "#1a3a6b",
  cyan:        "#00d4ff",
  cyanDim:     "#00a8cc",
  cyanGlow:    "rgba(0,212,255,0.16)",
  cyanGlow2:   "rgba(0,212,255,0.07)",
  green:       "#00e096",
  greenDim:    "rgba(0,224,150,0.12)",
  red:         "#ff4d6d",
  redDim:      "rgba(255,77,109,0.12)",
  gold:        "#f0c040",
  goldDim:     "rgba(240,192,64,0.12)",
  white:       "#eef5ff",
  muted:       "#6a8fb0",
  mutedLight:  "#8eaece",
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { background:${t.navy}; color:${t.white}; font-family:'DM Sans',sans-serif; overflow-x:hidden; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:${t.navy}; }
  ::-webkit-scrollbar-thumb { background:${t.navyBorder}; border-radius:3px; }
  ::-webkit-scrollbar-thumb:hover { background:${t.cyan}; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes glow      { 0%,100%{box-shadow:0 0 8px ${t.cyan}} 50%{box-shadow:0 0 24px ${t.cyan}} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

  /* Base */
  .tab-content  { animation: fadeUp .35s ease both; }
  .cc-input     { -webkit-appearance:none; appearance:none; }
  .cc-input:focus { outline:none; border-color:${t.cyan} !important; box-shadow:0 0 0 3px ${t.cyanGlow2}; }
  .cc-input::placeholder { color:${t.muted}; }
  .card-hover:hover { border-color:${t.cyan} !important; transform:translateY(-2px); transition:all .22s; }
  .row-hover:hover  { background:rgba(0,212,255,0.04) !important; }

  /* Prevent overflow everywhere */
  img   { max-width:100%; }
  table { width:100%; border-collapse:collapse; }
  .overflow-x { overflow-x:auto; -webkit-overflow-scrolling:touch; }

  /* ── Desktop layout (≥900px) ─────────────────────────── */
  .dash-layout  { display:grid; grid-template-columns:240px 1fr; min-height:100vh; }
  .sidebar      { display:flex; }
  .mobile-nav   { display:none; }
  .dash-main    { padding:28px; padding-bottom:32px; }

  .stat-grid    { display:grid; grid-template-columns:repeat(4,1fr);  gap:16px; }
  .invest-grid  { display:grid; grid-template-columns:repeat(3,1fr);  gap:16px; }
  .ref-grid     { display:grid; grid-template-columns:repeat(3,1fr);  gap:16px; }
  .profile-grid { display:grid; grid-template-columns:1fr 1fr;        gap:20px; }
  .chart-row    { display:grid; grid-template-columns:1fr 300px;      gap:20px; }

  /* ── Tablet (900px–1100px) ──────────────────────────── */
  @media (max-width:1100px) {
    .stat-grid   { grid-template-columns:repeat(2,1fr); }
    .invest-grid { grid-template-columns:repeat(2,1fr); }
    .ref-grid    { grid-template-columns:repeat(2,1fr); }
    .chart-row   { grid-template-columns:1fr; }
  }

  /* ── Mobile (≤900px) ────────────────────────────────── */
  @media (max-width:900px) {
    .dash-layout  { grid-template-columns:1fr; }
    .sidebar      { display:none; }
    .mobile-nav   { display:flex; }
    .dash-main    { padding:16px; padding-bottom:80px; }
  }

  /* ── Small mobile (≤640px) ──────────────────────────── */
  @media (max-width:640px) {
    .stat-grid    { grid-template-columns:1fr 1fr; gap:10px; }
    .invest-grid  { grid-template-columns:1fr; }
    .ref-grid     { grid-template-columns:1fr; }
    .profile-grid { grid-template-columns:1fr; }
    .chart-row    { grid-template-columns:1fr; }

    /* Hide less important table columns */
    .tx-cols { display:none; }

    /* Tighter card padding */
    .card-p { padding:16px !important; }

    /* Make inputs full width */
    input, select, textarea { font-size:16px !important; } /* prevent iOS zoom */

    /* Topbar adjustments */
    .topbar-title { font-size:16px !important; }
    .topbar-sub   { display:none; }
  }

  /* ── Very small (≤400px) ────────────────────────────── */
  @media (max-width:400px) {
    .stat-grid { grid-template-columns:1fr; }
    .dash-main { padding:12px; padding-bottom:80px; }
  }

  /* ── Mobile nav ─────────────────────────────────────── */
  .mobile-nav { position:fixed; bottom:0; left:0; right:0; z-index:100;
    background:rgba(8,20,42,0.97); backdrop-filter:blur(20px);
    border-top:1px solid ${t.navyBorder}; padding:8px 0 max(12px,env(safe-area-inset-bottom));
    justify-content:space-around; }
`;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const USER = {
  name: "John Smith",
  email: "john.smith@example.com",
  username: "johnsmith",
  avatar: "JS",
  balance: 12480.50,
  totalEarned: 3241.20,
  totalDeposited: 15000.00,
  totalWithdrawn: 5760.70,
  referralBonus: 480.00,
  activeInvestments: 3,
  referralCode: "JOHN2024",
  referralLink: "https://crestcapital.com/ref/JOHN2024",
  twoFA: false,
  joined: "January 2024",
  country: "United States",
  phone: "+1 234 567 8900",
  kycStatus: "verified",
};

const PLANS_DATA = [
  { id:1, name:"Starter",  rate:0.9,  duration:10, min:100,   max:999,   color:t.cyanDim },
  { id:2, name:"Growth",   rate:1.4,  duration:15, min:1000,  max:4999,  color:t.cyan    },
  { id:3, name:"Advanced", rate:2.0,  duration:21, min:5000,  max:19999, color:t.green   },
  { id:4, name:"Premium",  rate:3.5,  duration:30, min:20000, max:999999,color:t.gold    },
];

const ACTIVE_INVESTMENTS = [
  { id:1, plan:"Growth",   amount:2000, rate:1.4, earned:196.00, duration:15, daysLeft:8,  startDate:"2025-04-20", status:"active" },
  { id:2, plan:"Advanced", amount:5000, rate:2.0, earned:700.00, duration:21, daysLeft:3,  startDate:"2025-04-12", status:"active" },
  { id:3, plan:"Starter",  amount:500,  rate:0.9, earned:45.00,  duration:10, daysLeft:12, startDate:"2025-04-23", status:"active" },
];

const TRANSACTIONS = [
  { id:"TXN001", type:"deposit",    amount:5000,   plan:"Advanced", date:"2025-04-12", status:"completed", coin:"USDT",   hash:"0x4f2a...9b1c" },
  { id:"TXN002", type:"withdrawal", amount:2000,   plan:"-",        date:"2025-04-10", status:"completed", coin:"BTC",    hash:"0x7c3e...2d4f" },
  { id:"TXN003", type:"earning",    amount:700,    plan:"Advanced", date:"2025-04-08", status:"completed", coin:"USDT",   hash:"-" },
  { id:"TXN004", type:"deposit",    amount:2000,   plan:"Growth",   date:"2025-04-20", status:"completed", coin:"ETH",    hash:"0x1a9b...6e2c" },
  { id:"TXN005", type:"earning",    amount:196,    plan:"Growth",   date:"2025-04-21", status:"completed", coin:"USDT",   hash:"-" },
  { id:"TXN006", type:"deposit",    amount:500,    plan:"Starter",  date:"2025-04-23", status:"completed", coin:"BNB",    hash:"0x8d1f...3a7b" },
  { id:"TXN007", type:"referral",   amount:160,    plan:"-",        date:"2025-04-15", status:"completed", coin:"USDT",   hash:"-" },
  { id:"TXN008", type:"withdrawal", amount:1000,   plan:"-",        date:"2025-04-05", status:"pending",   coin:"BTC",    hash:"-" },
  { id:"TXN009", type:"withdrawal", amount:2760.7, plan:"-",        date:"2025-03-28", status:"completed", coin:"ETH",    hash:"0x5c2a...8d3e" },
  { id:"TXN010", type:"referral",   amount:320,    plan:"-",        date:"2025-03-20", status:"completed", coin:"USDT",   hash:"-" },
];

const REFERRALS = [
  { name:"Emily Carter",   email:"e***@gmail.com",  date:"2025-04-18", amount:160, status:"active" },
  { name:"Raj Patel",      email:"r***@outlook.com",date:"2025-03-30", amount:200, status:"active" },
  { name:"Maria G.",       email:"m***@yahoo.com",  date:"2025-03-15", amount:120, status:"inactive" },
];

const NOTIFS = [
  { id:1, type:"earning",    title:"Earnings Credited",          body:"$196.00 earned from your Growth Plan investment.", time:"2 hours ago",   read:false },
  { id:2, type:"deposit",    title:"Deposit Confirmed",          body:"Your deposit of $2,000 (ETH) has been confirmed.", time:"1 day ago",     read:false },
  { id:3, type:"withdrawal", title:"Withdrawal Processed",       body:"$2,000 has been sent to your BTC wallet.",         time:"3 days ago",    read:false },
  { id:4, type:"referral",   title:"Referral Commission",        body:"You earned $160 from Emily Carter's deposit.",      time:"5 days ago",    read:true  },
  { id:5, type:"security",   title:"New Login Detected",         body:"A new login was detected from Lagos, Nigeria.",     time:"1 week ago",    read:true  },
  { id:6, type:"system",     title:"KYC Verification Approved",  body:"Your identity has been successfully verified.",     time:"2 weeks ago",   read:true  },
];

const COINS = [
  { id:"btc",  name:"Bitcoin",  symbol:"BTC",  address:"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", network:"Bitcoin" },
  { id:"eth",  name:"Ethereum", symbol:"ETH",  address:"0x71C7656EC7ab88b098defB751B7401B5f6d8976F", network:"ERC-20"  },
  { id:"usdt", name:"Tether",   symbol:"USDT", address:"TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",         network:"TRC-20"  },
  { id:"bnb",  name:"BNB",      symbol:"BNB",  address:"bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn7klh", network:"BSC"    },
];

const CHART_DATA = [
  { day:"Apr 1",  balance:9200  },
  { day:"Apr 5",  balance:9650  },
  { day:"Apr 10", balance:10800 },
  { day:"Apr 15", balance:11200 },
  { day:"Apr 20", balance:11950 },
  { day:"Apr 25", balance:12480 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-US", { style:"currency", currency:"USD" }).format(n);
const fmtShort = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}K` : fmt(n);

const GlowOrb = ({ style }) => (
  <div style={{ position:"absolute", borderRadius:"50%", filter:"blur(80px)", pointerEvents:"none", zIndex:0, ...style }} />
);

const Badge = ({ children, color, bg }) => (
  <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:100,
    color: color || t.cyan, background: bg || t.cyanGlow2, letterSpacing:"0.5px" }}>
    {children}
  </span>
);

const StatusBadge = ({ status }) => {
  const map = {
    completed: [t.green, t.greenDim, "Completed"],
    pending:   [t.gold,  t.goldDim,  "Pending"  ],
    failed:    [t.red,   t.redDim,   "Failed"   ],
    active:    [t.cyan,  t.cyanGlow2,"Active"   ],
    inactive:  [t.muted, "rgba(106,143,176,0.12)","Inactive"],
  };
  const [c, bg, label] = map[status] || [t.muted, "transparent", status];
  return <Badge color={c} bg={bg}>{label}</Badge>;
};

const TxIcon = ({ type }) => {
  const map = { deposit:"⬇️", withdrawal:"⬆️", earning:"💰", referral:"🔗", system:"⚙️" };
  return <span style={{ fontSize:18 }}>{map[type] || "📋"}</span>;
};

const Input = ({ label, error, icon, suffix, style, inputStyle, ...props }) => (
  <div style={{ marginBottom:18, ...style }}>
    {label && <label style={{ fontSize:12, fontWeight:600, letterSpacing:"0.5px", color:t.mutedLight,
      display:"block", marginBottom:7, textTransform:"uppercase" }}>{label}</label>}
    <div style={{ position:"relative" }}>
      {icon && <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
        fontSize:16, color:t.muted, pointerEvents:"none", zIndex:1 }}>{icon}</span>}
      <input className="cc-input" {...props} style={{ width:"100%",
        background:"rgba(15,32,64,0.6)", border:`1px solid ${error ? t.red : t.navyBorder}`,
        borderRadius:10, padding:`13px ${suffix?"44px":"14px"} 13px ${icon?"42px":"14px"}`,
        color:t.white, fontSize:15, fontFamily:"'DM Sans',sans-serif",
        transition:"border-color .2s,box-shadow .2s", ...inputStyle }} />
      {suffix && <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
        color:t.muted, fontSize:14 }}>{suffix}</span>}
    </div>
    {error && <div style={{ fontSize:12, color:t.red, marginTop:5 }}>⚠ {error}</div>}
  </div>
);

const BtnPrimary = ({ children, onClick, loading, disabled, style }) => (
  <button onClick={onClick} disabled={disabled||loading}
    style={{ fontFamily:"'DM Sans',sans-serif", cursor:disabled||loading?"not-allowed":"pointer",
      border:"none", borderRadius:10, fontWeight:700, transition:"all .22s",
      background:disabled||loading?"rgba(0,212,255,0.3)":`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
      color:t.navy, padding:"13px 24px", fontSize:14,
      boxShadow:disabled||loading?"none":`0 4px 20px ${t.cyanGlow}`,
      display:"flex", alignItems:"center", justifyContent:"center", gap:8, ...style }}
    onMouseEnter={e=>{ if(!disabled&&!loading){e.currentTarget.style.transform="translateY(-1px)";} }}
    onMouseLeave={e=>{ e.currentTarget.style.transform=""; }}>
    {loading && <span style={{ width:14, height:14, border:`2px solid ${t.navy}`, borderTopColor:"transparent",
      borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }} />}
    {children}
  </button>
);

// ─── MINI LINE CHART ──────────────────────────────────────────────────────────
function MiniChart({ data, color = t.cyan }) {
  const w = 100, h = 40;
  const vals = data.map(d => d.balance);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  const fill = `${pts} ${w},${h} 0,${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height:h, display:"block" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#chartGrad)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── FULL AREA CHART ─────────────────────────────────────────────────────────
function AreaChart({ data }) {
  const [hover, setHover] = useState(null);
  const w = 600, h = 180;
  const vals = data.map(d => d.balance);
  const min = Math.min(...vals) * 0.97;
  const max = Math.max(...vals) * 1.01;
  const px = (i) => (i / (vals.length - 1)) * w;
  const py = (v) => h - ((v - min) / (max - min)) * (h - 20) - 10;
  const pts = vals.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  const fill = `${pts} ${w},${h} 0,${h}`;

  return (
    <div style={{ position:"relative", width:"100%" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height:"auto" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.cyan} stopOpacity="0.2" />
            <stop offset="100%" stopColor={t.cyan} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0,1,2,3].map(i => (
          <line key={i} x1={0} y1={py(min + (max-min)*(i/3))} x2={w} y2={py(min + (max-min)*(i/3))}
            stroke={t.navyBorder} strokeWidth="0.5" strokeDasharray="4 4" />
        ))}
        <polygon points={fill} fill="url(#areaGrad)" />
        <polyline points={pts} fill="none" stroke={t.cyan} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Hover dots */}
        {vals.map((v, i) => (
          <circle key={i} cx={px(i)} cy={py(v)} r={hover===i ? 5 : 3}
            fill={hover===i ? t.cyan : t.navyLight}
            stroke={t.cyan} strokeWidth={hover===i ? 2 : 1.5}
            style={{ cursor:"pointer", transition:"r .15s" }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)} />
        ))}
      </svg>
      {/* X labels */}
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize:11, color: hover===i ? t.cyan : t.muted, transition:"color .15s" }}>
            {d.day}
          </span>
        ))}
      </div>
      {/* Tooltip */}
      {hover !== null && (
        <div style={{ position:"absolute", top:0, left:`${(hover/(data.length-1))*100}%`,
          transform:"translateX(-50%)", background:t.navyCard, border:`1px solid ${t.cyan}`,
          borderRadius:8, padding:"6px 12px", pointerEvents:"none", animation:"slideDown .15s ease",
          whiteSpace:"nowrap", zIndex:10 }}>
          <div style={{ fontSize:11, color:t.muted }}>{data[hover].day}</div>
          <div style={{ fontSize:14, fontWeight:700, color:t.cyan }}>{fmt(data[hover].balance)}</div>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"overview",      icon:"📊", label:"Overview"      },
  { id:"deposit",       icon:"⬇️", label:"Deposit"       },
  { id:"invest",        icon:"💹", label:"Invest"        },
  { id:"realestate",    icon:"🏠", label:"Real Estate"   },
  { id:"withdraw",      icon:"⬆️", label:"Withdraw"      },
  { id:"transactions",  icon:"📋", label:"Transactions"  },
  { id:"referrals",     icon:"🔗", label:"Referrals"     },
  { id:"profile",       icon:"👤", label:"Profile"       },
];

function Sidebar({ active, setActive, notifCount }) {
  const _db   = useDB();
  const _user = _db?.user || USER;
  return (
    <aside className="sidebar" style={{ background:t.navyMid, borderRight:`1px solid ${t.navyBorder}`,
      flexDirection:"column", padding:"28px 0", position:"sticky", top:0, height:"100vh", overflow:"auto" }}>

      {/* Logo */}
      <div style={{ padding:"0 24px 32px", fontFamily:"'Syne',sans-serif", fontWeight:800,
        fontSize:20, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:8, height:8, borderRadius:"50%", background:t.cyan,
          boxShadow:`0 0 12px ${t.cyan}`, display:"inline-block", animation:"glow 2s infinite" }} />
        CrestCapital
      </div>

      {/* User pill */}
      <div style={{ margin:"0 12px 24px", background:t.navyCard, border:`1px solid ${t.navyBorder}`,
        borderRadius:12, padding:"14px 14px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:"50%",
          background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:t.navy, flexShrink:0 }}>
          {_user.avatar}
        </div>
        <div style={{ overflow:"hidden" }}>
          <div style={{ fontSize:13, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{_user.name}</div>
          <div style={{ fontSize:11, color:t.muted, display:"flex", alignItems:"center", gap:5 }}>
            <StatusBadge status="active" />
            {_user.kycStatus === "verified"   && <span style={{ color:t.green }}>KYC Verified</span>}
            {_user.kycStatus === "pending"    && <span style={{ color:t.gold  }}>KYC Pending</span>}
            {(!_user.kycStatus || _user.kycStatus === "unverified") && <span style={{ color:t.muted }}>Unverified</span>}
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, padding:"0 12px", display:"flex", flexDirection:"column", gap:4 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                borderRadius:10, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                fontSize:14, fontWeight: isActive ? 600 : 400, transition:"all .2s",
                background: isActive ? t.cyanGlow2 : "transparent",
                color: isActive ? t.cyan : t.muted,
                borderLeft: isActive ? `3px solid ${t.cyan}` : "3px solid transparent" }}>
              <span style={{ fontSize:17 }}>{item.icon}</span>
              {item.label}
              {item.id === "notifications" && notifCount > 0 && (
                <span style={{ marginLeft:"auto", background:t.red, color:"#fff",
                  fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:100 }}>{notifCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding:"16px 12px 0", borderTop:`1px solid ${t.navyBorder}`, marginTop:12 }}>
        <button onClick={() => _db?.signOut ? _db.signOut() : alert("→ Navigate to /auth/login")}
          style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", width:"100%",
            borderRadius:10, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            fontSize:14, color:t.muted, background:"transparent", transition:"all .2s" }}
          onMouseEnter={e=>{e.currentTarget.style.color=t.red;e.currentTarget.style.background=t.redDim;}}
          onMouseLeave={e=>{e.currentTarget.style.color=t.muted;e.currentTarget.style.background="transparent";}}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

// ─── MOBILE NAV ───────────────────────────────────────────────────────────────
function MobileNav({ active, setActive }) {
  return (
    <div className="mobile-nav" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100,
      background:"rgba(8,20,42,0.97)", backdropFilter:"blur(20px)",
      borderTop:`1px solid ${t.navyBorder}`, padding:"10px 0 12px",
      justifyContent:"space-around" }}>
      {NAV_ITEMS.slice(0,6).map(item => {
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => setActive(item.id)}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              background:"transparent", border:"none", cursor:"pointer", padding:"4px 8px" }}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <span style={{ fontSize:10, color: isActive ? t.cyan : t.muted, fontWeight: isActive ? 700 : 400 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
function TopBar({ tab, notifCount, onNotif }) {
  const _db   = useDB();
  const _user = _db?.user || USER;
  const labels = { overview:"Dashboard Overview", deposit:"Make a Deposit", invest:"Invest Funds",
    realestate:"Real Estate Investments", withdraw:"Withdraw Funds", transactions:"Transaction History",
    referrals:"Referral Program", profile:"Account Settings", notifications:"Notifications" };
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"14px 20px", borderBottom:`1px solid ${t.navyBorder}`,
      background:"rgba(5,13,26,0.6)", backdropFilter:"blur(12px)",
      position:"sticky", top:0, zIndex:50, gap:12, minWidth:0 }}>
      <div style={{ minWidth:0, flex:1 }}>
        <h1 className="topbar-title" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:"clamp(15px,2.5vw,22px)", letterSpacing:"-0.5px",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{labels[tab]}</h1>
        <p className="topbar-sub" style={{ color:t.muted, fontSize:13, marginTop:2,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          Welcome back, <span style={{ color:t.cyan }}>{_user.name}</span>
        </p>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        {/* Notif bell */}
        <button onClick={onNotif} style={{ position:"relative", background:t.navyCard,
          border:`1px solid ${t.navyBorder}`, borderRadius:10, padding:"10px 12px",
          cursor:"pointer", fontSize:18, transition:"all .2s" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=t.cyan}
          onMouseLeave={e=>e.currentTarget.style.borderColor=t.navyBorder}>
          🔔
          {notifCount > 0 && (
            <span style={{ position:"absolute", top:-4, right:-4, background:t.red, color:"#fff",
              fontSize:10, fontWeight:700, padding:"2px 5px", borderRadius:100,
              minWidth:16, textAlign:"center" }}>{notifCount}</span>
          )}
        </button>
        {/* Avatar */}
        <div style={{ width:38, height:38, borderRadius:"50%",
          background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:t.navy }}>
          {_user.avatar}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: OVERVIEW ────────────────────────────────────────────────────────────
function Overview({ setTab }) {
  const _db          = useDB();
  const _user        = _db?.user        || USER;
  const _investments = _db?.investments ?? [];
  const _plans       = _db?.plans       ?? [];

  const stats = [
    { label:"Total Balance",     value:fmt(_user.balance        ?? 0), sub:"Available to withdraw",  icon:"💼", color:t.cyan,  trend:"+12.4%" },
    { label:"Total Earned",      value:fmt(_user.totalEarned    ?? 0), sub:"All-time earnings",       icon:"📈", color:t.green, trend:"+8.2%"  },
    { label:"Total Deposited",   value:fmt(_user.totalDeposited ?? 0), sub:"All deposits combined",   icon:"⬇️", color:t.gold,  trend:null     },
    { label:"Total Withdrawn",   value:fmt(_user.totalWithdrawn ?? 0), sub:"All withdrawals made",    icon:"⬆️", color:t.red,   trend:null     },
  ];

  return (
    <div className="tab-content">
      {/* Stat cards */}
      <div className="stat-grid" style={{ marginBottom:24 }}>
        {stats.map((s, i) => (
          <div key={i} className="card-hover" style={{ background:t.navyCard,
            border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"22px",
            position:"relative", overflow:"hidden" }}>
            <GlowOrb style={{ width:120, height:120, background:`${s.color}10`, top:"-20%", right:"-10%", zIndex:0 }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ fontSize:26 }}>{s.icon}</div>
                {s.trend && (
                  <span style={{ fontSize:11, fontWeight:700, color:t.green,
                    background:t.greenDim, padding:"3px 8px", borderRadius:100 }}>{s.trend}</span>
                )}
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(18px,2.5vw,24px)",
                fontWeight:800, color:s.color, letterSpacing:"-0.5px", marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:12, color:t.muted }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + quick actions */}
      <div style={{ gap:20, marginBottom:24 }} className="chart-row">
        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:4 }}>Portfolio Growth</div>
              <div style={{ fontSize:13, color:t.muted }}>Balance over the last 30 days</div>
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:t.cyan }}>
              {fmt(_user.balance ?? 0)}
            </div>
          </div>
          <AreaChart data={CHART_DATA} />
        </div>

        {/* Quick actions */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[
            { label:"Make Deposit",   icon:"⬇️", tab:"deposit",      color:t.cyan  },
            { label:"Withdraw",       icon:"⬆️", tab:"withdraw",     color:t.green },
            { label:"View History",   icon:"📋", tab:"transactions", color:t.gold  },
            { label:"Refer & Earn",   icon:"🔗", tab:"referrals",    color:t.red   },
          ].map((a, i) => (
            <button key={i} onClick={() => setTab(a.tab)}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px",
                background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:12,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:t.white,
                fontSize:14, fontWeight:600, transition:"all .2s", textAlign:"left" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color;e.currentTarget.style.background=`${a.color}10`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=t.navyBorder;e.currentTarget.style.background=t.navyCard;}}>
              <span style={{ fontSize:20, width:32, textAlign:"center" }}>{a.icon}</span>
              {a.label}
              <span style={{ marginLeft:"auto", color:t.muted }}>→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Investments summary */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16 }}>Active Investments</div>
          <button onClick={() => setTab("invest")} style={{ fontSize:13, color:t.cyan, background:"transparent",
            border:`1px solid rgba(0,212,255,0.2)`, borderRadius:8, padding:"6px 14px", cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}
            onMouseEnter={e=>e.currentTarget.style.background=t.cyanGlow2}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            View All →
          </button>
        </div>
        {_investments.filter(i=>i.status==="active").length === 0 ? (
          <div style={{ textAlign:"center", padding:"32px 20px", color:t.muted, fontSize:14 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>📈</div>
            <div style={{ fontWeight:600, color:t.white, marginBottom:6 }}>No active investments yet</div>
            <div style={{ marginBottom:20 }}>Deposit funds and invest in a plan to start earning daily returns.</div>
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={() => setTab("deposit")}
                style={{ padding:"10px 22px", background:"transparent", border:`1px solid ${t.cyan}`,
                  borderRadius:10, color:t.cyan, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Deposit Funds
              </button>
              <button onClick={() => setTab("invest")}
                style={{ padding:"10px 22px", background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
                  border:"none", borderRadius:10, color:t.navy, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Start Investing →
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {_investments.filter(i=>i.status==="active").slice(0,3).map((inv,i) => {
              const planName  = typeof inv.plan === "object" ? inv.plan?.name : inv.plan;
              const planColor = _plans.find(p=>p.name===planName)?.color || t.cyan;
              const prog      = ((inv.duration - inv.daysLeft) / inv.duration) * 100;
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 16px",
                  background:t.navyLight, borderRadius:12, border:`1px solid ${t.navyBorder}` }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:`${planColor}18`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>💹</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{planName} Plan — {fmt(inv.amount)}</div>
                    <div style={{ height:4, background:t.navyBorder, borderRadius:2, marginTop:6, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${prog}%`, background:planColor, borderRadius:2, transition:"width 1s" }} />
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:t.green }}>+{fmt(inv.earned||0)}</div>
                    <div style={{ fontSize:11, color:t.muted }}>{inv.daysLeft}d left</div>
                  </div>
                </div>
              );
            })}
            {_investments.filter(i=>i.status==="active").length > 3 && (
              <button onClick={() => setTab("invest")}
                style={{ fontSize:13, color:t.cyan, background:"transparent", border:"none", cursor:"pointer",
                  padding:"8px", fontFamily:"'DM Sans',sans-serif" }}>
                +{_investments.filter(i=>i.status==="active").length - 3} more — View all →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB: DEPOSIT ─────────────────────────────────────────────────────────────
function Deposit() {
  const _db = useDB();

  const [wallets,    setWallets]    = useState([]);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [coin,       setCoin]       = useState(null);
  const [amount,     setAmount]     = useState("");
  const [copied,     setCopied]     = useState(false);
  const [step,       setStep]       = useState(1); // 1=form, 2=address, 3=submitted
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState("");

  useEffect(() => {
    fetch("/api/user/deposit")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setWallets(d); })
      .catch(() => {})
      .finally(() => setWalletsLoading(false));
  }, []);

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const selectedCoin = wallets.find(c => c.id === coin);

  const submit = async () => {
    if (!coin || !amount) return;
    setSubmitErr(""); setSubmitting(true);
    try {
      const res  = await fetch("/api/user/deposit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), coin }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
        _db?.refreshTransactions?.();
      } else {
        setSubmitErr(data.error || "Could not submit deposit.");
      }
    } catch { setSubmitErr("Something went wrong."); }
    finally   { setSubmitting(false); }
  };

  return (
    <div className="tab-content">

      {/* Info banner */}
      <div style={{ background:t.cyanGlow2, border:`1px solid rgba(0,212,255,0.18)`, borderRadius:12,
        padding:"16px 20px", marginBottom:28, display:"flex", gap:14, alignItems:"flex-start" }}>
        <span style={{ fontSize:22, flexShrink:0 }}>ℹ️</span>
        <div>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>How deposits work</div>
          <div style={{ fontSize:13, color:t.muted, lineHeight:1.7 }}>
            1. Select a coin and enter the amount you'll send.<br/>
            2. Copy the wallet address and send the exact amount from your crypto wallet.<br/>
            3. Click <strong style={{ color:t.cyan }}>"I've Sent the Payment"</strong> — our team will verify and credit your balance within 30 minutes.<br/>
            4. Once your balance is credited, go to <strong style={{ color:t.cyan }}>Invest</strong> to put it to work.
          </div>
        </div>
      </div>

      {step === 1 && (
        <div style={{ maxWidth:560 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, marginBottom:6 }}>Select Coin & Amount</h2>
          <p style={{ color:t.muted, fontSize:14, marginBottom:24 }}>Choose the cryptocurrency you'll be sending.</p>

          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:12, fontWeight:600, letterSpacing:"0.5px", color:t.mutedLight,
              display:"block", marginBottom:10, textTransform:"uppercase" }}>Select Coin</label>

            {walletsLoading ? (
              <div style={{ fontSize:13, color:t.muted, padding:"20px 0" }}>Loading wallet addresses…</div>
            ) : wallets.length === 0 ? (
              <div style={{ background:t.goldDim, border:`1px solid rgba(240,192,64,0.25)`, borderRadius:12,
                padding:"16px 20px", fontSize:13, color:t.gold, lineHeight:1.7 }}>
                ⚠️ No deposit wallets are configured yet. Please contact support or check back soon.
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }}>
                {wallets.map(c => (
                  <div key={c.id} onClick={() => { setCoin(c.id); setSubmitErr(""); }}
                    style={{ background:coin===c.id?t.cyanGlow2:t.navyCard,
                      border:`2px solid ${coin===c.id?t.cyan:t.navyBorder}`,
                      borderRadius:10, padding:"14px", cursor:"pointer", transition:"all .2s", textAlign:"center" }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:coin===c.id?t.cyan:t.white }}>{c.symbol}</div>
                    <div style={{ fontSize:12, color:t.muted, marginTop:3 }}>{c.name}</div>
                    <div style={{ fontSize:10, color:t.muted, marginTop:2 }}>{c.network}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input label="Amount (USD)" type="number" placeholder="Enter deposit amount"
            icon="💵" suffix="USD" value={amount}
            onChange={e => { setAmount(e.target.value); setSubmitErr(""); }} />

          {submitErr && <div style={{ fontSize:13, color:t.red, marginBottom:16 }}>⚠ {submitErr}</div>}

          <BtnPrimary onClick={() => coin && amount ? setStep(2) : setSubmitErr("Select a coin and enter an amount.")}
            style={{ width:"100%" }}>
            View Wallet Address →
          </BtnPrimary>
        </div>
      )}

      {step === 2 && selectedCoin && (
        <div style={{ maxWidth:560 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, marginBottom:6 }}>Send Payment</h2>
          <p style={{ color:t.muted, fontSize:14, marginBottom:24 }}>
            Send exactly <span style={{ color:t.cyan, fontWeight:700 }}>{fmt(Number(amount))}</span> in{" "}
            <span style={{ color:t.cyan, fontWeight:700 }}>{selectedCoin.symbol} ({selectedCoin.network})</span> to the address below.
          </p>

          <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"28px", marginBottom:20 }}>
            <label style={{ fontSize:12, fontWeight:600, letterSpacing:"0.5px", color:t.mutedLight,
              display:"block", marginBottom:10, textTransform:"uppercase" }}>
              {selectedCoin.symbol} Wallet Address ({selectedCoin.network})
            </label>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:20 }}>
              <div style={{ flex:1, background:t.navyLight, border:`1px solid ${t.navyBorder}`,
                borderRadius:10, padding:"12px 14px", fontSize:13, color:t.mutedLight,
                wordBreak:"break-all", fontFamily:"monospace" }}>
                {selectedCoin.address}
              </div>
              <button onClick={() => copy(selectedCoin.address)}
                style={{ background:copied?t.greenDim:t.cyanGlow2, border:`1px solid ${copied?t.green:t.cyan}`,
                  borderRadius:10, padding:"12px 16px", cursor:"pointer", color:copied?t.green:t.cyan,
                  fontSize:13, fontWeight:700, fontFamily:"'DM Sans',sans-serif", transition:"all .2s", whiteSpace:"nowrap" }}>
                {copied?"✓ Copied":"Copy"}
              </button>
            </div>
            <div style={{ padding:"14px", background:t.goldDim, border:`1px solid rgba(240,192,64,0.2)`,
              borderRadius:10, fontSize:13, color:t.gold, lineHeight:1.7 }}>
              ⚠️ Send only <strong>{selectedCoin.symbol}</strong> on the <strong>{selectedCoin.network}</strong> network.
              Wrong network = permanent loss of funds.
            </div>
          </div>

          {submitErr && <div style={{ fontSize:13, color:t.red, marginBottom:16 }}>⚠ {submitErr}</div>}

          <div style={{ display:"flex", gap:12 }}>
            <BtnPrimary onClick={submit} loading={submitting} style={{ flex:1 }}>
              ✅ I've Sent the Payment
            </BtnPrimary>
            <button onClick={() => setStep(1)}
              style={{ padding:"13px 24px", background:"transparent", border:`1px solid ${t.navyBorder}`,
                borderRadius:10, color:t.muted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=t.cyan}
              onMouseLeave={e=>e.currentTarget.style.borderColor=t.navyBorder}>← Back</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ maxWidth:480, textAlign:"center" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 24px" }}>⏳</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, marginBottom:12 }}>Awaiting Confirmation</h2>
          <p style={{ color:t.muted, fontSize:15, lineHeight:1.75, marginBottom:12 }}>
            Your deposit of <span style={{ color:t.cyan, fontWeight:700 }}>{fmt(Number(amount))}</span> has been submitted.
            Our team will verify your payment and credit your balance within <strong style={{ color:t.white }}>30 minutes</strong>.
          </p>
          <p style={{ color:t.muted, fontSize:13, marginBottom:36 }}>
            You'll receive a notification once it's approved. Then head to <strong style={{ color:t.cyan }}>Invest</strong> to start earning.
          </p>
          <BtnPrimary onClick={() => { setStep(1); setCoin(null); setAmount(""); }} style={{ width:"100%" }}>
            Make Another Deposit
          </BtnPrimary>
        </div>
      )}
    </div>
  );
}

// ─── TAB: INVEST ──────────────────────────────────────────────────────────────
function Invest({ setTab }) {
  const _db          = useDB();
  const _user        = _db?.user        || USER;
  const _plans       = _db?.plans       ?? [];
  const _investments = _db?.investments ?? [];

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount,       setAmount]       = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [err,          setErr]          = useState("");
  const [success,      setSuccess]      = useState("");

  const plan = _plans.find(p => p.id === selectedPlan);

  const invest = async () => {
    if (!selectedPlan || !amount) { setErr("Select a plan and enter an amount."); return; }
    setErr(""); setSubmitting(true);
    try {
      const res  = await fetch("/api/user/invest", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan, amount: Number(amount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Investment of ${fmt(Number(amount))} in ${plan?.name} Plan started!`);
        setSelectedPlan(null); setAmount("");
        _db?.refreshProfile?.();
        // Refresh investments list
        try {
          const inv = await fetch("/api/user/investments").then(r=>r.json());
          if (Array.isArray(inv)) _db?.setInvestments?.(inv);
        } catch {}
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setErr(data.error || "Could not create investment.");
      }
    } catch { setErr("Something went wrong."); }
    finally  { setSubmitting(false); }
  };

  const activeInvestments = _investments.filter(i => i.status === "active");

  return (
    <div className="tab-content">
      {/* Balance card */}
      <div style={{ background:`linear-gradient(135deg,${t.navyLight},#0c2050)`,
        border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"24px", marginBottom:28,
        display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ fontSize:13, color:t.muted, marginBottom:6 }}>Available Balance</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:36, fontWeight:800,
            color:t.cyan, letterSpacing:"-1px" }}>{fmt(_user.balance ?? 0)}</div>
          <div style={{ fontSize:12, color:t.muted, marginTop:4 }}>Ready to invest</div>
        </div>
        <button onClick={() => setTab("deposit")}
          style={{ padding:"12px 24px", background:"transparent", border:`1px solid ${t.cyan}`,
            borderRadius:10, color:t.cyan, fontSize:13, fontWeight:600, cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}
          onMouseEnter={e=>e.currentTarget.style.background=t.cyanGlow2}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          + Add Funds
        </button>
      </div>

      {success && (
        <div style={{ background:t.greenDim, border:`1px solid rgba(0,224,150,0.3)`, borderRadius:12,
          padding:"14px 18px", marginBottom:20, fontSize:13, color:t.green, fontWeight:600 }}>
          ✅ {success}
        </div>
      )}

      {/* Plan selector */}
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginBottom:6 }}>Choose a Plan</h2>
        <p style={{ color:t.muted, fontSize:14, marginBottom:20 }}>Plans are managed by our admin team and updated regularly.</p>

        {_plans.length === 0 ? (
          <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14,
            padding:"40px", textAlign:"center", color:t.muted, fontSize:14 }}>
            No investment plans available right now. Check back soon.
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:16 }}>
            {_plans.map(p => (
              <div key={p.id} onClick={() => { setSelectedPlan(p.id); setAmount(""); setErr(""); }}
                style={{ background: selectedPlan===p.id ? `${p.color}14` : t.navyCard,
                  border:`2px solid ${selectedPlan===p.id ? p.color : t.navyBorder}`,
                  borderRadius:14, padding:"22px", cursor:"pointer", transition:"all .22s", position:"relative" }}>
                {selectedPlan===p.id && (
                  <div style={{ position:"absolute", top:12, right:12, width:20, height:20, borderRadius:"50%",
                    background:p.color, display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, color:t.navy, fontWeight:800 }}>✓</div>
                )}
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase",
                  color:t.muted, marginBottom:8 }}>{p.name} Plan</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:40, fontWeight:800,
                  color:p.color, letterSpacing:"-2px", lineHeight:1 }}>{p.rate}%</div>
                <div style={{ fontSize:12, color:t.muted, marginTop:4, marginBottom:16 }}>
                  daily return · {p.duration} days
                </div>
                <div style={{ height:1, background:t.navyBorder, marginBottom:14 }} />
                <div style={{ fontSize:13, color:t.muted }}>
                  Min <span style={{ color:t.white, fontWeight:600 }}>{fmt(p.min)}</span>
                  {" · "}
                  Max <span style={{ color:t.white, fontWeight:600 }}>{p.max>=999999?"Unlimited":fmt(p.max)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Amount + invest button */}
      {selectedPlan && plan && (
        <div style={{ maxWidth:480, background:t.navyCard, border:`1px solid ${t.navyBorder}`,
          borderRadius:16, padding:"24px", marginBottom:28 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>
            Invest in {plan.name} Plan
          </div>
          <div style={{ fontSize:13, color:t.muted, marginBottom:20 }}>
            {plan.rate}% daily for {plan.duration} days — min {fmt(plan.min)}
          </div>

          <Input label="Amount (USD)" type="number" icon="💵" suffix="USD"
            placeholder={`Min ${fmt(plan.min)}`} value={amount}
            onChange={e => { setAmount(e.target.value); setErr(""); }} />

          {amount && Number(amount) > 0 && (
            <div style={{ background:t.cyanGlow2, border:`1px solid rgba(0,212,255,0.15)`,
              borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                <span style={{ color:t.muted }}>Daily return</span>
                <span style={{ fontWeight:700, color:t.green }}>{fmt(Number(amount) * plan.rate / 100)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                <span style={{ color:t.muted }}>Total return ({plan.duration} days)</span>
                <span style={{ fontWeight:700, color:t.green }}>{fmt(Number(amount) * plan.rate / 100 * plan.duration)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                <span style={{ color:t.muted }}>Balance after invest</span>
                <span style={{ fontWeight:700, color: (_user.balance??0) < Number(amount) ? t.red : t.white }}>
                  {fmt(Math.max(0, (_user.balance??0) - Number(amount)))}
                </span>
              </div>
            </div>
          )}

          {err && <div style={{ fontSize:13, color:t.red, marginBottom:16 }}>⚠ {err}</div>}

          <BtnPrimary onClick={invest} loading={submitting} style={{ width:"100%" }}
            disabled={!amount || Number(amount) <= 0 || (_user.balance??0) < Number(amount)}>
            {(_user.balance??0) < Number(amount) ? "Insufficient Balance" : "Start Investment →"}
          </BtnPrimary>

          {(_user.balance??0) < Number(amount) && (
            <p style={{ fontSize:12, color:t.muted, marginTop:10, textAlign:"center" }}>
              <button onClick={() => setTab("deposit")}
                style={{ background:"none", border:"none", color:t.cyan, cursor:"pointer", fontSize:12, textDecoration:"underline" }}>
                Deposit funds
              </button>
              {" "}to top up your balance first.
            </p>
          )}
        </div>
      )}

      {/* Active investments */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"24px" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:20 }}>
          Active Investments
          {activeInvestments.length > 0 && (
            <span style={{ marginLeft:10, background:t.cyanGlow2, color:t.cyan, fontSize:12,
              fontWeight:600, padding:"3px 10px", borderRadius:20 }}>{activeInvestments.length}</span>
          )}
        </div>

        {activeInvestments.length === 0 ? (
          <div style={{ textAlign:"center", padding:"32px 20px", color:t.muted, fontSize:14 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>📈</div>
            No active investments yet. Choose a plan above to get started.
          </div>
        ) : (
          <div className="invest-grid">
            {activeInvestments.map((inv, i) => {
              const prog = ((inv.duration - inv.daysLeft) / inv.duration) * 100;
              const planName = typeof inv.plan === "object" ? inv.plan?.name : inv.plan;
              const planColor = _plans.find(p => p.name === planName)?.color || t.cyan;
              return (
                <div key={i} style={{ background:t.navyLight, border:`1px solid ${t.navyBorder}`,
                  borderRadius:14, padding:"20px", transition:"all .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=planColor}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=t.navyBorder}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                    <div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>{planName} Plan</div>
                      <div style={{ fontSize:12, color:t.muted, marginTop:2 }}>Started {inv.startDate}</div>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                    {[["Invested", fmt(inv.amount)], ["Earned", fmt(inv.earned||0)],
                      ["Daily Rate", `${inv.rate}%`], ["Days Left", inv.daysLeft]].map(([k,v])=>(
                      <div key={k}>
                        <div style={{ fontSize:11, color:t.muted }}>{k}</div>
                        <div style={{ fontSize:14, fontWeight:700, color:k==="Earned"?t.green:t.white }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:t.muted, marginBottom:5 }}>
                      <span>Progress</span><span>{Math.round(prog)}%</span>
                    </div>
                    <div style={{ height:6, background:t.navyBorder, borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${prog}%`, borderRadius:3, transition:"width 1s ease",
                        background:`linear-gradient(90deg,${planColor},${planColor}aa)` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB: REAL ESTATE ────────────────────────────────────────────────────────
function RealEstate({ setTab }) {
  const _db   = useDB();
  const _user = _db?.user || USER;

  const [properties,    setProperties]    = useState([]);
  const [myInvestments, setMyInvestments] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedProp,  setSelectedProp]  = useState(null);
  const [amount,        setAmount]        = useState("");
  const [investing,     setInvesting]     = useState(false);
  const [err,           setErr]           = useState("");
  const [success,       setSuccess]       = useState("");

  useEffect(() => {
    fetch("/api/user/realestate")
      .then(r => r.json())
      .then(d => { setProperties(d.properties || []); setMyInvestments(d.myInvestments || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const invest = async () => {
    if (!selectedProp || !amount) { setErr("Enter an amount."); return; }
    setErr(""); setInvesting(true);
    try {
      const res  = await fetch("/api/user/realestate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ propertyId: selectedProp.id, amount: Number(amount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Investment of ${fmt(Number(amount))} in "${selectedProp.title}" confirmed!`);
        setSelectedProp(null); setAmount("");
        _db?.refreshProfile?.();
        // Refresh properties
        fetch("/api/user/realestate").then(r=>r.json()).then(d=>{
          setProperties(d.properties||[]); setMyInvestments(d.myInvestments||[]);
        }).catch(()=>{});
        setTimeout(() => setSuccess(""), 5000);
      } else { setErr(data.error || "Investment failed."); }
    } catch { setErr("Something went wrong."); }
    finally  { setInvesting(false); }
  };

  const typeColor = { residential:t.cyan, commercial:t.gold, land:t.green, mixed:t.purple||"#a78bfa" };
  const typeLabel = { residential:"Residential", commercial:"Commercial", land:"Land", mixed:"Mixed Use" };

  if (loading) return (
    <div className="tab-content" style={{ display:"flex", justifyContent:"center", padding:60 }}>
      <div style={{ width:36, height:36, border:`3px solid ${t.navyBorder}`, borderTopColor:t.cyan, borderRadius:"50%", animation:"spin .8s linear infinite" }} />
    </div>
  );

  return (
    <div className="tab-content">
      {/* Header stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
        {[
          ["My Investments", myInvestments.length, t.cyan, "🏠"],
          ["Total Invested", fmt(myInvestments.reduce((s,i)=>s+i.amount,0)), t.green, "💰"],
          ["Total Earnings", fmt(myInvestments.reduce((s,i)=>s+(i.earningsSoFar||0),0)), t.gold, "📈"],
          ["Available Balance", fmt(_user.balance??0), t.cyan, "💼"],
        ].map(([label,val,color,icon])=>(
          <div key={label} style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"18px 20px" }}>
            <div style={{ fontSize:20, marginBottom:8 }}>{icon}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color }}>{val}</div>
            <div style={{ fontSize:12, color:t.muted, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {success && (
        <div style={{ background:t.greenDim, border:`1px solid rgba(0,224,150,0.3)`, borderRadius:12,
          padding:"14px 18px", marginBottom:20, fontSize:13, color:t.green, fontWeight:600 }}>
          ✅ {success}
        </div>
      )}

      {/* Invest modal */}
      {selectedProp && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:2000,
          display:"flex", alignItems:"flex-start", justifyContent:"center",
          padding:"24px 16px", overflowY:"auto" }}
          onClick={() => { setSelectedProp(null); setAmount(""); setErr(""); }}>
          <div style={{ background:t.navyMid, border:`1px solid ${t.navyBorder}`, borderRadius:16,
            width:"100%", maxWidth:520, padding:28, margin:"auto" }}
            onClick={e => e.stopPropagation()}>
            {/* Property image */}
            {selectedProp.imageUrl && (
              <div style={{ width:"100%", height:180, borderRadius:12, overflow:"hidden", marginBottom:20 }}>
                <img src={selectedProp.imageUrl} alt={selectedProp.title}
                  style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18 }}>{selectedProp.title}</div>
                <div style={{ fontSize:13, color:t.muted, marginTop:3 }}>📍 {selectedProp.location}</div>
              </div>
              <span style={{ background:`${typeColor[selectedProp.type]}20`, color:typeColor[selectedProp.type],
                fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>
                {typeLabel[selectedProp.type]}
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
              {[["Annual Return", `${selectedProp.annualReturn}%`, t.green],
                ["Duration", `${selectedProp.durationMonths} months`, t.cyan],
                ["Min Invest", fmt(selectedProp.minInvestment), t.gold]].map(([k,v,c])=>(
                <div key={k} style={{ background:t.navyLight, borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:11, color:t.muted, marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:c }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:6 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:t.muted, marginBottom:6 }}>
                <span>Funding progress</span>
                <span>{selectedProp.fundingPct}% · {fmt(selectedProp.raisedAmount)} of {fmt(selectedProp.targetAmount)}</span>
              </div>
              <div style={{ height:6, background:t.navyBorder, borderRadius:3, overflow:"hidden", marginBottom:20 }}>
                <div style={{ height:"100%", width:`${selectedProp.fundingPct}%`, background:`linear-gradient(90deg,${t.cyan},${t.green})`, borderRadius:3, transition:"width 1s" }} />
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:t.mutedLight, display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                Amount to Invest (USD)
              </label>
              <input type="number" value={amount} placeholder={`Min ${fmt(selectedProp.minInvestment)}`}
                onChange={e => { setAmount(e.target.value); setErr(""); }}
                className="cc-input"
                style={{ width:"100%", background:t.navyLight, border:`1px solid ${t.navyBorder}`,
                  borderRadius:10, padding:"12px 14px", color:t.white, fontSize:15 }} />
            </div>
            {amount && Number(amount) > 0 && (
              <div style={{ background:t.cyanGlow2, border:`1px solid rgba(0,212,255,0.15)`, borderRadius:10,
                padding:"12px 16px", marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                  <span style={{ color:t.muted }}>Monthly return</span>
                  <span style={{ color:t.green, fontWeight:700 }}>{fmt(Number(amount) * selectedProp.annualReturn / 100 / 12)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                  <span style={{ color:t.muted }}>Total over {selectedProp.durationMonths} months</span>
                  <span style={{ color:t.green, fontWeight:700 }}>{fmt(Number(amount) * selectedProp.annualReturn / 100 / 12 * selectedProp.durationMonths)}</span>
                </div>
              </div>
            )}
            {err && <div style={{ fontSize:13, color:t.red, marginBottom:12 }}>⚠ {err}</div>}
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={invest} disabled={investing||!amount}
                style={{ flex:1, padding:"13px", background:(!amount||investing)?`rgba(0,212,255,0.3)`:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
                  border:"none", borderRadius:10, color:t.navy, fontWeight:700, fontSize:14, cursor:(!amount||investing)?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                {investing ? "Processing…" : "Confirm Investment →"}
              </button>
              <button onClick={() => { setSelectedProp(null); setAmount(""); setErr(""); }}
                style={{ padding:"13px 20px", background:"transparent", border:`1px solid ${t.navyBorder}`, borderRadius:10, color:t.muted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property listings */}
      <div style={{ marginBottom:32 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginBottom:6 }}>Available Properties</div>
        <p style={{ color:t.muted, fontSize:14, marginBottom:20 }}>Carefully vetted real estate opportunities with guaranteed returns.</p>

        {properties.length === 0 ? (
          <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14,
            padding:"48px", textAlign:"center", color:t.muted, fontSize:14 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🏗️</div>
            No properties listed yet. Check back soon.
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
            {properties.map(p => (
              <div key={p.id} className="card-hover" style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
                borderRadius:16, overflow:"hidden", transition:"all .22s" }}>
                {/* Image */}
                <div style={{ height:180, background:t.navyLight, position:"relative", overflow:"hidden" }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  ) : (
                    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>🏠</div>
                  )}
                  <div style={{ position:"absolute", top:12, left:12, background:`${typeColor[p.type]}dd`,
                    color:"#fff", fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20, backdropFilter:"blur(8px)" }}>
                    {typeLabel[p.type]}
                  </div>
                  <div style={{ position:"absolute", top:12, right:12, background:p.status==="open"?t.greenDim:"rgba(240,192,64,0.2)",
                    color:p.status==="open"?t.green:t.gold, fontSize:11, fontWeight:700, padding:"4px 10px",
                    borderRadius:20, backdropFilter:"blur(8px)" }}>
                    {p.status==="open" ? "Open" : p.status==="funded" ? "Funded" : "Closed"}
                  </div>
                </div>

                <div style={{ padding:"20px" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:4 }}>{p.title}</div>
                  <div style={{ fontSize:13, color:t.muted, marginBottom:16 }}>📍 {p.location}</div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
                    {[["Return", `${p.annualReturn}%/yr`, t.green],
                      ["Duration", `${p.durationMonths}mo`, t.cyan],
                      ["Min", fmt(p.minInvestment), t.gold]].map(([k,v,c])=>(
                      <div key={k} style={{ background:t.navyLight, borderRadius:8, padding:"8px", textAlign:"center" }}>
                        <div style={{ fontSize:10, color:t.muted }}>{k}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:c, marginTop:2 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Funding bar */}
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:t.muted, marginBottom:5 }}>
                      <span>{p.investorCount} investors</span>
                      <span>{p.fundingPct}% funded</span>
                    </div>
                    <div style={{ height:5, background:t.navyBorder, borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${p.fundingPct}%`,
                        background:`linear-gradient(90deg,${t.cyan},${t.green})`, borderRadius:3 }} />
                    </div>
                  </div>

                  {p.highlights?.length > 0 && (
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
                      {p.highlights.slice(0,3).map((h,i)=>(
                        <span key={i} style={{ fontSize:11, background:t.cyanGlow2, color:t.cyan,
                          padding:"3px 8px", borderRadius:20 }}>✓ {h}</span>
                      ))}
                    </div>
                  )}

                  <button onClick={() => { setSelectedProp(p); setAmount(""); setErr(""); }}
                    disabled={p.status !== "open"}
                    style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", cursor:p.status==="open"?"pointer":"not-allowed",
                      background:p.status==="open"?`linear-gradient(135deg,${t.cyan},${t.cyanDim})`:"rgba(106,143,176,0.2)",
                      color:p.status==="open"?t.navy:t.muted, fontWeight:700, fontSize:14, fontFamily:"'DM Sans',sans-serif",
                      transition:"all .2s" }}>
                    {p.status==="open" ? "Invest Now →" : p.status==="funded" ? "Fully Funded" : "Closed"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My investments */}
      {myInvestments.length > 0 && (
        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"24px" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:20 }}>My Real Estate Portfolio</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {myInvestments.map((inv,i) => (
              <div key={i} style={{ background:t.navyLight, borderRadius:12, padding:"16px 18px",
                display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:`${t.cyan}18`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🏠</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{inv.propertyTitle}</div>
                    <div style={{ fontSize:12, color:t.muted, marginTop:2 }}>
                      Started {inv.startDate} · {inv.durationMonths}mo · {inv.annualReturn}%/yr
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:13, color:t.muted }}>Invested</div>
                    <div style={{ fontSize:15, fontWeight:700, color:t.white }}>{fmt(inv.amount)}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:13, color:t.muted }}>Earned</div>
                    <div style={{ fontSize:15, fontWeight:700, color:t.green }}>{fmt(inv.earningsSoFar||0)}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:13, color:t.muted }}>Monthly</div>
                    <div style={{ fontSize:15, fontWeight:700, color:t.cyan }}>{fmt(inv.monthlyReturn)}</div>
                  </div>
                  <span style={{ background:inv.status==="active"?t.greenDim:t.goldDim,
                    color:inv.status==="active"?t.green:t.gold,
                    fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20, alignSelf:"center" }}>
                    {inv.status==="active"?"Active":"Completed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB: WITHDRAW ────────────────────────────────────────────────────────────
function Withdraw() {
  const _db   = useDB();
  const _user = _db?.user || USER;

  const [availableCoins, setAvailableCoins] = useState([]);

  useEffect(() => {
    fetch("/api/user/deposit")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setAvailableCoins(d); })
      .catch(() => {});
  }, []);

  const [coin,    setCoin]    = useState("");
  const [wallet,  setWallet]  = useState("");
  const [amount,  setAmount]  = useState("");
  const [step,    setStep]    = useState(1); // 1=form, 2=confirm, 3=done
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!coin)                          e.coin   = "Select a coin";
    if (!wallet.trim())                 e.wallet = "Enter your wallet address";
    if (!amount || Number(amount) < 10) e.amount = "Minimum withdrawal is $10";
    if (Number(amount) > (_user.balance ?? 0)) e.amount = "Amount exceeds available balance";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin, walletAddress: wallet, amount: Number(amount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
        _db?.refreshProfile?.();
        _db?.refreshTransactions?.();
      } else {
        setErrors({ amount: data.error || "Withdrawal failed. Please try again." });
        setStep(1);
      }
    } catch {
      setErrors({ amount: "Something went wrong. Please try again." });
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      {/* Balance card */}
      <div style={{ background:`linear-gradient(135deg,${t.navyLight},#0c2050)`,
        border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"24px", marginBottom:28,
        display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ fontSize:13, color:t.muted, marginBottom:6 }}>Available Balance</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:36, fontWeight:800,
            color:t.cyan, letterSpacing:"-1px" }}>{fmt(_user.balance ?? 0)}</div>
          <div style={{ fontSize:12, color:t.muted, marginTop:4 }}>Ready to withdraw instantly</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {[["Total Earned", fmt(_user.totalEarned ?? 0), t.green],
            ["Total Withdrawn", fmt(_user.totalWithdrawn ?? 0), t.muted]].map(([l,v,c])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:12, color:t.muted, marginBottom:4 }}>{l}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div style={{ maxWidth:560 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, marginBottom:6 }}>Withdrawal Request</h2>
          <p style={{ color:t.muted, fontSize:14, marginBottom:24 }}>Enter your details below to request a withdrawal.</p>

          {/* Coin select */}
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:12, fontWeight:600, letterSpacing:"0.5px", color:t.mutedLight,
              display:"block", marginBottom:8, textTransform:"uppercase" }}>Select Coin *</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:8 }}>
              {(availableCoins.length ? availableCoins : COINS).map(c => (
                <div key={c.id} onClick={() => { setCoin(c.id); setErrors(prev=>({...prev,coin:""})); }}
                  style={{ background:coin===c.id?t.cyanGlow2:t.navyCard,
                    border:`2px solid ${coin===c.id?t.cyan:errors.coin?t.red:t.navyBorder}`,
                    borderRadius:10, padding:"12px 8px", cursor:"pointer", transition:"all .2s", textAlign:"center" }}>
                  <div style={{ fontWeight:700, fontSize:13, color:coin===c.id?t.cyan:t.white }}>{c.symbol}</div>
                  <div style={{ fontSize:11, color:t.muted, marginTop:2 }}>{c.network}</div>
                </div>
              ))}
            </div>
            {errors.coin && <div style={{ fontSize:12, color:t.red, marginTop:6 }}>⚠ {errors.coin}</div>}
          </div>

          <Input label="Wallet Address *" placeholder="Enter your wallet address" icon="🔗"
            value={wallet} error={errors.wallet}
            onChange={e => { setWallet(e.target.value); setErrors(p=>({...p,wallet:""})); }} />

          <Input label="Amount (USD) *" type="number" placeholder="Enter withdrawal amount"
            icon="💵" suffix="USD" value={amount} error={errors.amount}
            onChange={e => { setAmount(e.target.value); setErrors(p=>({...p,amount:""})); }} />

          {/* Quick amounts */}
          <div style={{ display:"flex", gap:8, marginBottom:22, flexWrap:"wrap" }}>
            {[100, 500, 1000, 5000].map(v => (
              <button key={v} onClick={() => setAmount(String(v))}
                style={{ padding:"6px 14px", background:Number(amount)===v?t.cyanGlow2:"transparent",
                  border:`1px solid ${Number(amount)===v?t.cyan:t.navyBorder}`, borderRadius:8,
                  color:Number(amount)===v?t.cyan:t.muted, fontSize:12, cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
                ${v}
              </button>
            ))}
            <button onClick={() => setAmount(String(_user.balance ?? 0))}
              style={{ padding:"6px 14px", background:"transparent", border:`1px solid ${t.navyBorder}`,
                borderRadius:8, color:t.muted, fontSize:12, cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>Max</button>
          </div>

          <BtnPrimary onClick={submit} style={{ width:"100%" }}>Request Withdrawal →</BtnPrimary>

          <div style={{ marginTop:16, padding:"14px", background:t.cyanGlow2,
            border:`1px solid rgba(0,212,255,0.15)`, borderRadius:10, fontSize:13, color:t.muted, lineHeight:1.7 }}>
            ℹ️ Withdrawals are processed by admin and sent to your wallet within minutes. Ensure your wallet address is correct — incorrect addresses result in permanent loss.
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth:480 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, marginBottom:6 }}>Confirm Withdrawal</h2>
          <p style={{ color:t.muted, fontSize:14, marginBottom:24 }}>Please review your withdrawal details before confirming.</p>
          <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"22px", marginBottom:20 }}>
            {[["Amount",fmt(Number(amount))], ["Coin",(availableCoins.length?availableCoins:COINS).find(c=>c.id===coin)?.symbol||""],
              ["Network",(availableCoins.length?availableCoins:COINS).find(c=>c.id===coin)?.network||""],
              ["Wallet Address",wallet]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 0", borderBottom:`1px solid ${t.navyBorder}`, gap:12 }}>
                <span style={{ color:t.muted, fontSize:13, flexShrink:0 }}>{k}</span>
                <span style={{ fontWeight:600, fontSize:13, textAlign:"right", wordBreak:"break-all" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding:"14px", background:t.goldDim, border:`1px solid rgba(240,192,64,0.2)`,
            borderRadius:10, fontSize:13, color:t.gold, lineHeight:1.7, marginBottom:20 }}>
            ⚠️ Once confirmed, this action cannot be reversed. Please double-check your wallet address.
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <BtnPrimary onClick={confirm} loading={loading} style={{ flex:1 }}>Confirm Withdrawal</BtnPrimary>
            <button onClick={() => setStep(1)} style={{ padding:"13px 24px", background:"transparent",
              border:`1px solid ${t.navyBorder}`, borderRadius:10, color:t.muted, cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=t.cyan}
              onMouseLeave={e=>e.currentTarget.style.borderColor=t.navyBorder}>← Back</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ maxWidth:480, textAlign:"center" }}>
          <div style={{ width:80, height:80, borderRadius:"50%",
            background:`linear-gradient(135deg,${t.green},#00c07a)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:36, margin:"0 auto 24px", animation:"checkPop .6s cubic-bezier(.34,1.56,.64,1) both" }}>✓</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, marginBottom:12 }}>Request Submitted!</h2>
          <p style={{ color:t.muted, fontSize:15, lineHeight:1.75, marginBottom:36 }}>
            Your withdrawal of <span style={{ color:t.cyan, fontWeight:700 }}>{fmt(Number(amount))}</span> has been submitted
            and is being processed by our admin team. Funds will arrive shortly.
          </p>
          <BtnPrimary onClick={() => { setStep(1); setCoin(""); setWallet(""); setAmount(""); }}
            style={{ width:"100%" }}>Make Another Withdrawal</BtnPrimary>
        </div>
      )}
    </div>
  );
}

// ─── TAB: TRANSACTIONS ────────────────────────────────────────────────────────
function Transactions() {
  const _db           = useDB();
  const _transactions = _db?.transactions ?? [];

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const types = ["all","deposit","withdrawal","earning","referral"];
  const filtered = _transactions.filter(tx =>
    (filter === "all" || tx.type === filter) &&
    ((tx.id || tx._id || "").toString().toLowerCase().includes(search.toLowerCase()) ||
     (tx.plan || "").toLowerCase().includes(search.toLowerCase()) ||
     (tx.coin || "").toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    const rows = [["ID","Type","Amount","Plan","Coin","Date","Status","Hash"],
      ...filtered.map(tx => [tx.id,tx.type,tx.amount,tx.plan,tx.coin,tx.date,tx.status,tx.hash])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="crestcapital_transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tab-content">
      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
        {[
          ["Total Deposits",    fmt(_transactions.filter(x=>x.type==="deposit").reduce((a,x)=>a+(x.amount||0),0)),    t.cyan ],
          ["Total Withdrawals", fmt(_transactions.filter(x=>x.type==="withdrawal").reduce((a,x)=>a+(x.amount||0),0)), t.red  ],
          ["Total Earnings",    fmt(_transactions.filter(x=>x.type==="earning").reduce((a,x)=>a+(x.amount||0),0)),    t.green],
          ["Referral Bonuses",  fmt(_transactions.filter(x=>x.type==="referral").reduce((a,x)=>a+(x.amount||0),0)),   t.gold ],
        ].map(([label,val,color])=>(
          <div key={label} style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
            borderRadius:12, padding:"18px" }}>
            <div style={{ fontSize:12, color:t.muted, marginBottom:6 }}>{label}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Filters + search + export */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {types.map(type => (
            <button key={type} onClick={() => setFilter(type)}
              style={{ padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", transition:"all .2s", border:"none",
                background: filter===type ? `linear-gradient(135deg,${t.cyan},${t.cyanDim})` : t.navyCard,
                color: filter===type ? t.navy : t.muted,
                boxShadow: filter===type ? `0 2px 12px ${t.cyanGlow}` : "none" }}>
              {type.charAt(0).toUpperCase()+type.slice(1)}
            </button>
          ))}
        </div>
        <input className="cc-input" placeholder="Search transactions..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:160, background:t.navyCard, border:`1px solid ${t.navyBorder}`,
            borderRadius:8, padding:"8px 14px", color:t.white, fontSize:13,
            fontFamily:"'DM Sans',sans-serif" }} />
        <button onClick={exportCSV}
          style={{ padding:"8px 18px", background:t.cyanGlow2, border:`1px solid rgba(0,212,255,0.25)`,
            borderRadius:8, color:t.cyan, fontSize:13, fontWeight:600, cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", transition:"all .2s", whiteSpace:"nowrap" }}
          onMouseEnter={e=>e.currentTarget.style.background=t.cyanGlow}
          onMouseLeave={e=>e.currentTarget.style.background=t.cyanGlow2}>
          ⬇ Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, overflow:"hidden" }}>
        <div className="overflow-x">
        {/* Header */}
        <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 120px 100px 100px 100px",
          padding:"13px 20px", background:t.navyLight, fontSize:11, fontWeight:700,
          letterSpacing:"1.5px", color:t.muted, textTransform:"uppercase", minWidth:360 }}>
          <span></span>
          <span>Transaction</span>
          <span className="tx-cols" style={{ textAlign:"right" }}>Amount</span>
          <span className="tx-cols" style={{ textAlign:"center" }}>Coin</span>
          <span className="tx-cols" style={{ textAlign:"center" }}>Date</span>
          <span style={{ textAlign:"center" }}>Status</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:"48px", textAlign:"center", color:t.muted, fontSize:14 }}>
            No transactions found.
          </div>
        ) : filtered.map((tx, i) => (
          <div key={tx._id || tx.id || i} className="row-hover" style={{ display:"grid",
            gridTemplateColumns:"40px 1fr 120px 100px 100px 100px",
            padding:"14px 20px", borderTop:`1px solid ${t.navyBorder}`,
            transition:"background .15s", alignItems:"center", minWidth:360 }}>
            <TxIcon type={tx.type} />
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, textTransform:"capitalize",
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {tx.type} {tx.plan && tx.plan !== "-" ? `· ${tx.plan}` : ""}
              </div>
              <div style={{ fontSize:11, color:t.muted, marginTop:2, fontFamily:"monospace",
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tx.id || tx._id}</div>
            </div>
            <div className="tx-cols" style={{ textAlign:"right", fontFamily:"'Syne',sans-serif", fontWeight:700,
              fontSize:14, color: tx.type==="withdrawal"?t.red : tx.type==="earning"||tx.type==="referral"?t.green:t.white }}>
              {tx.type==="withdrawal"?"-":"+"}${tx.amount.toLocaleString()}
            </div>
            <div className="tx-cols" style={{ textAlign:"center" }}>
              <Badge>{tx.coin}</Badge>
            </div>
            <div className="tx-cols" style={{ textAlign:"center", fontSize:12, color:t.muted }}>{tx.date}</div>
            <div style={{ textAlign:"center" }}><StatusBadge status={tx.status} /></div>
          </div>
        ))}
        </div>{/* /overflow-x */}
      </div>

      <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:t.muted }}>
        Showing {filtered.length} of {_transactions.length} transactions
      </div>
    </div>
  );
}

// ─── TAB: REFERRALS ───────────────────────────────────────────────────────────
function Referrals() {
  const _db        = useDB();
  const _user      = _db?.user      || USER;

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/referrals")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const _referrals  = data?.referrals        ?? [];
  const totalEarned = data?.referralBonus     ?? _user.referralBonus ?? 0;
  const totalCount  = data?.totalReferrals    ?? _referrals.length;

  const referralLink = _user.referralLink
    || (typeof window !== "undefined"
        ? `${window.location.origin}/ref/${_user.referralCode}`
        : `https://crestcapital.com/ref/${_user.referralCode}`);

  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // Get commission rate from settings (live) — fallback 8
  const commissionRate = _db?.settings?.referralRate ?? 8;

  return (
    <div className="tab-content">
      {loading && (
        <div style={{ textAlign:"center", padding:"40px", color:t.muted }}>
          <div style={{ width:32, height:32, border:`2px solid ${t.navyBorder}`, borderTopColor:t.cyan,
            borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }} />
          Loading referrals…
        </div>
      )}
      {!loading && (
      <>
      {/* Stats */}
      <div className="ref-grid" style={{ marginBottom:24 }}>
        {[
          ["Total Referrals",  totalCount,            t.cyan,  "👥"],
          ["Total Earned",     fmt(totalEarned),       t.green, "💰"],
          ["Commission Rate",  `${commissionRate}%`,   t.gold,  "📊"],
        ].map(([label,val,color,icon])=>(
          <div key={label} style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
            borderRadius:16, padding:"22px", position:"relative", overflow:"hidden" }}>
            <GlowOrb style={{ width:100, height:100, background:`${color}10`, top:"-10%", right:"-10%" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color }}>{val}</div>
              <div style={{ fontSize:13, color:t.muted, marginTop:4 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
        borderRadius:16, padding:"24px", marginBottom:24 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>Your Referral Link</div>
        <p style={{ color:t.muted, fontSize:14, marginBottom:18 }}>
          Share your unique link and earn <span style={{ color:t.cyan, fontWeight:700 }}>{commissionRate}% commission</span> on every referral's first deposit.
        </p>
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <div style={{ flex:1, background:t.navyLight, border:`1px solid ${t.navyBorder}`,
            borderRadius:10, padding:"12px 14px", fontSize:13, color:t.mutedLight,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {referralLink}
          </div>
          <button onClick={copy}
            style={{ background:copied?t.greenDim:t.cyanGlow2, border:`1px solid ${copied?t.green:t.cyan}`,
              borderRadius:10, padding:"12px 18px", cursor:"pointer", color:copied?t.green:t.cyan,
              fontSize:13, fontWeight:700, fontFamily:"'DM Sans',sans-serif",
              transition:"all .2s", whiteSpace:"nowrap" }}>
            {copied?"✓ Copied":"Copy Link"}
          </button>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <div style={{ background:t.navyLight, border:`1px solid ${t.navyBorder}`, borderRadius:8,
            padding:"8px 14px", fontSize:12, color:t.muted }}>
            Your code: <span style={{ color:t.cyan, fontWeight:700 }}>{_user.referralCode}</span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
        borderRadius:16, padding:"24px", marginBottom:24 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:18 }}>How It Works</div>
        <div style={{ display:"flex", gap:0 }}>
          {[
            ["🔗","Share Link","Share your unique referral link with friends and colleagues."],
            ["👤","They Sign Up","They register and make their first investment deposit."],
            ["💰","You Earn",`You receive ${commissionRate}% commission instantly to your balance on their first deposit.`],
          ].map(([icon,title,desc],i)=>(
            <div key={i} style={{ flex:1, textAlign:"center", padding:"0 16px",
              borderRight: i<2?`1px solid ${t.navyBorder}`:"none" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>{icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:6 }}>{title}</div>
              <div style={{ fontSize:13, color:t.muted, lineHeight:1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral list */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ padding:"18px 20px", borderBottom:`1px solid ${t.navyBorder}`,
          fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16 }}>My Referrals</div>
        {_referrals.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:t.muted }}>No referrals yet. Share your link to get started!</div>
        ) : _referrals.map((r, i) => (
          <div key={i} className="row-hover" style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", padding:"16px 20px", borderTop: i>0?`1px solid ${t.navyBorder}`:"none",
            flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:"50%",
                background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:t.navy }}>
                {r.name[0]}
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>{r.name}</div>
                <div style={{ fontSize:12, color:t.muted }}>{r.email} · {r.date}</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:14, fontWeight:700, color:t.green }}>{fmt(r.earned ?? r.amount ?? 0)}</div>
                <div style={{ fontSize:11, color:t.muted }}>
                  {r.deposited > 0 ? `Deposited ${fmt(r.deposited)}` : "No deposit yet"}
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}

// ─── TAB: PROFILE ─────────────────────────────────────────────────────────────
function Profile() {
  const _db   = useDB();
  const _user = _db?.user || USER;

  // KYC state
  const [kycSub,     setKycSub]     = useState(null);
  const [kycForm,    setKycForm]    = useState({ docType:"", docNumber:"", country:"" });
  const [frontImg,   setFrontImg]   = useState(null);  // base64 data URL
  const [backImg,    setBackImg]    = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycErr,     setKycErr]     = useState("");
  const [kycSuccess, setKycSuccess] = useState("");

  useEffect(() => {
    fetch("/api/user/kyc").then(r=>r.json()).then(d=>{ if (d.submission) setKycSub(d.submission); }).catch(()=>{});
  }, []);

  const readFile = (file) => new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    if (file.size > 3 * 1024 * 1024) { reject(new Error("Image must be under 3 MB.")); return; }
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result); // data URL string
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });

  const submitKyc = async () => {
    if (!kycForm.docType || !kycForm.country) { setKycErr("Document type and country are required."); return; }
    if (!frontImg) { setKycErr("Front image of ID card is required."); return; }
    setKycLoading(true); setKycErr("");
    try {
      const res  = await fetch("/api/user/kyc", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...kycForm, docFront: frontImg, docBack: backImg || "" }),
      });
      const data = await res.json();
      if (res.ok) {
        setKycSuccess(data.message);
        setKycSub({ ...kycForm, status:"pending", hasFront:true, hasBack:!!backImg, submitted:new Date().toISOString().split("T")[0] });
        setFrontImg(null); setBackImg(null);
        _db?.refreshProfile?.();
        setTimeout(()=>setKycSuccess(""),5000);
      } else { setKycErr(data.error || "Submission failed."); }
    } catch { setKycErr("Something went wrong."); }
    finally  { setKycLoading(false); }
  };

  const [form,    setForm]    = useState({ name:_user.name||"", phone:_user.phone||"", country:_user.country||"" });
  const [twoFA,   setTwoFA]   = useState(_user.twoFAEnabled ?? false);
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // Change Password modal state
  const [showPwd,  setShowPwd]  = useState(false);
  const [pwdForm,  setPwdForm]  = useState({ current:"", newPwd:"", confirm:"" });
  const [pwdErr,   setPwdErr]   = useState("");
  const [pwdOk,    setPwdOk]    = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  const [showPwdNew,     setShowPwdNew]     = useState(false);

  // Change PIN modal state
  const [showPin,  setShowPin]  = useState(false);
  const [pinForm,  setPinForm]  = useState({ current:"", newPin:"", confirm:"" });
  const [pinErr,   setPinErr]   = useState("");
  const [pinOk,    setPinOk]    = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  // Sync form when real user data loads
  useEffect(() => {
    if (_db?.user) {
      setForm({ name:_db.user.name||"", phone:_db.user.phone||"", country:_db.user.country||"" });
      setTwoFA(_db.user.twoFAEnabled ?? false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_db?.user?.email]);

  const save = async () => {
    setSaving(true); setSaveErr("");
    try {
      const nameParts = form.name.trim().split(" ");
      const res = await fetch("/api/user/profile", {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ firstName:nameParts[0]||"", lastName:nameParts.slice(1).join(" ")||"", phone:form.phone, country:form.country }),
      });
      if (res.ok) { setSaved(true); _db?.refreshProfile?.(); setTimeout(()=>setSaved(false),2500); }
      else { const d=await res.json(); setSaveErr(d.error||"Failed to save."); }
    } catch { setSaveErr("Something went wrong."); }
    finally  { setSaving(false); }
  };

  const toggle2FA = async (val) => {
    setTwoFA(val);
    try {
      await fetch("/api/user/profile", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ twoFAEnabled:val }) });
      _db?.refreshProfile?.();
    } catch { setTwoFA(!val); } // revert on fail
  };

  const changePassword = async () => {
    if (!pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm) { setPwdErr("All fields are required."); return; }
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdErr("New passwords do not match."); return; }
    if (pwdForm.newPwd.length < 8) { setPwdErr("Password must be at least 8 characters."); return; }
    setPwdLoading(true); setPwdErr("");
    try {
      const res  = await fetch("/api/user/change-password", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ currentPassword:pwdForm.current, newPassword:pwdForm.newPwd }) });
      const data = await res.json();
      if (res.ok) { setPwdOk("Password updated successfully!"); setPwdForm({current:"",newPwd:"",confirm:""}); setTimeout(()=>{ setPwdOk(""); setShowPwd(false); },2000); }
      else { setPwdErr(data.error||"Failed to update password."); }
    } catch { setPwdErr("Something went wrong."); }
    finally  { setPwdLoading(false); }
  };

  const changePin = async () => {
    if (!pinForm.current || !pinForm.newPin || !pinForm.confirm) { setPinErr("All fields are required."); return; }
    if (pinForm.newPin !== pinForm.confirm) { setPinErr("New PINs do not match."); return; }
    if (!/^\d{5}$/.test(pinForm.newPin)) { setPinErr("PIN must be exactly 5 digits."); return; }
    setPinLoading(true); setPinErr("");
    try {
      const res  = await fetch("/api/user/change-pin", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ currentPin:pinForm.current, newPin:pinForm.newPin }) });
      const data = await res.json();
      if (res.ok) { setPinOk("PIN updated successfully!"); setPinForm({current:"",newPin:"",confirm:""}); setTimeout(()=>{ setPinOk(""); setShowPin(false); },2000); }
      else { setPinErr(data.error||"Failed to update PIN."); }
    } catch { setPinErr("Something went wrong."); }
    finally  { setPinLoading(false); }
  };

  // ── Inline modals ────────────────────────────────────────────────────────────
  const PwdInput = ({ label, field, show, setShow, val, onChange }) => (
    <div style={{ marginBottom:16 }}>
      <label style={{ fontSize:12, fontWeight:600, letterSpacing:"0.5px", color:t.mutedLight, display:"block", marginBottom:7, textTransform:"uppercase" }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input type={show?"text":"password"} value={val} onChange={onChange} className="cc-input"
          style={{ width:"100%", background:"rgba(15,32,64,0.6)", border:`1px solid ${t.navyBorder}`, borderRadius:10, padding:"13px 44px 13px 14px", color:t.white, fontSize:15, fontFamily:"'DM Sans',sans-serif" }} />
        <button type="button" onClick={()=>setShow(!show)}
          style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:t.muted, cursor:"pointer", fontSize:14 }}>
          {show?"🙈":"👁"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="tab-content">

      {/* Change Password modal */}
      {showPwd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={()=>{ setShowPwd(false); setPwdErr(""); setPwdOk(""); setPwdForm({current:"",newPwd:"",confirm:""}); }}>
          <div style={{ background:t.navyMid, border:`1px solid ${t.navyBorder}`, borderRadius:16, width:"100%", maxWidth:440, padding:28 }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, marginBottom:22 }}>Change Password</div>
            <PwdInput label="Current Password" field="current" show={showPwdCurrent} setShow={setShowPwdCurrent} val={pwdForm.current} onChange={e=>setPwdForm(p=>({...p,current:e.target.value}))} />
            <PwdInput label="New Password"     field="new"     show={showPwdNew}     setShow={setShowPwdNew}     val={pwdForm.newPwd} onChange={e=>setPwdForm(p=>({...p,newPwd:e.target.value}))} />
            <PwdInput label="Confirm New Password" field="confirm" show={showPwdNew} setShow={setShowPwdNew}     val={pwdForm.confirm} onChange={e=>setPwdForm(p=>({...p,confirm:e.target.value}))} />
            {pwdErr && <div style={{ fontSize:13, color:t.red,   marginBottom:14 }}>⚠ {pwdErr}</div>}
            {pwdOk  && <div style={{ fontSize:13, color:t.green, marginBottom:14 }}>✅ {pwdOk}</div>}
            <div style={{ display:"flex", gap:10 }}>
              <BtnPrimary onClick={changePassword} loading={pwdLoading} style={{ flex:1 }}>Update Password</BtnPrimary>
              <button onClick={()=>{ setShowPwd(false); setPwdErr(""); setPwdForm({current:"",newPwd:"",confirm:""}); }}
                style={{ padding:"13px 20px", background:"transparent", border:`1px solid ${t.navyBorder}`, borderRadius:10, color:t.muted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change PIN modal */}
      {showPin && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={()=>{ setShowPin(false); setPinErr(""); setPinOk(""); setPinForm({current:"",newPin:"",confirm:""}); }}>
          <div style={{ background:t.navyMid, border:`1px solid ${t.navyBorder}`, borderRadius:16, width:"100%", maxWidth:420, padding:28 }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, marginBottom:22 }}>Change PIN</div>
            {[["Current PIN","current",pinForm.current],["New PIN (5 digits)","newPin",pinForm.newPin],["Confirm New PIN","confirm",pinForm.confirm]].map(([label,field,val])=>(
              <div key={field} style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, letterSpacing:"0.5px", color:t.mutedLight, display:"block", marginBottom:7, textTransform:"uppercase" }}>{label}</label>
                <input type="password" inputMode="numeric" maxLength={5} value={val}
                  onChange={e=>{ if(/^\d*$/.test(e.target.value)&&e.target.value.length<=5) setPinForm(p=>({...p,[field]:e.target.value})); }}
                  className="cc-input" placeholder="• • • • •"
                  style={{ width:"100%", background:"rgba(15,32,64,0.6)", border:`1px solid ${t.navyBorder}`, borderRadius:10, padding:"13px 14px", color:t.white, fontSize:22, letterSpacing:8, fontFamily:"monospace" }} />
              </div>
            ))}
            {pinErr && <div style={{ fontSize:13, color:t.red,   marginBottom:14 }}>⚠ {pinErr}</div>}
            {pinOk  && <div style={{ fontSize:13, color:t.green, marginBottom:14 }}>✅ {pinOk}</div>}
            <div style={{ display:"flex", gap:10 }}>
              <BtnPrimary onClick={changePin} loading={pinLoading} style={{ flex:1 }}>Update PIN</BtnPrimary>
              <button onClick={()=>{ setShowPin(false); setPinErr(""); setPinForm({current:"",newPin:"",confirm:""}); }}
                style={{ padding:"13px 20px", background:"transparent", border:`1px solid ${t.navyBorder}`, borderRadius:10, color:t.muted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar header */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"28px", marginBottom:24,
        display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:t.navy, flexShrink:0 }}>
          {_user.avatar}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22 }}>{_user.name}</div>
          <div style={{ color:t.muted, fontSize:14, marginTop:4 }}>
            @{_user.username} · Member since {_user.joined || new Date(_user.createdAt || Date.now()).toLocaleDateString("en-US",{month:"long",year:"numeric"})}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:10, flexWrap:"wrap" }}>
            {_user.kycStatus === "verified"   && <Badge color={t.green} bg={t.greenDim}>✓ KYC Verified</Badge>}
            {_user.kycStatus === "pending"    && <Badge color={t.gold}  bg={t.goldDim}>⏳ KYC Pending</Badge>}
            {_user.kycStatus === "unverified" && <Badge color={t.muted} bg="rgba(106,143,176,0.1)">KYC Unverified</Badge>}
            <Badge color={t.cyan} bg={t.cyanGlow2}>Active Investor</Badge>
            {twoFA && <Badge color={t.gold} bg={t.goldDim}>🔐 2FA On</Badge>}
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Personal info */}
        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"24px" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:20 }}>Personal Information</div>
          <Input label="Full Name"     value={form.name}    icon="👤" onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          {/* Email — read-only, must use Change Password flow to verify identity */}
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:12, fontWeight:600, letterSpacing:"0.5px", color:t.mutedLight, display:"block", marginBottom:7, textTransform:"uppercase" }}>Email Address</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, color:t.muted, pointerEvents:"none" }}>✉️</span>
              <input value={_user.email||""} readOnly className="cc-input"
                style={{ width:"100%", background:"rgba(15,32,64,0.35)", border:`1px solid ${t.navyBorder}`, borderRadius:10,
                  padding:"13px 14px 13px 42px", color:t.muted, fontSize:15, fontFamily:"'DM Sans',sans-serif", cursor:"not-allowed" }} />
              <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:t.muted }}>locked</span>
            </div>
          </div>
          <Input label="Phone Number"  value={form.phone}   icon="📞" type="tel" onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
          <Input label="Country"       value={form.country} icon="🌍" onChange={e=>setForm(f=>({...f,country:e.target.value}))} style={{ marginBottom:saveErr?8:24 }} />
          {saveErr && <div style={{ fontSize:12, color:t.red, marginBottom:16 }}>⚠ {saveErr}</div>}
          <BtnPrimary onClick={save} loading={saving} style={{ width:"100%" }}>
            {saved ? "✓ Changes Saved" : "Save Changes"}
          </BtnPrimary>
        </div>

        {/* Security */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"24px" }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:20 }}>Security Settings</div>

            {/* 2FA toggle — saves to DB */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"16px", background:t.navyLight, borderRadius:12, marginBottom:14 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>Two-Factor Authentication</div>
                <div style={{ fontSize:12, color:t.muted, marginTop:3 }}>
                  {twoFA ? "Enabled — extra layer of login security" : "Disabled — enable for extra security"}
                </div>
              </div>
              <div onClick={()=>toggle2FA(!twoFA)}
                style={{ width:48, height:26, borderRadius:13, cursor:"pointer", transition:"all .3s",
                  background:twoFA?t.cyan:t.navyBorder, position:"relative", flexShrink:0 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff",
                  position:"absolute", top:3, transition:"left .3s", left:twoFA?25:3 }} />
              </div>
            </div>

            {/* Change Password */}
            <div onClick={()=>setShowPwd(true)} className="card-hover"
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px",
                background:t.navyLight, borderRadius:10, border:`1px solid ${t.navyBorder}`,
                cursor:"pointer", marginBottom:10, transition:"all .2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:18 }}>🔑</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>Change Password</div>
                  <div style={{ fontSize:11, color:t.muted }}>Update your account password</div>
                </div>
              </div>
              <span style={{ color:t.cyan, fontSize:13 }}>→</span>
            </div>

            {/* Change PIN */}
            <div onClick={()=>setShowPin(true)} className="card-hover"
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px",
                background:t.navyLight, borderRadius:10, border:`1px solid ${t.navyBorder}`,
                cursor:"pointer", marginBottom:10, transition:"all .2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:18 }}>📱</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>Change PIN</div>
                  <div style={{ fontSize:11, color:t.muted }}>Update your 5-digit security PIN</div>
                </div>
              </div>
              <span style={{ color:t.cyan, fontSize:13 }}>→</span>
            </div>
          </div>

          {/* Account info */}
          <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"24px" }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:16 }}>Account Details</div>
            {[
              ["Account ID",   "#CC-" + (_user.username||"USER").toUpperCase()],
              ["Username",     "@" + (_user.username||"—")],
              ["Member Since", _user.joined || new Date(_user.createdAt||Date.now()).toLocaleDateString("en-US",{month:"long",year:"numeric"})],
              ["KYC Status",   _user.kycStatus==="verified"?"✅ Fully Verified":_user.kycStatus==="pending"?"⏳ Under Review":"❌ Unverified"],
              ["2FA",          twoFA ? "🔐 Enabled" : "Off"],
              ["Account Type", "Standard Investor"],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between",
                padding:"10px 0", borderBottom:`1px solid ${t.navyBorder}`, fontSize:13 }}>
                <span style={{ color:t.muted }}>{k}</span>
                <span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KYC Verification ───────────────────────────────────────────────── */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:16, padding:"28px", marginTop:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16 }}>KYC Verification</div>
            <div style={{ fontSize:13, color:t.muted, marginTop:3 }}>Verify your identity to unlock full platform access</div>
          </div>
          {_user.kycStatus === "verified" && <Badge color={t.green} bg={t.greenDim}>✓ Verified</Badge>}
          {_user.kycStatus === "pending"  && <Badge color={t.gold}  bg={t.goldDim}>⏳ Under Review</Badge>}
          {_user.kycStatus === "unverified" && <Badge color={t.muted} bg="rgba(106,143,176,0.1)">Unverified</Badge>}
        </div>

        {/* Already verified */}
        {_user.kycStatus === "verified" && (
          <div style={{ background:t.greenDim, border:`1px solid rgba(0,224,150,0.2)`, borderRadius:12,
            padding:"20px 24px", display:"flex", gap:14, alignItems:"center" }}>
            <span style={{ fontSize:28 }}>✅</span>
            <div>
              <div style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>Identity Verified</div>
              <div style={{ fontSize:13, color:t.muted }}>Your identity has been successfully verified. You have full access to all platform features.</div>
            </div>
          </div>
        )}

        {/* Pending review */}
        {_user.kycStatus === "pending" && (
          <div style={{ background:t.goldDim, border:`1px solid rgba(240,192,64,0.2)`, borderRadius:12,
            padding:"20px 24px", display:"flex", gap:14, alignItems:"flex-start" }}>
            <span style={{ fontSize:28 }}>⏳</span>
            <div>
              <div style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>Review In Progress</div>
              <div style={{ fontSize:13, color:t.muted, lineHeight:1.7 }}>
                Your KYC application is being reviewed. This usually takes less than 24 hours.
                {kycSub && <span style={{ display:"block", marginTop:4 }}>Submitted: {kycSub.submitted} · Document: {kycSub.docType}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Rejected — allow re-submission */}
        {(_user.kycStatus === "unverified" && kycSub?.status === "rejected") && (
          <div style={{ background:t.redDim, border:`1px solid rgba(255,77,109,0.2)`, borderRadius:12,
            padding:"16px 20px", marginBottom:20, display:"flex", gap:12, alignItems:"flex-start" }}>
            <span style={{ fontSize:20 }}>❌</span>
            <div>
              <div style={{ fontWeight:600, fontSize:14, marginBottom:3 }}>Previous Submission Rejected</div>
              {kycSub.adminNote && <div style={{ fontSize:13, color:t.muted }}>Reason: {kycSub.adminNote}</div>}
              <div style={{ fontSize:13, color:t.muted, marginTop:2 }}>Please re-submit with valid documents.</div>
            </div>
          </div>
        )}

        {/* Submission form */}
        {(_user.kycStatus === "unverified") && (
          <div>
            {kycSuccess && (
              <div style={{ background:t.greenDim, border:`1px solid rgba(0,224,150,0.25)`, borderRadius:10,
                padding:"12px 16px", marginBottom:16, fontSize:13, color:t.green }}>✅ {kycSuccess}</div>
            )}

            {/* Doc type + number */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:4 }} className="profile-grid">
              <div>
                <label style={{ fontSize:12, fontWeight:600, letterSpacing:"0.5px", color:t.mutedLight,
                  display:"block", marginBottom:7, textTransform:"uppercase" }}>Document Type *</label>
                <select value={kycForm.docType} onChange={e=>setKycForm(p=>({...p,docType:e.target.value}))}
                  className="cc-input"
                  style={{ width:"100%", background:"rgba(15,32,64,0.6)", border:`1px solid ${t.navyBorder}`,
                    borderRadius:10, padding:"13px 14px", color:kycForm.docType?t.white:t.muted,
                    fontSize:15, fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }}>
                  <option value="">Select document…</option>
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID Card</option>
                  <option value="Driver License">Driver's License</option>
                  <option value="Residence Permit">Residence Permit</option>
                </select>
              </div>
              <Input label="Document Number" placeholder="e.g. A12345678" icon="🔢"
                value={kycForm.docNumber} onChange={e=>setKycForm(p=>({...p,docNumber:e.target.value}))}
                style={{ marginBottom:0 }} />
            </div>

            <Input label="Country of Issue *" placeholder="e.g. United States" icon="🌍"
              value={kycForm.country} onChange={e=>{ setKycForm(p=>({...p,country:e.target.value})); setKycErr(""); }}
              style={{ marginTop:16 }} />

            {/* Image uploads */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20, marginTop:4 }} className="profile-grid">
              {[
                { label:"Front of ID Card *", key:"front", img:frontImg, set:setFrontImg },
                { label:"Back of ID Card",    key:"back",  img:backImg,  set:setBackImg  },
              ].map(({ label, key, img, set }) => (
                <div key={key}>
                  <label style={{ fontSize:12, fontWeight:600, letterSpacing:"0.5px", color:t.mutedLight,
                    display:"block", marginBottom:7, textTransform:"uppercase" }}>{label}</label>
                  <div style={{ position:"relative" }}>
                    {/* Preview or placeholder */}
                    {img ? (
                      <div style={{ position:"relative", borderRadius:10, overflow:"hidden",
                        border:`2px solid ${t.cyan}`, cursor:"pointer" }}
                        onClick={()=>set(null)}>
                        <img src={img} alt={label}
                          style={{ width:"100%", height:120, objectFit:"cover", display:"block" }} />
                        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          opacity:0, transition:"opacity .2s" }}
                          onMouseEnter={e=>e.currentTarget.style.opacity=1}
                          onMouseLeave={e=>e.currentTarget.style.opacity=0}>
                          <span style={{ color:"#fff", fontSize:13, fontWeight:600 }}>✕ Remove</span>
                        </div>
                      </div>
                    ) : (
                      <label style={{ display:"flex", flexDirection:"column", alignItems:"center",
                        justifyContent:"center", gap:8, height:120, background:"rgba(15,32,64,0.5)",
                        border:`2px dashed ${t.navyBorder}`, borderRadius:10, cursor:"pointer",
                        transition:"all .2s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=t.cyan}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=t.navyBorder}>
                        <span style={{ fontSize:28 }}>📷</span>
                        <span style={{ fontSize:12, color:t.muted }}>Click to upload · Max 3 MB</span>
                        <span style={{ fontSize:11, color:t.muted }}>JPG, PNG, WEBP</span>
                        <input type="file" accept="image/*" style={{ display:"none" }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try { set(await readFile(file)); setKycErr(""); }
                            catch (err) { setKycErr(err.message); }
                            e.target.value = "";
                          }} />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:t.cyanGlow2, border:`1px solid rgba(0,212,255,0.12)`,
              borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:t.muted, lineHeight:1.7 }}>
              ℹ️ Upload clear photos of both sides of your ID. Our admin team will verify within 24 hours.
              Make sure the document is fully visible and text is readable.
            </div>

            {kycErr && <div style={{ fontSize:13, color:t.red, marginBottom:16 }}>⚠ {kycErr}</div>}

            <BtnPrimary onClick={submitKyc} loading={kycLoading} style={{ width:"auto", padding:"13px 32px" }}>
              Submit KYC Application
            </BtnPrimary>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB: NOTIFICATIONS ───────────────────────────────────────────────────────
function Notifications({ notifs, setNotifs }) {
  const _db    = useDB();
  const markAll = () => { _db?.markAllNotifs ? _db.markAllNotifs() : setNotifs(n => n.map(x => ({ ...x, read:true }))); };
  const markOne = (id) => { _db?.markNotif ? _db.markNotif(id) : setNotifs(n => n.map(x => x.id===id ? {...x,read:true} : x)); };

  const iconMap = { earning:"💰", deposit:"⬇️", withdrawal:"⬆️", referral:"🔗", security:"🔐", system:"⚙️" };
  const colorMap = { earning:t.green, deposit:t.cyan, withdrawal:t.red, referral:t.gold, security:t.red, system:t.muted };

  return (
    <div className="tab-content">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:14, color:t.muted }}>
          <span style={{ color:t.cyan, fontWeight:700 }}>{notifs.filter(n=>!n.read).length}</span> unread notifications
        </div>
        <button onClick={markAll} style={{ fontSize:13, color:t.cyan, background:"transparent",
          border:`1px solid rgba(0,212,255,0.2)`, borderRadius:8, padding:"6px 14px", cursor:"pointer",
          fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}
          onMouseEnter={e=>e.currentTarget.style.background=t.cyanGlow2}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          Mark all read
        </button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {notifs.map(n => (
          <div key={n.id} onClick={() => markOne(n.id)}
            className="card-hover"
            style={{ background: n.read ? t.navyCard : `rgba(0,212,255,0.04)`,
              border:`1px solid ${n.read ? t.navyBorder : "rgba(0,212,255,0.2)"}`,
              borderRadius:14, padding:"18px 20px", cursor:"pointer",
              display:"flex", gap:14, alignItems:"flex-start", transition:"all .2s" }}>
            <div style={{ width:42, height:42, borderRadius:12, flexShrink:0,
              background:`${colorMap[n.type]}15`,
              border:`1px solid ${colorMap[n.type]}30`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
              {iconMap[n.type]}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{n.title}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:12, color:t.muted }}>{n.time}</span>
                  {!n.read && <span style={{ width:8, height:8, borderRadius:"50%",
                    background:t.cyan, animation:"pulse 2s infinite", display:"inline-block" }} />}
                </div>
              </div>
              <div style={{ fontSize:13, color:t.muted, marginTop:4, lineHeight:1.6 }}>{n.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function CrestCapitalDashboard() {
  const router          = useRouter();
  const { data: session, status } = useSession();

  const [tab,         setTab]         = useState("overview");
  const [loading,     setLoading]     = useState(true);

  // ── Live state ───────────────────────────────────────────────────────────────
  const [user,        setUser]        = useState(USER);
  const [investments, setInvestments] = useState([]);
  const [transactions,setTransactions]= useState([]);
  const [referrals,   setReferrals]   = useState([]);
  const [plans,       setPlans]       = useState([]);
  const [notifs,      setNotifs]      = useState([]);

  // ── Redirect if unauthenticated ─────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  // ── Fetch all dashboard data once the session is ready ──────────────────────
  useEffect(() => {
    if (status !== "authenticated") return;
    let alive = true;

    async function load() {
      try {
        const [profileRes, invRes, txRes, notifsRes, plansRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/investments"),
          fetch("/api/user/transactions"),
          fetch("/api/user/notifications"),
          fetch("/api/user/invest"),           // returns available plans
        ]);

        if (!profileRes.ok) { router.push("/auth/login"); return; }

        const [profile, invData, txData, notifData, planData] = await Promise.all([
          profileRes.json(), invRes.json(), txRes.json(),
          notifsRes.json(), plansRes.json(),
        ]);

        if (!alive) return;

        // Normalize profile — API returns firstName/lastName; build display name & avatar initials
        const displayName = profile.name
          || `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
          || USER.name;
        const avatarInitials = displayName.split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase() || USER.avatar;

        setUser({
          ...USER,
          ...profile,
          name:   displayName,
          avatar: avatarInitials,
          activeInvestments: invData.filter(i => i.status === "active").length,
        });

        // Normalize plans — DB uses minAmount/maxAmount and _id; components expect min/max and id
        const normalizePlan = p => ({
          ...p,
          id:  p._id?.toString() || String(p.id || ""),
          min: p.minAmount ?? p.min,
          max: p.maxAmount ?? p.max,
        });

        setInvestments(Array.isArray(invData)   ? invData                    : []);
        setTransactions(Array.isArray(txData)   ? txData                     : []);
        setNotifs(Array.isArray(notifData)       ? notifData                  : []);
        setPlans(Array.isArray(planData)         ? planData.map(normalizePlan) : []);
      } catch (err) {
        console.error("[dashboard load]", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [status, router]);

  // ── Helpers exposed to tabs ─────────────────────────────────────────────────
  const refreshTransactions = useCallback(async () => {
    try {
      const res  = await fetch("/api/user/transactions");
      const data = await res.json();
      if (Array.isArray(data)) setTransactions(data);
    } catch {}
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res  = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.email) setUser(prev => ({ ...prev, ...data }));
    } catch {}
  }, []);

  const markNotif = useCallback(async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await fetch(`/api/user/notifications?id=${id}`, { method: "PUT" }); } catch {}
  }, []);

  const markAllNotifs = useCallback(async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    try { await fetch("/api/user/notifications", { method: "PUT" }); } catch {}
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  // ── Context value shared with every tab ─────────────────────────────────────
  const ctx = {
    user, setUser, investments, setInvestments, transactions, referrals, plans, notifs, setNotifs,
    refreshTransactions, refreshProfile, markNotif, markAllNotifs,
    loading,
    signOut: () => signOut({ callbackUrl: "/auth/login" }),
  };

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (status === "loading" || (loading && status === "authenticated")) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight:"100vh", background:t.navy, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
          <div style={{ width:44, height:44, border:`3px solid ${t.navyBorder}`, borderTopColor:t.cyan, borderRadius:"50%", animation:"spin .8s linear infinite" }} />
          <span style={{ color:t.muted, fontSize:14 }}>Loading your dashboard…</span>
        </div>
      </>
    );
  }

  const renderTab = () => {
    switch(tab) {
      case "overview":      return <Overview setTab={setTab} />;
      case "deposit":       return <Deposit />;
      case "invest":        return <Invest setTab={setTab} />;
      case "realestate":    return <RealEstate setTab={setTab} />;
      case "withdraw":      return <Withdraw />;
      case "transactions":  return <Transactions />;
      case "referrals":     return <Referrals />;
      case "profile":       return <Profile />;
      case "notifications": return <Notifications notifs={notifs} setNotifs={setNotifs} />;
      default:              return <Overview setTab={setTab} />;
    }
  };

  return (
    <DashCtx.Provider value={ctx}>
      <style>{CSS}</style>
      <div className="dash-layout">
        <Sidebar active={tab} setActive={setTab} notifCount={unread} />

        <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", overflow:"hidden" }}>
          <TopBar tab={tab} notifCount={unread} onNotif={() => setTab("notifications")} />

          <main className="dash-main" style={{ flex:1, overflowY:"auto",
            overflowX:"hidden", background:t.navy, minWidth:0 }}>
            {renderTab()}
          </main>
        </div>

        <MobileNav active={tab} setActive={setTab} />
      </div>
    </DashCtx.Provider>
  );
}

// ─── NEXT.JS USAGE ────────────────────────────────────────────────────────────
// FILE: src/app/dashboard/page.jsx
//
// import CrestCapitalDashboard from "@/components/CrestCapitalDashboard"
// export default function DashboardPage() {
//   return <CrestCapitalDashboard />
// }