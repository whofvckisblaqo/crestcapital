// ============================================================
//  CrestCapital — Admin Panel  (Step 4 / Phase 4)
//
//  FILE LOCATION:  src/app/admin/page.js
//
//  TABS INCLUDED:
//    1. Overview      — key metrics, revenue chart, recent activity
//    2. Users         — user table, search, KYC status, suspend/ban
//    3. Transactions  — all txns, approve/reject pending withdrawals
//    4. Plans         — view/create/edit/delete investment plans
//    5. KYC           — review pending KYC submissions
//    6. Reports       — analytics: revenue, growth, deposit/withdrawal
//    7. Settings      — site config, coins, limits, maintenance mode
//
//  All data is mock/simulated — replaced with Supabase in Step 5
// ============================================================

"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const t = {
  navy:       "#050d1a",
  navyMid:    "#08142a",
  navyLight:  "#0f2040",
  navyCard:   "rgba(10,22,40,0.95)",
  navyBorder: "#1a3a6b",
  cyan:       "#00d4ff",
  cyanDim:    "#00a8cc",
  cyanGlow:   "rgba(0,212,255,0.16)",
  cyanGlow2:  "rgba(0,212,255,0.07)",
  green:      "#00e096",
  greenDim:   "rgba(0,224,150,0.12)",
  red:        "#ff4d6d",
  redDim:     "rgba(255,77,109,0.12)",
  gold:       "#f0c040",
  goldDim:    "rgba(240,192,64,0.12)",
  orange:     "#ff9f43",
  orangeDim:  "rgba(255,159,67,0.12)",
  purple:     "#a78bfa",
  purpleDim:  "rgba(167,139,250,0.12)",
  white:      "#eef5ff",
  muted:      "#6a8fb0",
  mutedLight: "#8eaece",
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
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes barRise   { from{transform:scaleY(0)} to{transform:scaleY(1)} }

  /* Base */
  .tab-content  { animation: fadeUp .35s ease both; }
  .cc-input     { -webkit-appearance:none; appearance:none; }
  .cc-input:focus { outline:none; border-color:${t.cyan} !important; box-shadow:0 0 0 3px ${t.cyanGlow2}; }
  .cc-input::placeholder { color:${t.muted}; }
  .card-hover:hover { border-color:${t.cyan} !important; transform:translateY(-2px); transition:all .22s; }
  .row-hover:hover  { background:rgba(0,212,255,0.04) !important; }
  .btn-hover:hover  { opacity:.85; transform:translateY(-1px); }
  .notif-drop       { animation: slideDown .2s ease both; }
  img               { max-width:100%; }

  /* Scrollable table wrapper */
  .tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; width:100%; }
  .tbl-wrap table { min-width:520px; }

  /* ── Desktop (≥900px) ───────────────────────────────── */
  .dash-layout   { display:grid; grid-template-columns:240px 1fr; min-height:100vh; }
  .adm-sidebar   { display:flex; }
  .mobile-nav    { display:none; }
  .dash-main     { padding:24px 28px; padding-bottom:32px; }

  .stat-grid     { display:grid; grid-template-columns:repeat(4,1fr);  gap:16px; }
  .plan-grid     { display:grid; grid-template-columns:repeat(3,1fr);  gap:20px; }
  .report-grid   { display:grid; grid-template-columns:1fr 1fr;        gap:20px; }
  .kyc-grid      { display:grid; grid-template-columns:1fr;            gap:16px; }
  .act-grid      { display:grid; grid-template-columns:1fr 1fr;        gap:20px; }
  .settings-grid { display:grid; grid-template-columns:1fr 1fr;        gap:20px; }
  .coin-grid     { display:grid; grid-template-columns:repeat(3,1fr);  gap:12px; }

  /* ── Tablet (≤1200px) ───────────────────────────────── */
  @media (max-width:1200px) {
    .stat-grid     { grid-template-columns:repeat(2,1fr); }
    .report-grid   { grid-template-columns:1fr; }
    .plan-grid     { grid-template-columns:repeat(2,1fr); }
    .settings-grid { grid-template-columns:1fr; }
    .coin-grid     { grid-template-columns:repeat(2,1fr); }
    .act-grid      { grid-template-columns:1fr; }
  }

  /* ── Mobile (≤900px) ────────────────────────────────── */
  @media (max-width:900px) {
    .dash-layout   { grid-template-columns:1fr; }
    .adm-sidebar   { display:none; }
    .mobile-nav    { display:flex; }
    .dash-main     { padding:16px; padding-bottom:80px; }
    .topbar-search { display:none !important; }
    .stat-grid     { grid-template-columns:repeat(2,1fr); gap:10px; }
    .plan-grid     { grid-template-columns:repeat(2,1fr); }
  }

  /* ── Small mobile (≤640px) ──────────────────────────── */
  @media (max-width:640px) {
    .stat-grid     { grid-template-columns:1fr 1fr; gap:10px; }
    .plan-grid     { grid-template-columns:1fr; }
    .tx-cols       { display:none; }
    .user-cols     { display:none; }
    .dash-main     { padding:12px; padding-bottom:80px; }
    .coin-grid     { grid-template-columns:1fr 1fr; }
    input, select, textarea { font-size:16px !important; }
  }

  /* ── Very small (≤400px) ────────────────────────────── */
  @media (max-width:400px) {
    .stat-grid { grid-template-columns:1fr; }
  }

  /* ── Mobile nav ─────────────────────────────────────── */
  .mobile-nav { position:fixed; bottom:0; left:0; right:0; z-index:100;
    background:rgba(8,20,42,0.97); backdrop-filter:blur(20px);
    border-top:1px solid ${t.navyBorder};
    padding:8px 0 max(12px,env(safe-area-inset-bottom));
    justify-content:space-around; }
`;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INIT_USERS = [
  { id:"U001", name:"John Smith",      email:"john.smith@example.com",    balance:12480.50, deposited:15000, withdrawn:5760,  joined:"2024-01-15", kyc:"verified",   status:"active",    plan:"Growth",   country:"US", referrals:3 },
  { id:"U002", name:"Emily Carter",    email:"emily.carter@gmail.com",     balance:4200.00,  deposited:5000,  withdrawn:800,   joined:"2024-02-20", kyc:"verified",   status:"active",    plan:"Starter",  country:"UK", referrals:1 },
  { id:"U003", name:"Raj Patel",       email:"raj.patel@outlook.com",      balance:28700.00, deposited:30000, withdrawn:1300,  joined:"2024-01-08", kyc:"verified",   status:"active",    plan:"Premium",  country:"IN", referrals:7 },
  { id:"U004", name:"Sofia Müller",    email:"sofia.muller@email.de",      balance:6100.00,  deposited:8000,  withdrawn:1900,  joined:"2024-03-05", kyc:"pending",    status:"active",    plan:"Growth",   country:"DE", referrals:2 },
  { id:"U005", name:"Liam O'Brien",    email:"liam.obrien@icloud.com",     balance:750.00,   deposited:1000,  withdrawn:250,   joined:"2024-04-10", kyc:"unverified", status:"active",    plan:"Starter",  country:"IE", referrals:0 },
  { id:"U006", name:"Aisha Nwosu",     email:"aisha.nwosu@yahoo.com",      balance:9500.00,  deposited:10000, withdrawn:500,   joined:"2024-02-14", kyc:"verified",   status:"active",    plan:"Advanced", country:"NG", referrals:4 },
  { id:"U007", name:"Chen Wei",        email:"chen.wei@protonmail.com",    balance:0,        deposited:2000,  withdrawn:2000,  joined:"2024-03-22", kyc:"verified",   status:"suspended", plan:"-",        country:"CN", referrals:0 },
  { id:"U008", name:"Maria Garcia",    email:"maria.garcia@hotmail.com",   balance:3300.00,  deposited:4000,  withdrawn:700,   joined:"2024-04-02", kyc:"pending",    status:"active",    plan:"Growth",   country:"MX", referrals:1 },
  { id:"U009", name:"Ahmed Hassan",    email:"ahmed.hassan@gmail.com",     balance:18200.00, deposited:20000, withdrawn:1800,  joined:"2024-01-25", kyc:"verified",   status:"active",    plan:"Advanced", country:"EG", referrals:5 },
  { id:"U010", name:"Yuki Tanaka",     email:"yuki.tanaka@gmail.com",      balance:500.00,   deposited:500,   withdrawn:0,     joined:"2024-05-01", kyc:"unverified", status:"active",    plan:"Starter",  country:"JP", referrals:0 },
  { id:"U011", name:"Noah Williams",   email:"noah.williams@email.com",    balance:7800.00,  deposited:9000,  withdrawn:1200,  joined:"2024-02-28", kyc:"verified",   status:"active",    plan:"Growth",   country:"US", referrals:2 },
  { id:"U012", name:"Fatima Al-Sayed", email:"fatima.alsayed@email.com",   balance:22000.00, deposited:25000, withdrawn:3000,  joined:"2024-01-30", kyc:"verified",   status:"active",    plan:"Premium",  country:"AE", referrals:6 },
];

const INIT_TRANSACTIONS = [
  { id:"TXN001", userId:"U001", user:"John Smith",      type:"deposit",    amount:5000,   coin:"USDT", plan:"Advanced", date:"2025-04-12", status:"completed", hash:"0x4f2a...9b1c" },
  { id:"TXN002", userId:"U001", user:"John Smith",      type:"withdrawal", amount:2000,   coin:"BTC",  plan:"-",        date:"2025-04-10", status:"completed", hash:"0x7c3e...2d4f" },
  { id:"TXN003", userId:"U003", user:"Raj Patel",       type:"deposit",    amount:30000,  coin:"USDT", plan:"Premium",  date:"2025-04-08", status:"completed", hash:"0x9a1c...4e2f" },
  { id:"TXN004", userId:"U006", user:"Aisha Nwosu",     type:"deposit",    amount:10000,  coin:"ETH",  plan:"Advanced", date:"2025-04-20", status:"completed", hash:"0x3b7d...1a9c" },
  { id:"TXN005", userId:"U002", user:"Emily Carter",    type:"withdrawal", amount:800,    coin:"BTC",  plan:"-",        date:"2025-04-21", status:"pending",   hash:"-" },
  { id:"TXN006", userId:"U009", user:"Ahmed Hassan",    type:"deposit",    amount:20000,  coin:"USDT", plan:"Advanced", date:"2025-04-23", status:"completed", hash:"0x8d1f...3a7b" },
  { id:"TXN007", userId:"U004", user:"Sofia Müller",    type:"withdrawal", amount:1900,   coin:"ETH",  plan:"-",        date:"2025-04-15", status:"pending",   hash:"-" },
  { id:"TXN008", userId:"U001", user:"John Smith",      type:"earning",    amount:700,    coin:"USDT", plan:"Advanced", date:"2025-04-25", status:"completed", hash:"-" },
  { id:"TXN009", userId:"U003", user:"Raj Patel",       type:"earning",    amount:4200,   coin:"USDT", plan:"Premium",  date:"2025-04-24", status:"completed", hash:"-" },
  { id:"TXN010", userId:"U008", user:"Maria Garcia",    type:"deposit",    amount:4000,   coin:"BNB",  plan:"Growth",   date:"2025-04-22", status:"completed", hash:"0x2c5e...7f1a" },
  { id:"TXN011", userId:"U011", user:"Noah Williams",   type:"withdrawal", amount:1200,   coin:"USDT", plan:"-",        date:"2025-04-19", status:"pending",   hash:"-" },
  { id:"TXN012", userId:"U012", user:"Fatima Al-Sayed", type:"deposit",    amount:25000,  coin:"BTC",  plan:"Premium",  date:"2025-04-17", status:"completed", hash:"0x6d3b...2c8e" },
  { id:"TXN013", userId:"U005", user:"Liam O'Brien",    type:"deposit",    amount:1000,   coin:"USDT", plan:"Starter",  date:"2025-04-16", status:"completed", hash:"0x1f4a...8d2b" },
  { id:"TXN014", userId:"U010", user:"Yuki Tanaka",     type:"deposit",    amount:500,    coin:"ETH",  plan:"Starter",  date:"2025-04-14", status:"completed", hash:"0x5a8c...3e1f" },
  { id:"TXN015", userId:"U007", user:"Chen Wei",        type:"withdrawal", amount:2000,   coin:"BTC",  plan:"-",        date:"2025-04-13", status:"rejected",  hash:"-" },
];

const INIT_PLANS = [
  { id:1, name:"Starter",  rate:0.9,  duration:10, min:100,   max:999,    color:t.cyanDim, active:true,  investments:24, totalInvested:8400   },
  { id:2, name:"Growth",   rate:1.4,  duration:15, min:1000,  max:4999,   color:t.cyan,    active:true,  investments:41, totalInvested:112000 },
  { id:3, name:"Advanced", rate:2.0,  duration:21, min:5000,  max:19999,  color:t.green,   active:true,  investments:18, totalInvested:198000 },
  { id:4, name:"Premium",  rate:3.5,  duration:30, min:20000, max:999999, color:t.gold,    active:true,  investments:7,  totalInvested:437000 },
];

const INIT_KYC = [
  { id:"KYC001", userId:"U004", name:"Sofia Müller",   email:"sofia.muller@email.de",   country:"Germany", docType:"Passport",       submitted:"2025-04-20", status:"pending", notes:"" },
  { id:"KYC002", userId:"U008", name:"Maria Garcia",   email:"maria.garcia@hotmail.com",country:"Mexico",  docType:"National ID",    submitted:"2025-04-22", status:"pending", notes:"" },
  { id:"KYC003", userId:"U005", name:"Liam O'Brien",   email:"liam.obrien@icloud.com",  country:"Ireland", docType:"Driver License", submitted:"2025-04-18", status:"pending", notes:"" },
  { id:"KYC004", userId:"U002", name:"Emily Carter",   email:"emily.carter@gmail.com",  country:"UK",      docType:"Passport",       submitted:"2025-03-10", status:"approved",notes:"Documents clear" },
  { id:"KYC005", userId:"U006", name:"Aisha Nwosu",    email:"aisha.nwosu@yahoo.com",   country:"Nigeria", docType:"National ID",    submitted:"2025-03-05", status:"approved",notes:"Verified" },
];

const REVENUE_DATA = [
  { month:"Nov", revenue:28400, deposits:42000, withdrawals:13600 },
  { month:"Dec", revenue:34100, deposits:51000, withdrawals:16900 },
  { month:"Jan", revenue:41200, deposits:62000, withdrawals:20800 },
  { month:"Feb", revenue:38700, deposits:58000, withdrawals:19300 },
  { month:"Mar", revenue:52300, deposits:78000, withdrawals:25700 },
  { month:"Apr", revenue:61800, deposits:93000, withdrawals:31200 },
];

const GROWTH_DATA = [
  { month:"Nov", users:68 },
  { month:"Dec", users:84 },
  { month:"Jan", users:103 },
  { month:"Feb", users:118 },
  { month:"Mar", users:139 },
  { month:"Apr", users:156 },
];

const INIT_NOTIFS = [
  { id:1, msg:"New withdrawal request: Emily Carter — $800 BTC",  time:"2m ago",  read:false, type:"warning" },
  { id:2, msg:"KYC submission from Sofia Müller",                  time:"18m ago", read:false, type:"info"    },
  { id:3, msg:"New withdrawal request: Noah Williams — $1,200",   time:"1h ago",  read:false, type:"warning" },
  { id:4, msg:"Plan 'Premium' crossed $500K total invested",       time:"3h ago",  read:true,  type:"success" },
  { id:5, msg:"New user registered: Yuki Tanaka",                  time:"5h ago",  read:true,  type:"info"    },
];

const INIT_SETTINGS = {
  siteName: "CrestCapital",
  tagline: "Intelligent Yield on Your Terms",
  maintenance: false,
  minDeposit: 100,
  maxDeposit: 1000000,
  minWithdraw: 50,
  maxWithdraw: 500000,
  referralRate: 8,
  emailNotifs: true,
  twoFARequired: false,
  withdrawalApproval: true,
  coins: [
    { symbol:"BTC",  name:"Bitcoin",  active:true,  wallet:"bc1q5y2u...9m3x" },
    { symbol:"ETH",  name:"Ethereum", active:true,  wallet:"0x1a2b3c...4d5e" },
    { symbol:"USDT", name:"Tether",   active:true,  wallet:"TQnkjm...8Lzx"  },
    { symbol:"BNB",  name:"BNB",      active:true,  wallet:"bnb1ab2c...3d4e" },
    { symbol:"SOL",  name:"Solana",   active:false, wallet:""                },
    { symbol:"XRP",  name:"Ripple",   active:false, wallet:""                },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt  = (n) => new Intl.NumberFormat("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const fmtK = (n) => n>=1000000 ? `$${(n/1000000).toFixed(2)}M` : n>=1000 ? `$${(n/1000).toFixed(1)}K` : `$${n}`;
const initials = (name) => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const avatarColor = (name) => {
  const colors = [t.cyan,t.green,t.gold,t.purple,t.orange,"#f472b6","#60a5fa","#34d399"];
  return colors[name.charCodeAt(0) % colors.length];
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ico = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  users:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  tx:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M2 12h20M12 2l4 4-4 4M12 22l4-4-4-4"/></svg>,
  plans:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  kyc:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  reports:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  settings:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  check:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:15,height:15}}><polyline points="20 6 9 17 4 12"/></svg>,
  x:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:15,height:15}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  edit:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  eye:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  plus:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:15,height:15}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  download:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  search:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  logout:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  toggle:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3" fill="currentColor"/></svg>,
  ban:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  wallet:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 11h2v2h-2z"/><path d="M20 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2"/></svg>,
  trending:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Badge({ status }) {
  const cfg = {
    completed: { bg:t.greenDim,  color:t.green,  label:"Completed"  },
    active:    { bg:t.greenDim,  color:t.green,  label:"Active"     },
    verified:  { bg:t.greenDim,  color:t.green,  label:"Verified"   },
    approved:  { bg:t.greenDim,  color:t.green,  label:"Approved"   },
    pending:   { bg:t.goldDim,   color:t.gold,   label:"Pending"    },
    rejected:  { bg:t.redDim,    color:t.red,    label:"Rejected"   },
    suspended: { bg:t.redDim,    color:t.red,    label:"Suspended"  },
    unverified:{ bg:t.orangeDim, color:t.orange, label:"Unverified" },
    inactive:  { bg:"rgba(106,143,176,0.12)", color:t.muted, label:"Inactive" },
  }[status] || { bg:"rgba(106,143,176,0.12)", color:t.muted, label:status };
  return (
    <span style={{ background:cfg.bg, color:cfg.color, fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20, whiteSpace:"nowrap" }}>
      {cfg.label}
    </span>
  );
}

function Modal({ onClose, title, children, width=560 }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    // Prevent background scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:2000,
      display:"flex", alignItems:"flex-start", justifyContent:"center",
      padding:"24px 16px", animation:"fadeIn .18s ease",
      overflowY:"auto", overflowX:"hidden", WebkitOverflowScrolling:"touch" }}
      onClick={onClose}>
      <div style={{ background:t.navyMid, border:`1px solid ${t.navyBorder}`, borderRadius:16,
        width:"100%", maxWidth:width,
        padding:"28px",
        position:"relative", margin:"auto", flexShrink:0 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          marginBottom:20, gap:12 }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(15px,4vw,18px)",
            fontWeight:700, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {title}
          </span>
          <button onClick={onClose} style={{ background:t.navyLight, border:`1px solid ${t.navyBorder}`,
            color:t.muted, cursor:"pointer", padding:"6px 8px", borderRadius:8,
            display:"flex", lineHeight:1, flexShrink:0 }}>{Ico.x}</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type="text", placeholder="", min, max, step, disabled }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ fontSize:12, color:t.muted, display:"block", marginBottom:6, fontWeight:500 }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max} step={step} disabled={disabled}
        className="cc-input"
        style={{ width:"100%", background:disabled?`rgba(15,32,64,0.5)`:t.navyLight, border:`1px solid ${t.navyBorder}`, borderRadius:10, padding:"10px 14px", color:t.white, fontSize:14, transition:"all .2s", opacity:disabled?.6:1 }}
      />
    </div>
  );
}

function Btn({ children, onClick, color=t.cyan, textColor=t.navy, size="sm", outline=false, disabled=false, style={} }) {
  const pad = size==="sm" ? "7px 14px" : size==="xs" ? "5px 10px" : "11px 22px";
  const fs  = size==="xs" ? 12 : 13;
  return (
    <button onClick={onClick} disabled={disabled}
      className="btn-hover"
      style={{ background:outline?"transparent":color, color:outline?color:textColor, border:`1.5px solid ${color}`, borderRadius:8, padding:pad, fontSize:fs, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, transition:"all .2s", opacity:disabled?.5:1, ...style }}>
      {children}
    </button>
  );
}

function StatCard({ label, value, sub, icon, color=t.cyan }) {
  return (
    <div className="card-hover" style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"20px 22px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:12, color:t.muted, fontWeight:500, marginBottom:8 }}>{label}</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:700, color:t.white }}>{value}</div>
          {sub && <div style={{ fontSize:12, color:t.muted, marginTop:4 }}>{sub}</div>}
        </div>
        <div style={{ width:42, height:42, borderRadius:11, background:`rgba(${color===t.cyan?"0,212,255":color===t.green?"0,224,150":color===t.gold?"240,192,64":"255,77,109"},0.13)`, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
      <div onClick={onChange} style={{ width:44, height:24, borderRadius:12, background:value?t.cyan:"rgba(106,143,176,0.2)", position:"relative", transition:"all .25s", cursor:"pointer", flexShrink:0 }}>
        <div style={{ position:"absolute", top:3, left:value?22:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"all .25s" }} />
      </div>
      {label && <span style={{ fontSize:13, color:t.mutedLight }}>{label}</span>}
    </label>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:"overview",     label:"Overview",     icon:Ico.dashboard },
  { id:"users",        label:"Users",        icon:Ico.users     },
  { id:"transactions", label:"Transactions", icon:Ico.tx        },
  { id:"plans",        label:"Plans",        icon:Ico.plans     },
  { id:"realestate",   label:"Real Estate",  icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id:"kyc",          label:"KYC Review",   icon:Ico.kyc       },
  { id:"reports",      label:"Reports",      icon:Ico.reports   },
  { id:"settings",     label:"Settings",     icon:Ico.settings  },
];

function Sidebar({ active, onNav, adminName, adminEmail, onSignOut }) {
  const nameInitials = adminName ? adminName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : "SA";
  return (
    <aside className="adm-sidebar" style={{ flexDirection:"column", background:t.navyMid, borderRight:`1px solid ${t.navyBorder}`, width:240, position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
      <div style={{ padding:"22px 20px 18px", borderBottom:`1px solid ${t.navyBorder}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:t.navy }}>CC</span>
          </div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:t.white, lineHeight:1.2 }}>CrestCapital</div>
            <div style={{ fontSize:10, color:t.cyan, fontWeight:600, letterSpacing:.5 }}>ADMIN PANEL</div>
          </div>
        </div>
      </div>
      <nav style={{ padding:"14px 10px", flex:1 }}>
        {NAV.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 13px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:3, textAlign:"left", background:active===item.id?t.cyanGlow:"transparent", color:active===item.id?t.cyan:t.mutedLight, fontWeight:active===item.id?600:400, fontSize:14, transition:"all .18s" }}>
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding:"14px 18px", borderTop:`1px solid ${t.navyBorder}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${t.purple},#7c3aed)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>{nameInitials}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{adminName || "Super Admin"}</div>
            <div style={{ fontSize:11, color:t.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{adminEmail || "admin@crestcapital.com"}</div>
          </div>
        </div>
        <button onClick={onSignOut}
          style={{ display:"flex", alignItems:"center", gap:8, marginTop:12, background:"none", border:"none", color:t.muted, cursor:"pointer", fontSize:13, padding:"6px 2px", width:"100%", transition:"color .2s" }}
          onMouseOver={e=>e.currentTarget.style.color=t.red} onMouseOut={e=>e.currentTarget.style.color=t.muted}>
          {Ico.logout} Sign Out
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ active, onNav }) {
  return (
    <div className="mobile-nav" style={{ position:"fixed", bottom:0, left:0, right:0, background:t.navyMid, borderTop:`1px solid ${t.navyBorder}`, zIndex:100, justifyContent:"space-around", padding:"8px 2px 14px" }}>
      {NAV.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)}
          style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, border:"none", background:"none", cursor:"pointer", padding:"4px 6px", color:active===item.id?t.cyan:t.muted, fontSize:9, fontWeight:active===item.id?600:400, minWidth:0 }}>
          {item.icon}
          <span style={{ fontSize:8, whiteSpace:"nowrap" }}>{item.label.replace(" ","")}</span>
        </button>
      ))}
    </div>
  );
}

function TopBar({ title, notifCount, showNotifs, setShowNotifs, notifs, onMarkRead, searchQuery, setSearchQuery }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid ${t.navyBorder}`, background:t.navyMid, position:"sticky", top:0, zIndex:50, gap:12, minWidth:0 }}>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(14px,2vw,19px)", fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", minWidth:0, flex:1 }}>{title}</h1>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div className="topbar-search" style={{ position:"relative", display:"flex", alignItems:"center" }}>
          <div style={{ position:"absolute", left:10, color:t.muted, pointerEvents:"none" }}>{Ico.search}</div>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search…"
            className="cc-input"
            style={{ paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8, background:t.navyLight, border:`1px solid ${t.navyBorder}`, borderRadius:10, color:t.white, fontSize:13, width:190 }}
          />
        </div>
        <div style={{ position:"relative" }}>
          <button onClick={() => setShowNotifs(!showNotifs)}
            style={{ width:38, height:38, borderRadius:10, background:t.navyLight, border:`1px solid ${t.navyBorder}`, color:t.mutedLight, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            {Ico.bell}
            {notifCount > 0 && <span style={{ position:"absolute", top:-4, right:-4, width:17, height:17, borderRadius:"50%", background:t.red, color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{notifCount}</span>}
          </button>
          {showNotifs && (
            <div className="notif-drop" style={{ position:"absolute", right:0, top:46, width:320, background:t.navyMid, border:`1px solid ${t.navyBorder}`, borderRadius:14, overflow:"hidden", zIndex:200, boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
              <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${t.navyBorder}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:600, fontSize:14 }}>Notifications</span>
                <button onClick={onMarkRead} style={{ background:"none", border:"none", color:t.cyan, fontSize:12, cursor:"pointer" }}>Mark all read</button>
              </div>
              {notifs.map(n => (
                <div key={n.id} style={{ padding:"12px 16px", borderBottom:`1px solid rgba(26,58,107,0.4)`, background:n.read?"transparent":"rgba(0,212,255,0.03)", display:"flex", gap:10, alignItems:"flex-start" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:n.read?"transparent":n.type==="warning"?t.gold:n.type==="success"?t.green:t.cyan, marginTop:5, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:13, color:n.read?t.muted:t.white, lineHeight:1.4 }}>{n.msg}</div>
                    <div style={{ fontSize:11, color:t.muted, marginTop:3 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ width:36, height:36, borderRadius:9, background:`linear-gradient(135deg,${t.purple},#7c3aed)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, cursor:"pointer" }}>SA</div>
      </div>
    </div>
  );
}

// ─── TAB 1: OVERVIEW ─────────────────────────────────────────────────────────
function OverviewTab({ users, transactions }) {
  const totalRev  = transactions.filter(x=>x.type==="earning").reduce((s,x)=>s+x.amount,0);
  const pendingW  = transactions.filter(x=>x.status==="pending").length;
  const totalDep  = transactions.filter(x=>x.type==="deposit"&&x.status==="completed").reduce((s,x)=>s+x.amount,0);
  const recentTx  = [...transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  const recentU   = [...users].sort((a,b)=>b.joined.localeCompare(a.joined)).slice(0,5);
  const activeInv = users.filter(u=>u.plan!=="-"&&u.status==="active").length;

  const maxRev = Math.max(...REVENUE_DATA.map(d=>d.deposits));

  return (
    <div className="tab-content">
      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom:24 }}>
        <StatCard label="Total Users"          value={users.length}        sub={`${users.filter(u=>u.status==="active").length} active`}  icon={Ico.users}   color={t.cyan}  />
        <StatCard label="Total Deposits"       value={fmtK(totalDep)}      sub="all time"                                                  icon={Ico.wallet}  color={t.green} />
        <StatCard label="Active Investments"   value={activeInv}           sub="open positions"                                            icon={Ico.plans}   color={t.gold}  />
        <StatCard label="Pending Approvals"    value={pendingW}            sub="deposits + withdrawals"                                    icon={Ico.tx}      color={pendingW>0?t.red:t.muted} />
      </div>

      <div className="act-grid" style={{ marginBottom:24 }}>
        {/* Revenue Chart */}
        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"22px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>Monthly Deposits</span>
            <span style={{ fontSize:12, color:t.muted }}>Last 6 months</span>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:130 }}>
            {REVENUE_DATA.map((d,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ width:"100%", borderRadius:"5px 5px 0 0", background:`linear-gradient(to top,${t.cyan},rgba(0,212,255,0.4))`, height:`${Math.round((d.deposits/maxRev)*110)}px`, transition:"height .6s ease", minHeight:4 }} />
                <span style={{ fontSize:10, color:t.muted }}>{d.month}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:20, marginTop:16, paddingTop:16, borderTop:`1px solid ${t.navyBorder}` }}>
            {[["Total Deposits", fmtK(totalDep), t.cyan], ["Total Withdrawn", fmtK(transactions.filter(x=>x.type==="withdrawal"&&x.status==="completed").reduce((s,x)=>s+x.amount,0)), t.red], ["Net Earnings", fmtK(totalRev), t.green]].map(([l,v,c])=>(
              <div key={l}>
                <div style={{ fontSize:11, color:t.muted }}>{l}</div>
                <div style={{ fontSize:15, fontWeight:700, color:c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Signups */}
        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"22px 24px" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:16 }}>Recent Signups</div>
          {recentU.map(u => (
            <div key={u.id} className="row-hover" style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:`1px solid rgba(26,58,107,0.4)` }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:`${avatarColor(u.name)}22`, color:avatarColor(u.name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>{initials(u.name)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:t.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</div>
                <div style={{ fontSize:11, color:t.muted }}>{u.joined}</div>
              </div>
              <Badge status={u.kyc} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"22px 24px" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:16 }}>Recent Transactions</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${t.navyBorder}` }}>
                {["ID","User","Type","Amount","Coin","Date","Status"].map(h=>(
                  <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:11, color:t.muted, fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTx.map(tx => (
                <tr key={tx.id} className="row-hover" style={{ borderBottom:`1px solid rgba(26,58,107,0.3)` }}>
                  <td style={{ padding:"10px 12px", fontSize:12, color:t.cyan }}>{tx.id}</td>
                  <td style={{ padding:"10px 12px", fontSize:13 }}>{tx.user}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ fontSize:12, fontWeight:600, color:tx.type==="deposit"?t.green:tx.type==="withdrawal"?t.red:tx.type==="earning"?t.cyan:t.gold, textTransform:"capitalize" }}>{tx.type}</span>
                  </td>
                  <td style={{ padding:"10px 12px", fontSize:13, fontWeight:600, color:tx.type==="withdrawal"?t.red:t.white }}>${fmt(tx.amount)}</td>
                  <td className="tx-cols" style={{ padding:"10px 12px", fontSize:12, color:t.muted }}>{tx.coin}</td>
                  <td className="tx-cols" style={{ padding:"10px 12px", fontSize:12, color:t.muted }}>{tx.date}</td>
                  <td style={{ padding:"10px 12px" }}><Badge status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── CREDIT BALANCE MODAL ────────────────────────────────────────────────────
function CreditBalanceModal({ user, onClose, onCredit }) {
  const [amount, setAmount] = useState("");
  const [coin,   setCoin]   = useState("USD");
  const [note,   setNote]   = useState("");
  const [loading,setLoading]= useState(false);
  const [err,    setErr]    = useState("");

  const submit = async () => {
    if (!amount || Number(amount) <= 0) { setErr("Enter a valid amount."); return; }
    setLoading(true); setErr("");
    try {
      const res  = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action:"creditBalance", amount: Number(amount), coin, note: note || "Admin credit" }),
      });
      const data = await res.json();
      if (res.ok) { onCredit(user.id, Number(amount)); onClose(); }
      else        { setErr(data.error || "Failed to credit balance."); }
    } catch { setErr("Something went wrong."); }
    finally  { setLoading(false); }
  };

  const COINS = ["USD","BTC","ETH","USDT","BNB","SOL","XRP"];

  return (
    <Modal onClose={onClose} title={`Credit Balance — ${user.name}`} width={440}>
      <div style={{ background:t.navyLight, borderRadius:12, padding:"14px 16px", marginBottom:20,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:13, color:t.muted }}>Current Balance</span>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:t.cyan }}>${fmt(user.balance)}</span>
      </div>
      <FormInput label="Amount to Credit ($)" value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="e.g. 500" min="1" />
      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:12, color:t.muted, display:"block", marginBottom:6, fontWeight:500 }}>Coin / Currency</label>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {COINS.map(c => (
            <button key={c} onClick={() => setCoin(c)}
              style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${coin===c?t.cyan:t.navyBorder}`,
                background:coin===c?t.cyanGlow:"transparent", color:coin===c?t.cyan:t.muted,
                cursor:"pointer", fontSize:12, fontFamily:"'DM Sans',sans-serif", transition:"all .18s" }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <FormInput label="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Manual deposit adjustment" />
      {err && <div style={{ fontSize:13, color:t.red, marginBottom:12 }}>⚠ {err}</div>}
      {amount && Number(amount) > 0 && (
        <div style={{ background:t.greenDim, border:`1px solid rgba(0,224,150,0.2)`, borderRadius:10,
          padding:"12px 16px", marginBottom:16, fontSize:13, color:t.green }}>
          New balance will be: <strong>${fmt(user.balance + Number(amount))}</strong>
        </div>
      )}
      <div style={{ display:"flex", gap:10 }}>
        <Btn onClick={submit} color={t.green} textColor="#fff" disabled={loading}>
          {loading ? "Crediting…" : <>{Ico.check} Credit ${amount || "0"}</>}
        </Btn>
        <Btn onClick={onClose} color={t.navyLight} textColor={t.white} outline>Cancel</Btn>
      </div>
    </Modal>
  );
}

// ─── TAB 2: USERS ────────────────────────────────────────────────────────────
function UserDetailModal({ user, onClose, onToggleSuspend, onVerifyKYC, onCredit, onInvestmentAction }) {
  const [investments, setInvestments] = useState([]);
  const [invLoading,  setInvLoading]  = useState(true);
  const [invError,    setInvError]    = useState(null);
  const [actionBusy,  setActionBusy]  = useState(null); // investmentId being acted on

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/users?investments=${user.id}`)
      .then(r => r.json())
      .then(d => { if (alive) { setInvestments(Array.isArray(d) ? d : []); setInvLoading(false); } })
      .catch(() => { if (alive) { setInvError("Failed to load investments."); setInvLoading(false); } });
    return () => { alive = false; };
  }, [user.id]);

  const handleInvAction = async (inv, action) => {
    setActionBusy(inv.id);
    const ok = await onInvestmentAction(user.id, inv.id, action);
    if (ok) {
      setInvestments(prev => prev
        .map(i => i.id === inv.id
          ? action === "cancelInvestment" ? null
          : { ...i, status: action === "freezeInvestment" ? "frozen" : "active" }
          : i
        )
        .filter(Boolean)
      );
    }
    setActionBusy(null);
  };

  const daysLeft = (endDate) => {
    const d = Math.ceil((new Date(endDate) - new Date()) / 86400000);
    return Math.max(d, 0);
  };

  return (
    <Modal onClose={onClose} title="User Details" width={680}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, padding:"16px 0", borderBottom:`1px solid ${t.navyBorder}` }}>
        <div style={{ width:56, height:56, borderRadius:"50%", background:`${avatarColor(user.name)}22`, color:avatarColor(user.name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:700, flexShrink:0 }}>{initials(user.name)}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:18, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{user.name}</div>
          <div style={{ fontSize:13, color:t.muted }}>{user.email}</div>
          <div style={{ display:"flex", gap:8, marginTop:6 }}><Badge status={user.status} /><Badge status={user.kyc} /></div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:22, fontWeight:700, color:t.cyan, fontFamily:"'Syne',sans-serif" }}>${fmt(user.balance)}</div>
          <div style={{ fontSize:11, color:t.muted }}>Balance</div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
        {[["User ID", user.id], ["Country", user.country], ["Joined", user.joined], ["Active Investments", user.activeInvests ?? "—"], ["Total Deposited", `$${fmt(user.deposited)}`], ["Total Withdrawn", `$${fmt(user.withdrawn)}`], ["Referrals", user.referrals], ["KYC Status", user.kyc]].map(([k,v])=>(
          <div key={k} style={{ background:t.navyLight, borderRadius:10, padding:"10px 14px" }}>
            <div style={{ fontSize:11, color:t.muted, marginBottom:3 }}>{k}</div>
            <div style={{ fontSize:13, fontWeight:600, color:t.white, textTransform:k==="KYC Status"?"capitalize":"none" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Investment Plans */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:t.white, marginBottom:12, fontFamily:"'Syne',sans-serif" }}>Investment Plans</div>
        {invLoading && <div style={{ color:t.muted, fontSize:13, padding:"12px 0" }}>Loading…</div>}
        {invError  && <div style={{ color:t.red,  fontSize:13, padding:"12px 0" }}>{invError}</div>}
        {!invLoading && !invError && investments.length === 0 && (
          <div style={{ color:t.muted, fontSize:13, padding:"12px 16px", background:t.navyLight, borderRadius:10 }}>No active investment plans.</div>
        )}
        {!invLoading && investments.map(inv => (
          <div key={inv.id} style={{ background:t.navyLight, border:`1px solid ${inv.status==="frozen"?t.orange:t.navyBorder}`, borderRadius:10, padding:"12px 14px", marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:t.white }}>{inv.planName}</span>
                  <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20,
                    background: inv.status==="frozen" ? t.orangeDim : t.cyanGlow2,
                    color:      inv.status==="frozen" ? t.orange    : t.cyan }}>
                    {inv.status}
                  </span>
                </div>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                  <span style={{ fontSize:12, color:t.muted }}>Amount: <strong style={{ color:t.cyan }}>${fmt(inv.amount)}</strong></span>
                  <span style={{ fontSize:12, color:t.muted }}>Rate: <strong style={{ color:t.green }}>{inv.rate}%/day</strong></span>
                  <span style={{ fontSize:12, color:t.muted }}>Earned: <strong style={{ color:t.white }}>${fmt(inv.earningsSoFar)}</strong></span>
                  <span style={{ fontSize:12, color:t.muted }}>Days left: <strong style={{ color:t.white }}>{daysLeft(inv.endDate)}</strong></span>
                </div>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                {inv.status === "active" && (
                  <button
                    disabled={actionBusy === inv.id}
                    onClick={() => handleInvAction(inv, "freezeInvestment")}
                    style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${t.orange}44`, background:`${t.orange}11`, color:t.orange, cursor:"pointer", fontSize:12, fontWeight:600, opacity: actionBusy===inv.id ? 0.5 : 1 }}>
                    ❄ Freeze
                  </button>
                )}
                {inv.status === "frozen" && (
                  <button
                    disabled={actionBusy === inv.id}
                    onClick={() => handleInvAction(inv, "unfreezeInvestment")}
                    style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${t.green}44`, background:`${t.green}11`, color:t.green, cursor:"pointer", fontSize:12, fontWeight:600, opacity: actionBusy===inv.id ? 0.5 : 1 }}>
                    ▶ Unfreeze
                  </button>
                )}
                <button
                  disabled={actionBusy === inv.id}
                  onClick={() => { if (window.confirm(`Cancel ${inv.planName} plan and refund $${fmt(inv.amount)} to user?`)) handleInvAction(inv, "cancelInvestment"); }}
                  style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${t.red}44`, background:`${t.red}11`, color:t.red, cursor:"pointer", fontSize:12, fontWeight:600, opacity: actionBusy===inv.id ? 0.5 : 1 }}>
                  ✕ Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <Btn onClick={() => onCredit(user)} color={t.green} textColor="#fff">{Ico.wallet} Credit Balance</Btn>
        <Btn onClick={() => onToggleSuspend(user.id)} color={user.status==="suspended"?t.green:t.red} textColor="#fff" outline={user.status!=="suspended"}>
          {user.status==="suspended" ? <>{Ico.check} Reinstate</> : <>{Ico.ban} Suspend</>}
        </Btn>
        {user.kyc==="pending" && <Btn onClick={() => { onVerifyKYC(user.id); onClose(); }} color={t.gold} textColor={t.navy}>{Ico.check} Approve KYC</Btn>}
        <Btn onClick={onClose} color={t.navyLight} textColor={t.white} outline>{Ico.x} Close</Btn>
      </div>
    </Modal>
  );
}

function UsersTab({ users, onToggleSuspend, onVerifyKYC, onCreditBalance, onInvestmentAction, searchQuery }) {
  const [filter,      setFilter]      = useState("all");
  const [selected,    setSelected]    = useState(null);
  const [creditUser,  setCreditUser]  = useState(null); // user to credit

  const toggleSuspend = useCallback((id) => {
    onToggleSuspend(id);
    setSelected(prev => prev?.id===id ? {...prev, status: prev.status==="suspended"?"active":"suspended"} : prev);
  }, [onToggleSuspend]);

  const verifyKYC = useCallback((id) => {
    onVerifyKYC(id);
    setSelected(prev => prev?.id===id ? {...prev, kyc:"verified"} : prev);
  }, [onVerifyKYC]);

  const handleCredit = useCallback((id, amount) => {
    onCreditBalance(id, amount);
    setSelected(prev => prev?.id===id ? {...prev, balance: (prev.balance||0) + amount} : prev);
  }, [onCreditBalance]);

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    const matchFilter = filter==="all" || u.status===filter || u.kyc===filter;
    return matchSearch && matchFilter;
  });

  const FILTERS = [["all","All"], ["active","Active"], ["suspended","Suspended"], ["pending","KYC Pending"], ["unverified","Unverified"]];

  return (
    <div className="tab-content">
      {creditUser && <CreditBalanceModal user={creditUser} onClose={()=>setCreditUser(null)} onCredit={handleCredit} />}
      {selected && <UserDetailModal user={selected} onClose={()=>setSelected(null)} onToggleSuspend={toggleSuspend} onVerifyKYC={verifyKYC} onCredit={(u)=>{setSelected(null);setCreditUser(u);}} onInvestmentAction={onInvestmentAction} />}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {FILTERS.map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)}
              style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${filter===v?t.cyan:t.navyBorder}`, background:filter===v?t.cyanGlow:"transparent", color:filter===v?t.cyan:t.muted, fontSize:12, fontWeight:filter===v?600:400, cursor:"pointer", transition:"all .18s" }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ fontSize:13, color:t.muted }}>{filtered.length} user{filtered.length!==1?"s":""}</div>
      </div>

      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14 }}>
        <div className="tbl-wrap">
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${t.navyBorder}` }}>
              {["User","Email","Balance","Plan","Joined","KYC","Status","Actions"].map(h=>(
                <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:11, color:t.muted, fontWeight:600, whiteSpace:"nowrap" }} className={["Email","Plan","Joined"].includes(h)?"user-cols":""} >{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="row-hover" style={{ borderBottom:`1px solid rgba(26,58,107,0.3)` }}>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:`${avatarColor(u.name)}20`, color:avatarColor(u.name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{initials(u.name)}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{u.name}</div>
                      <div style={{ fontSize:11, color:t.muted }}>{u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="user-cols" style={{ padding:"11px 14px", fontSize:12, color:t.muted }}>{u.email}</td>
                <td style={{ padding:"11px 14px", fontSize:13, fontWeight:600, color:t.cyan }}>${fmt(u.balance)}</td>
                <td className="user-cols" style={{ padding:"11px 14px", fontSize:12, color:t.muted }}>{u.plan}</td>
                <td className="user-cols" style={{ padding:"11px 14px", fontSize:12, color:t.muted }}>{u.joined}</td>
                <td style={{ padding:"11px 14px" }}><Badge status={u.kyc} /></td>
                <td style={{ padding:"11px 14px" }}><Badge status={u.status} /></td>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>setSelected(u)} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${t.navyBorder}`, background:t.navyLight, color:t.cyan, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:12 }} title="View">{Ico.eye}</button>
                    <button onClick={()=>setCreditUser(u)} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${t.green}33`, background:`${t.green}11`, color:t.green, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:12 }} title="Credit Balance">{Ico.wallet}</button>
                    <button onClick={()=>toggleSuspend(u.id)} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${u.status==="suspended"?t.green:t.red}22`, background:`${u.status==="suspended"?t.green:t.red}11`, color:u.status==="suspended"?t.green:t.red, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:12 }} title={u.status==="suspended"?"Reinstate":"Suspend"}>{u.status==="suspended"?Ico.check:Ico.ban}</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:t.muted, fontSize:14 }}>No users found</td></tr>
            )}
          </tbody>
        </table>
        </div>{/* /tbl-wrap */}
      </div>
    </div>
  );
}

// ─── TAB 3: TRANSACTIONS ────────────────────────────────────────────────────
function TransactionsTab({ transactions, onAction, searchQuery }) {
  const [typeF,      setTypeF]      = useState("all");
  const [statusF,    setStatusF]    = useState("all");
  const [confirmTx,  setConfirmTx]  = useState(null); // full tx object
  const [action,     setAction]     = useState(null);  // "approve" | "reject"
  const [rejectNote, setRejectNote] = useState("");

  const handleAction = (tx, act) => {
    onAction(tx, act, rejectNote);
    setConfirmTx(null); setAction(null); setRejectNote("");
  };

  const filtered = transactions.filter(tx => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || (tx.user||"").toLowerCase().includes(q) || (tx.id||"").toLowerCase().includes(q) || (tx.coin||"").toLowerCase().includes(q);
    const matchType   = typeF==="all" || tx.type===typeF;
    const matchStatus = statusF==="all" || tx.status===statusF;
    return matchSearch && matchType && matchStatus;
  });

  const TYPES   = [["all","All Types"],["deposit","Deposits"],["withdrawal","Withdrawals"],["earning","Earnings"],["referral","Referrals"]];
  const STATUSES= [["all","All"],["completed","Completed"],["pending","Pending"],["rejected","Rejected"]];
  const pendingWithdrawals = transactions.filter(x=>x.type==="withdrawal"&&x.status==="pending").length;
  const pendingDeposits   = transactions.filter(x=>x.type==="deposit"  &&x.status==="pending").length;
  const pendingCount      = pendingWithdrawals + pendingDeposits;

  return (
    <div className="tab-content">
      {confirmTx && (
        <Modal
          onClose={()=>{setConfirmTx(null);setAction(null);setRejectNote("");}}
          title={
            action==="approve"
              ? (confirmTx.type==="deposit" ? "Approve Deposit" : "Approve Withdrawal")
              : (confirmTx.type==="deposit" ? "Reject Deposit"  : "Reject Withdrawal")
          }
          width={440}
        >
          {/* Summary row */}
          <div style={{ background:t.navyLight, borderRadius:10, padding:"14px 16px", marginBottom:18,
            display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              ["User",   confirmTx.user],
              ["Type",   confirmTx.type.charAt(0).toUpperCase()+confirmTx.type.slice(1)],
              ["Amount", `$${fmt(confirmTx.amount)}`],
              ["Coin",   confirmTx.coin || "—"],
            ].map(([k,v])=>(
              <div key={k}>
                <div style={{ fontSize:11, color:t.muted }}>{k}</div>
                <div style={{ fontSize:13, fontWeight:600, color: k==="Amount"?(confirmTx.type==="deposit"?t.green:t.red):t.white }}>{v}</div>
              </div>
            ))}
          </div>

          {action==="approve" && (
            <p style={{ fontSize:13, color:t.mutedLight, marginBottom:16 }}>
              {confirmTx.type==="deposit"
                ? `This will credit $${fmt(confirmTx.amount)} to ${confirmTx.user}'s balance immediately.`
                : `Confirm that funds have been sent to ${confirmTx.user}'s wallet.`}
            </p>
          )}
          {action==="reject" && (
            <FormInput label="Rejection reason (optional)" value={rejectNote} onChange={e=>setRejectNote(e.target.value)}
              placeholder={confirmTx.type==="deposit" ? "e.g. Payment not received" : "e.g. Suspicious activity"} />
          )}

          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>handleAction(confirmTx, action)} color={action==="approve"?t.green:t.red} textColor="#fff">
              {action==="approve" ? <>{Ico.check} Approve</> : <>{Ico.x} Reject</>}
            </Btn>
            <Btn onClick={()=>{setConfirmTx(null);setAction(null);setRejectNote("");}} color={t.navyLight} textColor={t.white} outline>Cancel</Btn>
          </div>
        </Modal>
      )}

      {pendingCount > 0 && (
        <div style={{ background:`rgba(240,192,64,0.08)`, border:`1px solid rgba(240,192,64,0.25)`, borderRadius:12, padding:"12px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <span style={{ fontSize:18 }}>⚠️</span>
          <span style={{ fontSize:13, color:t.gold }}>
            <strong>{pendingCount}</strong> transaction{pendingCount!==1?"s":""} awaiting approval —
            {pendingDeposits > 0   && <span style={{ color:t.cyan }}>  {pendingDeposits} deposit{pendingDeposits!==1?"s":""}</span>}
            {pendingDeposits > 0 && pendingWithdrawals > 0 && <span style={{ color:t.muted }}>,</span>}
            {pendingWithdrawals > 0 && <span style={{ color:t.red }}>  {pendingWithdrawals} withdrawal{pendingWithdrawals!==1?"s":""}</span>}
          </span>
        </div>
      )}

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16, justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {TYPES.map(([v,l])=>(
            <button key={v} onClick={()=>setTypeF(v)}
              style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${typeF===v?t.cyan:t.navyBorder}`, background:typeF===v?t.cyanGlow:"transparent", color:typeF===v?t.cyan:t.muted, fontSize:12, fontWeight:typeF===v?600:400, cursor:"pointer", transition:"all .18s" }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {STATUSES.map(([v,l])=>(
            <button key={v} onClick={()=>setStatusF(v)}
              style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${statusF===v?t.navyBorder:t.navyBorder}`, background:statusF===v?t.navyLight:"transparent", color:statusF===v?t.white:t.muted, fontSize:12, cursor:"pointer", transition:"all .18s" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14 }}>
        <div className="tbl-wrap">
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${t.navyBorder}` }}>
              {["ID","User","Type","Amount","Coin","Plan","Date","Status","Actions"].map(h=>(
                <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:11, color:t.muted, fontWeight:600, whiteSpace:"nowrap" }} className={["Coin","Plan","Date"].includes(h)?"tx-cols":""}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr key={tx.id} className="row-hover" style={{ borderBottom:`1px solid rgba(26,58,107,0.3)` }}>
                <td style={{ padding:"10px 14px", fontSize:12, color:t.cyan }}>{tx.id}</td>
                <td style={{ padding:"10px 14px", fontSize:13 }}>{tx.user}</td>
                <td style={{ padding:"10px 14px" }}>
                  <span style={{ fontSize:12, fontWeight:600, textTransform:"capitalize", color:tx.type==="deposit"?t.green:tx.type==="withdrawal"?t.red:tx.type==="earning"?t.cyan:t.gold }}>{tx.type}</span>
                </td>
                <td style={{ padding:"10px 14px", fontSize:13, fontWeight:600, color:tx.type==="withdrawal"?t.red:t.white }}>${fmt(tx.amount)}</td>
                <td className="tx-cols" style={{ padding:"10px 14px", fontSize:12, color:t.muted }}>{tx.coin}</td>
                <td className="tx-cols" style={{ padding:"10px 14px", fontSize:12, color:t.muted }}>{tx.plan}</td>
                <td className="tx-cols" style={{ padding:"10px 14px", fontSize:12, color:t.muted }}>{tx.date}</td>
                <td style={{ padding:"10px 14px" }}><Badge status={tx.status} /></td>
                <td style={{ padding:"10px 14px" }}>
                  {(tx.type==="withdrawal"||tx.type==="deposit") && tx.status==="pending" ? (
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>{setConfirmTx(tx);setAction("approve");}} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${t.green}33`, background:`${t.green}11`, color:t.green, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:12 }}>{Ico.check} Approve</button>
                      <button onClick={()=>{setConfirmTx(tx);setAction("reject");}} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${t.red}33`, background:`${t.red}11`, color:t.red, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:12 }}>{Ico.x} Reject</button>
                    </div>
                  ) : (
                    <span style={{ fontSize:12, color:t.muted }}>—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr><td colSpan={9} style={{ padding:40, textAlign:"center", color:t.muted, fontSize:14 }}>No transactions found</td></tr>
            )}
          </tbody>
        </table>
        </div>{/* /tbl-wrap */}
      </div>
      <div style={{ marginTop:10, fontSize:12, color:t.muted }}>{filtered.length} transaction{filtered.length!==1?"s":""} shown</div>
    </div>
  );
}

// ─── TAB 4: PLANS ────────────────────────────────────────────────────────────
const PLAN_COLORS = [t.cyanDim, t.cyan, t.green, t.gold, t.purple, t.orange];

function PlanModal({ plan, onClose, onSave }) {
  const isNew = !plan.id;
  const [form, setForm] = useState({
    name:     plan.name     || "",
    rate:     plan.rate     || "",
    duration: plan.duration || "",
    min:      plan.min      || "",
    max:      plan.max      || "",
    color:    plan.color    || t.cyan,
    active:   plan.active   !== false,
  });
  const set = (k) => (e) => setForm(prev=>({...prev,[k]:e.target.value}));
  const valid = form.name && form.rate && form.duration && form.min && form.max;
  return (
    <Modal onClose={onClose} title={isNew ? "Add New Plan" : `Edit "${plan.name}" Plan`} width={480}>
      <FormInput label="Plan Name"            value={form.name}     onChange={set("name")}     placeholder="e.g. Elite" />
      <FormInput label="Daily Rate (%)"       value={form.rate}     onChange={set("rate")}     type="number" placeholder="e.g. 1.8" step="0.1" min="0.1" />
      <FormInput label="Duration (days)"      value={form.duration} onChange={set("duration")} type="number" placeholder="e.g. 20" min="1" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <FormInput label="Min Deposit ($)"    value={form.min}      onChange={set("min")}      type="number" placeholder="e.g. 500" min="1" />
        <FormInput label="Max Deposit ($)"    value={form.max}      onChange={set("max")}      type="number" placeholder="e.g. 9999" />
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:12, color:t.muted, display:"block", marginBottom:8, fontWeight:500 }}>Accent Colour</label>
        <div style={{ display:"flex", gap:8 }}>
          {PLAN_COLORS.map(c => (
            <div key={c} onClick={()=>setForm(p=>({...p,color:c}))}
              style={{ width:26, height:26, borderRadius:"50%", background:c, cursor:"pointer", border:form.color===c?`3px solid #fff`:`3px solid transparent`, transition:"border .15s" }} />
          ))}
        </div>
      </div>
      <Toggle value={form.active} onChange={()=>setForm(p=>({...p,active:!p.active}))} label="Plan Active (visible to users)" />
      <div style={{ display:"flex", gap:10, marginTop:22 }}>
        <Btn onClick={()=>valid&&onSave({...plan,...form,rate:+form.rate,duration:+form.duration,min:+form.min,max:+form.max})} disabled={!valid} color={t.cyan} textColor={t.navy}>{Ico.check} {isNew?"Create Plan":"Save Changes"}</Btn>
        <Btn onClick={onClose} color={t.navyLight} textColor={t.white} outline>Cancel</Btn>
      </div>
    </Modal>
  );
}

function PlansTab({ plans, onSavePlan, onToggleActive, onDeletePlan }) {
  const [editPlan, setEditPlan] = useState(null);
  const [showNew,  setShowNew]  = useState(false);
  const [delId,    setDelId]    = useState(null);

  const savePlan = (data) => {
    onSavePlan(data);
    setEditPlan(null); setShowNew(false);
  };

  const toggleActive = (id) => onToggleActive(id);
  const deletePlan   = (id) => { onDeletePlan(id); setDelId(null); };

  return (
    <div className="tab-content">
      {(editPlan || showNew) && <PlanModal plan={editPlan||{}} onClose={()=>{setEditPlan(null);setShowNew(false);}} onSave={savePlan} />}
      {delId && (
        <Modal onClose={()=>setDelId(null)} title="Delete Plan" width={400}>
          <p style={{ color:t.mutedLight, fontSize:14, marginBottom:20 }}>Are you sure you want to delete this plan? This cannot be undone.</p>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>deletePlan(delId)} color={t.red} textColor="#fff">{Ico.trash} Delete</Btn>
            <Btn onClick={()=>setDelId(null)} color={t.navyLight} textColor={t.white} outline>Cancel</Btn>
          </div>
        </Modal>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700 }}>Investment Plans</h2>
          <p style={{ fontSize:13, color:t.muted, marginTop:2 }}>{plans.length} plans · {plans.filter(p=>p.active).length} active</p>
        </div>
        <Btn onClick={()=>setShowNew(true)} color={t.cyan} textColor={t.navy}>{Ico.plus} Add Plan</Btn>
      </div>

      <div className="plan-grid">
        {plans.map(plan => (
          <div key={plan.id} className="card-hover" style={{ background:t.navyCard, border:`1px solid ${plan.active?plan.color+"44":t.navyBorder}`, borderRadius:14, padding:"22px 22px 18px", position:"relative", opacity:plan.active?1:.7 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:plan.color }}>{plan.name}</div>
                <div style={{ fontSize:12, color:t.muted, marginTop:2 }}>{plan.duration}-day term</div>
              </div>
              <Badge status={plan.active?"active":"inactive"} />
            </div>
            <div style={{ fontSize:32, fontWeight:800, fontFamily:"'Syne',sans-serif", color:plan.color, marginBottom:4 }}>{plan.rate}%<span style={{ fontSize:14, color:t.muted, fontWeight:400 }}>/day</span></div>
            <div style={{ fontSize:12, color:t.muted, marginBottom:16 }}>${plan.min.toLocaleString()} – {plan.max>=999999?"Unlimited":`$${plan.max.toLocaleString()}`}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              <div style={{ background:t.navyLight, borderRadius:9, padding:"9px 12px" }}>
                <div style={{ fontSize:10, color:t.muted }}>Investments</div>
                <div style={{ fontSize:16, fontWeight:700, color:t.white }}>{plan.investments}</div>
              </div>
              <div style={{ background:t.navyLight, borderRadius:9, padding:"9px 12px" }}>
                <div style={{ fontSize:10, color:t.muted }}>Total Invested</div>
                <div style={{ fontSize:15, fontWeight:700, color:plan.color }}>{fmtK(plan.totalInvested)}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={()=>setEditPlan(plan)} color={t.navyLight} textColor={t.white} outline size="xs">{Ico.edit} Edit</Btn>
              <Btn onClick={()=>toggleActive(plan.id)} color={plan.active?t.orange:t.green} textColor="#fff" size="xs">{plan.active?<>{Ico.toggle} Disable</>:<>{Ico.check} Enable</>}</Btn>
              <Btn onClick={()=>setDelId(plan.id)} color={t.red} textColor="#fff" size="xs" outline>{Ico.trash}</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TAB 5: KYC ──────────────────────────────────────────────────────────────
function KYCTab({ kyc, onDecide }) {
  const [selected,  setSelected]  = useState(null); // full submission obj
  const [note,      setNote]      = useState("");
  const [filter,    setFilter]    = useState("pending"); // "pending"|"approved"|"rejected"|"all"
  const [search,    setSearch]    = useState("");

  const decide = (id, status) => {
    onDecide(id, status, note);
    setSelected(null); setNote("");
  };

  const pending   = kyc.filter(k=>k.status==="pending").length;
  const approved  = kyc.filter(k=>k.status==="approved").length;
  const rejected  = kyc.filter(k=>k.status==="rejected").length;

  const visible = kyc.filter(k => {
    const matchFilter = filter==="all" || k.status===filter;
    const matchSearch = !search || k.name.toLowerCase().includes(search.toLowerCase()) || k.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="tab-content">

      {/* Review modal */}
      {selected && (
        <Modal onClose={()=>{ setSelected(null); setNote(""); }} title="KYC Review" width={560}>
          {/* User header */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, padding:"16px",
            background:t.navyLight, borderRadius:12 }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:`${avatarColor(selected.name)}22`,
              color:avatarColor(selected.name), display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, fontWeight:700, flexShrink:0 }}>{initials(selected.name)}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:16, fontWeight:700 }}>{selected.name}</div>
              <div style={{ fontSize:13, color:t.muted }}>{selected.email}</div>
            </div>
            <Badge status={selected.status} />
          </div>

          {/* Document details */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {[
              ["Document Type",   selected.docType   || "—"],
              ["Document Number", selected.docNumber || "Not provided"],
              ["Country",         selected.country   || "—"],
              ["Submitted",       selected.submitted || "—"],
            ].map(([k,v]) => (
              <div key={k} style={{ background:t.navyLight, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:11, color:t.muted, marginBottom:3 }}>{k}</div>
                <div style={{ fontSize:13, fontWeight:600, color:t.white }}>{v}</div>
              </div>
            ))}
          </div>

          {/* ID card images */}
          {(selected.docFrontUrl || selected.docBackUrl) && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, color:t.muted, fontWeight:600, letterSpacing:"0.5px",
                textTransform:"uppercase", marginBottom:10 }}>ID Card Images</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[["Front", selected.docFrontUrl], ["Back", selected.docBackUrl]].map(([side, src]) => (
                  <div key={side}>
                    <div style={{ fontSize:11, color:t.muted, marginBottom:5 }}>{side} of ID</div>
                    {src ? (
                      <a href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt={`${side} of ID`}
                          style={{ width:"100%", height:130, objectFit:"cover", borderRadius:10,
                            border:`1px solid ${t.navyBorder}`, cursor:"pointer", display:"block",
                            transition:"opacity .2s" }}
                          onMouseEnter={e=>e.currentTarget.style.opacity=".8"}
                          onMouseLeave={e=>e.currentTarget.style.opacity="1"} />
                        <div style={{ fontSize:11, color:t.cyan, marginTop:4, textAlign:"center" }}>
                          Click to open full size ↗
                        </div>
                      </a>
                    ) : (
                      <div style={{ height:130, background:t.navyLight, borderRadius:10,
                        border:`1px dashed ${t.navyBorder}`, display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:13, color:t.muted }}>
                        Not provided
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous note */}
          {selected.notes && (
            <div style={{ background:t.cyanGlow2, border:`1px solid rgba(0,212,255,0.15)`,
              borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:13, color:t.mutedLight }}>
              <span style={{ color:t.muted, fontSize:11 }}>Previous note: </span>"{selected.notes}"
            </div>
          )}

          <FormInput label="Admin Note" value={note} onChange={e=>setNote(e.target.value)}
            placeholder="e.g. Documents verified and clear" />

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <Btn onClick={()=>decide(selected.id,"approved")} color={t.green}  textColor="#fff">{Ico.check} Approve</Btn>
            <Btn onClick={()=>decide(selected.id,"rejected")} color={t.red}    textColor="#fff">{Ico.x} Reject</Btn>
            <Btn onClick={()=>{ setSelected(null); setNote(""); }} color={t.navyLight} textColor={t.white} outline>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[
          ["Pending Review", pending,  t.gold,  "⏳"],
          ["Approved",       approved, t.green, "✅"],
          ["Rejected",       rejected, t.red,   "❌"],
        ].map(([label, val, color, icon]) => (
          <div key={label} style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`,
            borderRadius:12, padding:"16px 18px", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:24 }}>{icon}</span>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:700, color }}>{val}</div>
              <div style={{ fontSize:12, color:t.muted }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", gap:6 }}>
          {[["pending","Pending"],["approved","Approved"],["rejected","Rejected"],["all","All"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)}
              style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${filter===v?t.cyan:t.navyBorder}`,
                background:filter===v?t.cyanGlow:"transparent", color:filter===v?t.cyan:t.muted,
                fontSize:12, fontWeight:filter===v?600:400, cursor:"pointer", transition:"all .18s" }}>
              {l}
              {v!=="all" && <span style={{ marginLeft:5, opacity:.7 }}>
                {v==="pending"?pending:v==="approved"?approved:rejected}
              </span>}
            </button>
          ))}
        </div>
        <input className="cc-input" placeholder="Search by name or email…"
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:180, background:t.navyCard, border:`1px solid ${t.navyBorder}`,
            borderRadius:8, padding:"8px 14px", color:t.white, fontSize:13, fontFamily:"'DM Sans',sans-serif" }} />
      </div>

      {/* Submissions list */}
      {visible.length === 0 ? (
        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14,
          padding:"40px", textAlign:"center", color:t.muted, fontSize:14 }}>
          {filter==="pending" ? "✅ No pending KYC submissions" : "No submissions found"}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {visible.map(k => (
            <div key={k.id} style={{ background:t.navyCard, border:`1px solid ${k.status==="pending"?t.gold+"44":t.navyBorder}`,
              borderRadius:14, padding:"18px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>

                {/* Left: user info */}
                <div style={{ display:"flex", gap:12, alignItems:"center", flex:1, minWidth:200 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:`${avatarColor(k.name)}22`,
                    color:avatarColor(k.name), display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, fontWeight:700, flexShrink:0 }}>{initials(k.name)}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600 }}>{k.name}</div>
                    <div style={{ fontSize:11, color:t.muted }}>{k.email}</div>
                  </div>
                </div>

                {/* Middle: doc details */}
                <div style={{ display:"flex", gap:16, fontSize:12, color:t.muted, alignItems:"center", flexWrap:"wrap" }}>
                  <span>📋 {k.docType}</span>
                  {k.docNumber && <span style={{ color:t.mutedLight }}>#{k.docNumber}</span>}
                  <span>🌍 {k.country || "—"}</span>
                  <span>📅 {k.submitted}</span>
                  <Badge status={k.status} />
                </div>

                {/* Right: actions */}
                <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
                  {k.status==="pending" && (
                    <>
                      <button onClick={()=>{ onDecide(k.id,"approved","Approved by admin"); }}
                        style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${t.green}44`,
                          background:`${t.green}11`, color:t.green, cursor:"pointer", fontSize:12,
                          display:"flex", alignItems:"center", gap:4 }}>{Ico.check} Approve</button>
                      <button onClick={()=>{ onDecide(k.id,"rejected","Rejected by admin"); }}
                        style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${t.red}44`,
                          background:`${t.red}11`, color:t.red, cursor:"pointer", fontSize:12,
                          display:"flex", alignItems:"center", gap:4 }}>{Ico.x} Reject</button>
                    </>
                  )}
                  <button onClick={()=>{ setSelected(k); setNote(k.notes||""); }}
                    style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${t.navyBorder}`,
                      background:t.navyLight, color:t.cyan, cursor:"pointer", fontSize:12,
                      display:"flex", alignItems:"center", gap:4 }}>
                    {Ico.eye} {k.status==="pending"?"Review":"Details"}
                  </button>
                </div>
              </div>

              {/* Previous admin note */}
              {k.notes && (
                <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${t.navyBorder}`,
                  fontSize:12, color:t.muted, fontStyle:"italic" }}>
                  Admin note: "{k.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB 6: REPORTS ──────────────────────────────────────────────────────────
function ReportsTab() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="tab-content" style={{ padding:60, textAlign:"center", color:t.muted }}>Loading reports…</div>;
  if (!data)   return <div className="tab-content" style={{ padding:60, textAlign:"center", color:t.red }}>Failed to load reports.</div>;

  const rev  = data.revenueData || [];
  const grow = data.growthData  || [];
  const tot  = data.totals      || {};

  const maxDep  = Math.max(1, ...rev.map(d=>d.deposits));
  const maxU    = Math.max(1, ...grow.map(d=>d.users));
  const planTotal = (data.planStats||[]).reduce((s,p)=>s+p.total,0);

  const PLAN_COLORS = [t.cyanDim, t.cyan, t.green, t.gold, t.purple||"#a78bfa", t.orange||"#ff9f43"];

  return (
    <div className="tab-content">
      <div className="stat-grid" style={{ marginBottom:24 }}>
        <StatCard label="Total Earnings (6mo)"   value={fmtK(rev.reduce((s,d)=>s+d.revenue,0))}    sub="platform earnings"    icon={Ico.trending} color={t.cyan}  />
        <StatCard label="Total Deposits (6mo)"   value={fmtK(rev.reduce((s,d)=>s+d.deposits,0))}   sub="all deposits"         icon={Ico.wallet}   color={t.green} />
        <StatCard label="Total Withdrawn (6mo)"  value={fmtK(rev.reduce((s,d)=>s+d.withdrawals,0))}sub="paid out"             icon={Ico.tx}       color={t.red}   />
        <StatCard label="Total Users"            value={tot.users||0}                               sub={`${tot.activeInvs||0} active investments`} icon={Ico.users} color={t.gold} />
      </div>

      <div className="report-grid" style={{ marginBottom:24 }}>
        {/* Deposits vs Withdrawals */}
        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"22px 24px" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:6 }}>Deposits vs Withdrawals</div>
          <div style={{ fontSize:12, color:t.muted, marginBottom:20 }}>Monthly comparison (last 6 months)</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:150 }}>
            {rev.map((d,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                <div style={{ width:"100%", display:"flex", alignItems:"flex-end", gap:2, height:130 }}>
                  <div style={{ flex:1, borderRadius:"4px 4px 0 0", background:`linear-gradient(to top,${t.green},rgba(0,224,150,0.5))`, height:`${Math.round((d.deposits/maxDep)*120)}px`, minHeight:4 }} />
                  <div style={{ flex:1, borderRadius:"4px 4px 0 0", background:`linear-gradient(to top,${t.red},rgba(255,77,109,0.5))`, height:`${Math.round((d.withdrawals/maxDep)*120)}px`, minHeight:4 }} />
                </div>
                <span style={{ fontSize:10, color:t.muted }}>{d.month}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:16, marginTop:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}><div style={{ width:10, height:10, borderRadius:2, background:t.green }} /><span style={{ color:t.muted }}>Deposits</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}><div style={{ width:10, height:10, borderRadius:2, background:t.red }} /><span style={{ color:t.muted }}>Withdrawals</span></div>
          </div>
        </div>

        {/* User Growth */}
        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"22px 24px" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:6 }}>User Growth</div>
          <div style={{ fontSize:12, color:t.muted, marginBottom:20 }}>New registrations per month</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:150 }}>
            {grow.map((d,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                <div style={{ fontSize:10, color:t.cyan, fontWeight:600 }}>{d.users}</div>
                <div style={{ width:"100%", borderRadius:"5px 5px 0 0", background:`linear-gradient(to top,${t.purple||"#a78bfa"},rgba(167,139,250,0.4))`, height:`${Math.round((d.users/maxU)*100)}px`, minHeight:4 }} />
                <span style={{ fontSize:10, color:t.muted }}>{d.month}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:"10px 0", borderTop:`1px solid ${t.navyBorder}`, display:"flex", gap:20 }}>
            <div><div style={{ fontSize:11, color:t.muted }}>All-time Users</div><div style={{ fontSize:16, fontWeight:700, color:t.white }}>{tot.users||0}</div></div>
            <div><div style={{ fontSize:11, color:t.muted }}>6-mo New</div><div style={{ fontSize:16, fontWeight:700, color:t.green }}>+{grow.reduce((s,d)=>s+d.users,0)}</div></div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"22px 24px" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:20 }}>Investment Plan Distribution</div>
        {(data.planStats||[]).length === 0 ? (
          <div style={{ textAlign:"center", color:t.muted, fontSize:14, padding:"24px 0" }}>No investments yet.</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:16 }}>
            {(data.planStats||[]).map((plan,i) => {
              const color = PLAN_COLORS[i % PLAN_COLORS.length];
              const pct   = planTotal > 0 ? Math.round((plan.total/planTotal)*100) : 0;
              return (
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ position:"relative", width:72, height:72, margin:"0 auto 12px" }}>
                    <svg viewBox="0 0 36 36" style={{ transform:"rotate(-90deg)", width:72, height:72 }}>
                      <circle cx="18" cy="18" r="14" fill="none" stroke={t.navyLight} strokeWidth="4"/>
                      <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="4"
                        strokeDasharray={`${pct*0.88} ${88-pct*0.88}`} strokeLinecap="round"/>
                    </svg>
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color }}>{pct}%</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color }}>{plan.name}</div>
                  <div style={{ fontSize:12, color:t.muted }}>{fmtK(plan.total)}</div>
                  <div style={{ fontSize:11, color:t.muted }}>{plan.count} investors</div>
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
function PropertyModal({ prop, onClose, onSave }) {
  const isNew = !prop?.id;
  const [form, setForm] = useState({
    title:          prop?.title          || "",
    location:       prop?.location       || "",
    type:           prop?.type           || "residential",
    description:    prop?.description    || "",
    imageUrl:       prop?.imageUrl       || "",
    targetAmount:   prop?.targetAmount   || "",
    minInvestment:  prop?.minInvestment  || "",
    annualReturn:   prop?.annualReturn   || "",
    durationMonths: prop?.durationMonths || "",
    investorCount:  prop?.investorCount  ?? 0,
    highlights:     (prop?.highlights||[]).join(", "),
    active:         prop?.active !== false,
    status:         prop?.status || "open",
  });
  const [saving, setSaving]   = useState(false);
  const [err,    setErr]      = useState("");
  const [imgPrev,setImgPrev]  = useState(prop?.imageUrl || "");

  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setErr("Image must be under 3 MB."); return; }
    const reader = new FileReader();
    reader.onload = ev => { setForm(p=>({...p,imageUrl:ev.target.result})); setImgPrev(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.title||!form.location||!form.targetAmount||!form.minInvestment||!form.annualReturn||!form.durationMonths)
      { setErr("All required fields must be filled."); return; }
    setSaving(true); setErr("");
    const payload = {
      ...form,
      targetAmount:   Number(form.targetAmount),
      minInvestment:  Number(form.minInvestment),
      annualReturn:   Number(form.annualReturn),
      durationMonths: Number(form.durationMonths),
      investorCount:  Number(form.investorCount) || 0,
      highlights:     form.highlights.split(",").map(s=>s.trim()).filter(Boolean),
    };
    try {
      const url    = isNew ? "/api/admin/realestate" : `/api/admin/realestate?id=${prop.id}`;
      const method = isNew ? "POST" : "PUT";
      const res    = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const data   = await res.json();
      if (res.ok) onSave(data.property, isNew);
      else        setErr(data.error || "Failed to save.");
    } catch { setErr("Something went wrong."); }
    finally  { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} title={isNew ? "Add Property" : `Edit — ${prop.title}`} width={560}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div style={{ gridColumn:"1/-1" }}>
          <FormInput label="Property Title *"  value={form.title}    onChange={set("title")}    placeholder="e.g. Lekki Phase 1 Duplex" />
        </div>
        <FormInput label="Location *"          value={form.location} onChange={set("location")} placeholder="e.g. Lagos, Nigeria" />
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, color:t.muted, display:"block", marginBottom:6 }}>Type</label>
          <select value={form.type} onChange={set("type")} className="cc-input"
            style={{ width:"100%", background:t.navyLight, border:`1px solid ${t.navyBorder}`, borderRadius:10, padding:"10px 14px", color:t.white, fontSize:14 }}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
            <option value="mixed">Mixed Use</option>
          </select>
        </div>
        <FormInput label="Target Amount ($) *"    value={form.targetAmount}   onChange={set("targetAmount")}   type="number" placeholder="e.g. 500000" />
        <FormInput label="Min Investment ($) *"   value={form.minInvestment}  onChange={set("minInvestment")}  type="number" placeholder="e.g. 5000" />
        <FormInput label="Annual Return (%) *"    value={form.annualReturn}   onChange={set("annualReturn")}   type="number" placeholder="e.g. 15" step="0.1" />
        <FormInput label="Duration (months) *"    value={form.durationMonths} onChange={set("durationMonths")} type="number" placeholder="e.g. 24" />
        <FormInput label="Number of Investors"    value={form.investorCount}  onChange={set("investorCount")}  type="number" placeholder="e.g. 124" min="0" />
      </div>
      <div style={{ marginBottom:16, gridColumn:"1/-1" }}>
        <label style={{ fontSize:12, color:t.muted, display:"block", marginBottom:6 }}>Description</label>
        <textarea value={form.description} onChange={set("description")} placeholder="Describe the property…"
          style={{ width:"100%", background:t.navyLight, border:`1px solid ${t.navyBorder}`, borderRadius:10,
            padding:"10px 14px", color:t.white, fontSize:13, fontFamily:"'DM Sans',sans-serif",
            minHeight:80, resize:"vertical" }} />
      </div>
      <FormInput label="Highlights (comma-separated)" value={form.highlights} onChange={set("highlights")} placeholder="e.g. Gated estate, Pool, 24/7 security" />
      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:12, color:t.muted, display:"block", marginBottom:6 }}>Property Image (max 3 MB)</label>
        <input type="file" accept="image/*" onChange={handleImage}
          style={{ color:t.mutedLight, fontSize:13 }} />
        {imgPrev && <img src={imgPrev} alt="preview" style={{ marginTop:10, width:"100%", maxHeight:160, objectFit:"cover", borderRadius:10 }} />}
      </div>
      <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:t.mutedLight }}>
          <input type="checkbox" checked={form.active} onChange={e=>setForm(p=>({...p,active:e.target.checked}))} />
          Active (visible to users)
        </label>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:13, color:t.muted }}>Status:</span>
          <select value={form.status} onChange={set("status")} className="cc-input"
            style={{ background:t.navyLight, border:`1px solid ${t.navyBorder}`, borderRadius:8, padding:"5px 10px", color:t.white, fontSize:13 }}>
            <option value="open">Open</option>
            <option value="funded">Funded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
      {err && <div style={{ fontSize:13, color:t.red, marginBottom:12 }}>⚠ {err}</div>}
      <div style={{ display:"flex", gap:10 }}>
        <Btn onClick={save} color={t.cyan} textColor={t.navy} disabled={saving}>{saving?"Saving…":<>{Ico.check} {isNew?"Create Property":"Save Changes"}</>}</Btn>
        <Btn onClick={onClose} color={t.navyLight} textColor={t.white} outline>Cancel</Btn>
      </div>
    </Modal>
  );
}

function RealEstateTab() {
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editProp,   setEditProp]   = useState(null);
  const [showNew,    setShowNew]    = useState(false);
  const [delId,      setDelId]      = useState(null);

  const load = async () => {
    try {
      const d = await fetch("/api/admin/realestate").then(r=>r.json());
      if (Array.isArray(d)) setProperties(d);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onSave = (prop, isNew) => {
    if (isNew) setProperties(prev => [prop, ...prev]);
    else       setProperties(prev => prev.map(p => p.id===prop.id ? prop : p));
    setEditProp(null); setShowNew(false);
  };

  const deleteProp = async (id) => {
    setProperties(prev => prev.filter(p=>p.id!==id));
    setDelId(null);
    await fetch(`/api/admin/realestate?id=${id}`, { method:"DELETE" }).catch(()=>{});
  };

  const toggleActive = async (prop) => {
    setProperties(prev => prev.map(p=>p.id===prop.id?{...p,active:!p.active}:p));
    await fetch(`/api/admin/realestate?id=${prop.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ active:!prop.active }),
    }).catch(()=>{});
  };

  const typeColor = { residential:"#00d4ff", commercial:"#f0c040", land:"#00e096", mixed:"#a78bfa" };

  if (loading) return <div className="tab-content" style={{ padding:60, textAlign:"center", color:t.muted }}>Loading…</div>;

  return (
    <div className="tab-content">
      {(editProp || showNew) && (
        <PropertyModal prop={editProp||null} onClose={()=>{setEditProp(null);setShowNew(false);}} onSave={onSave} />
      )}
      {delId && (
        <Modal onClose={()=>setDelId(null)} title="Delete Property" width={400}>
          <p style={{ color:t.mutedLight, fontSize:14, marginBottom:20 }}>Delete this property? This also removes all associated investment records.</p>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>deleteProp(delId)} color={t.red} textColor="#fff">{Ico.trash} Delete</Btn>
            <Btn onClick={()=>setDelId(null)} color={t.navyLight} textColor={t.white} outline>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700 }}>Real Estate Properties</h2>
          <p style={{ fontSize:13, color:t.muted, marginTop:2 }}>
            {properties.length} properties · {properties.filter(p=>p.active&&p.status==="open").length} open for investment
          </p>
        </div>
        <Btn onClick={()=>setShowNew(true)} color={t.cyan} textColor={t.navy}>{Ico.plus} Add Property</Btn>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14, marginBottom:24 }}>
        {[
          ["Total Properties", properties.length, t.cyan],
          ["Total Target", `$${(properties.reduce((s,p)=>s+p.targetAmount,0)/1000).toFixed(0)}K`, t.green],
          ["Total Raised",  `$${(properties.reduce((s,p)=>s+p.raisedAmount,0)/1000).toFixed(0)}K`, t.gold],
          ["Open Listings", properties.filter(p=>p.status==="open"&&p.active).length, t.cyan],
        ].map(([l,v,c])=>(
          <div key={l} style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:12, padding:"16px 18px" }}>
            <div style={{ fontSize:12, color:t.muted, marginBottom:6 }}>{l}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:700, color:c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Property list */}
      {properties.length === 0 ? (
        <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14,
          padding:48, textAlign:"center", color:t.muted, fontSize:14 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🏗️</div>
          No properties yet. Click "Add Property" to create your first listing.
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {properties.map(p => (
            <div key={p.id} style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14,
              padding:"18px 20px", display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>
              {/* Thumbnail */}
              <div style={{ width:80, height:80, borderRadius:10, background:t.navyLight, flexShrink:0, overflow:"hidden" }}>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🏠</div>
                }
              </div>
              {/* Info */}
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>{p.title}</span>
                  <span style={{ background:`${typeColor[p.type]}20`, color:typeColor[p.type], fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20 }}>{p.type}</span>
                  <span style={{ background:p.status==="open"?t.greenDim:t.goldDim, color:p.status==="open"?t.green:t.gold, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20 }}>{p.status}</span>
                  {!p.active && <span style={{ background:`rgba(106,143,176,0.12)`, color:t.muted, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20 }}>Hidden</span>}
                </div>
                <div style={{ fontSize:12, color:t.muted, marginBottom:10 }}>📍 {p.location}</div>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap", fontSize:12 }}>
                  <span style={{ color:t.green }}>{p.annualReturn}%/yr</span>
                  <span style={{ color:t.muted }}>{p.durationMonths} months</span>
                  <span style={{ color:t.cyan }}>Min ${p.minInvestment?.toLocaleString()}</span>
                  <span style={{ color:t.muted }}>{p.investorCount} investors</span>
                </div>
                {/* Funding bar */}
                <div style={{ marginTop:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:t.muted, marginBottom:4 }}>
                    <span>${p.raisedAmount?.toLocaleString()} raised</span>
                    <span>{p.fundingPct}% of ${p.targetAmount?.toLocaleString()}</span>
                  </div>
                  <div style={{ height:4, background:t.navyBorder, borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${p.fundingPct}%`, background:`linear-gradient(90deg,${t.cyan},${t.green})`, borderRadius:2 }} />
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <Btn onClick={()=>setEditProp(p)} color={t.navyLight} textColor={t.white} outline size="xs">{Ico.edit} Edit</Btn>
                <Btn onClick={()=>toggleActive(p)} color={p.active?t.orange:t.green} textColor="#fff" size="xs">
                  {p.active ? "Hide" : "Show"}
                </Btn>
                <Btn onClick={()=>setDelId(p.id)} color={t.red} textColor="#fff" size="xs" outline>{Ico.trash}</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB 7: SETTINGS ─────────────────────────────────────────────────────────
function SettingsTab({ settings: s, setSettings: setS }) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [saveErr,setSaveErr]= useState("");

  const [newCoin, setNewCoin] = useState({ symbol:"", name:"", network:"", wallet:"" });
  const [addErr,  setAddErr]  = useState("");

  const upd = (k) => (e) => setS(prev=>({...prev,[k]: e.target.type==="checkbox"?e.target.checked:e.target.value}));
  const updCoin   = (symbol, field, value) => setS(prev=>({ ...prev, coins: prev.coins.map(c=>c.symbol===symbol?{...c,[field]:value}:c) }));
  const removeCoin = (symbol) => setS(prev=>({ ...prev, coins: prev.coins.filter(c=>c.symbol!==symbol) }));
  const addCoin   = () => {
    const sym = newCoin.symbol.trim().toUpperCase();
    if (!sym || !newCoin.name.trim()) { setAddErr("Symbol and name are required."); return; }
    if (s.coins.find(c=>c.symbol===sym)) { setAddErr(`${sym} already exists.`); return; }
    setS(prev=>({ ...prev, coins:[...prev.coins, { symbol:sym, name:newCoin.name.trim(), network:newCoin.network.trim()||sym, wallet:newCoin.wallet.trim(), active:true }] }));
    setNewCoin({ symbol:"", name:"", network:"", wallet:"" });
    setAddErr("");
  };

  const save = async () => {
    setSaving(true); setSaveErr("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const d = await res.json();
      if (res.ok) { if (d.settings) setS(d.settings); setSaved(true); setTimeout(()=>setSaved(false), 2500); }
      else { setSaveErr(d.error || "Failed to save."); }
    } catch { setSaveErr("Something went wrong."); }
    finally { setSaving(false); }
  };

  return (
    <div className="tab-content">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700 }}>Site Settings</h2>
          <p style={{ fontSize:13, color:t.muted, marginTop:2 }}>Configure global platform behaviour</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {saved   && <span style={{ fontSize:13, color:t.green, animation:"fadeIn .3s ease" }}>✅ Settings saved!</span>}
          {saveErr && <span style={{ fontSize:13, color:t.red }}>{saveErr}</span>}
          <Btn onClick={save} color={t.cyan} textColor={t.navy} size="md" disabled={saving}>{saving?"Saving…":<>{Ico.check} Save Settings</>}</Btn>
        </div>
      </div>

      {/* General */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"22px 24px", marginBottom:20 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:t.cyan, marginBottom:18 }}>General</div>
        <div className="settings-grid">
          <FormInput label="Site Name"    value={s.siteName}  onChange={upd("siteName")}  placeholder="CrestCapital" />
          <FormInput label="Tagline"      value={s.tagline}   onChange={upd("tagline")}   placeholder="Tagline…" />
        </div>
        <div style={{ display:"flex", gap:24, flexWrap:"wrap", marginTop:4 }}>
          <Toggle value={s.maintenance}       onChange={()=>setS(p=>({...p,maintenance:!p.maintenance}))}       label="Maintenance Mode" />
          <Toggle value={s.emailNotifs}        onChange={()=>setS(p=>({...p,emailNotifs:!p.emailNotifs}))}        label="Email Notifications" />
          <Toggle value={s.twoFARequired}      onChange={()=>setS(p=>({...p,twoFARequired:!p.twoFARequired}))}      label="Require 2FA for all users" />
          <Toggle value={s.withdrawalApproval} onChange={()=>setS(p=>({...p,withdrawalApproval:!p.withdrawalApproval}))} label="Manual Withdrawal Approval" />
        </div>
        {s.maintenance && (
          <div style={{ marginTop:14, background:`${t.red}11`, border:`1px solid ${t.red}33`, borderRadius:10, padding:"10px 14px", fontSize:13, color:t.red }}>
            ⚠️ Maintenance mode is ON — the site will be inaccessible to regular users.
          </div>
        )}
      </div>

      {/* Limits */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"22px 24px", marginBottom:20 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:t.cyan, marginBottom:18 }}>Deposit & Withdrawal Limits</div>
        <div className="settings-grid">
          <FormInput label="Min Deposit ($)"    value={s.minDeposit}  onChange={upd("minDeposit")}  type="number" />
          <FormInput label="Max Deposit ($)"    value={s.maxDeposit}  onChange={upd("maxDeposit")}  type="number" />
          <FormInput label="Min Withdrawal ($)" value={s.minWithdraw} onChange={upd("minWithdraw")} type="number" />
          <FormInput label="Max Withdrawal ($)" value={s.maxWithdraw} onChange={upd("maxWithdraw")} type="number" />
        </div>
        <div style={{ maxWidth:280 }}>
          <FormInput label="Referral Commission Rate (%)" value={s.referralRate} onChange={upd("referralRate")} type="number" min="0" max="50" />
        </div>
      </div>

      {/* Coins */}
      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14, padding:"22px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:t.cyan }}>
            Deposit Wallet Addresses
          </div>
          <div style={{ fontSize:12, color:t.muted }}>{s.coins.filter(c=>c.active&&c.wallet).length} active</div>
        </div>

        {/* Existing coins */}
        <div className="coin-grid" style={{ marginBottom:24 }}>
          {(s.coins||[]).map(coin => (
            <div key={coin.symbol} style={{ background:t.navyLight, border:`1px solid ${coin.active?t.cyan+"33":t.navyBorder}`, borderRadius:12, padding:"14px 16px", position:"relative" }}>
              {/* Remove button */}
              <button onClick={()=>removeCoin(coin.symbol)}
                title="Remove coin"
                style={{ position:"absolute", top:8, right:8, width:20, height:20, borderRadius:4, background:`${t.red}22`,
                  border:`1px solid ${t.red}44`, color:t.red, cursor:"pointer", fontSize:11, lineHeight:1,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                ×
              </button>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, paddingRight:24 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:coin.active?t.cyan:t.muted }}>{coin.symbol}</div>
                  <div style={{ fontSize:11, color:t.muted }}>{coin.name}</div>
                </div>
                <Toggle value={coin.active} onChange={()=>updCoin(coin.symbol,"active",!coin.active)} />
              </div>

              {coin.active && (
                <div>
                  <label style={{ fontSize:11, color:t.muted, display:"block", marginBottom:4 }}>Network</label>
                  <input value={coin.network||""} onChange={e=>updCoin(coin.symbol,"network",e.target.value)}
                    className="cc-input" placeholder="e.g. ERC-20, TRC-20, BSC…"
                    style={{ width:"100%", background:t.navy, border:`1px solid ${t.navyBorder}`, borderRadius:8, padding:"7px 10px", color:t.white, fontSize:11, marginBottom:8, transition:"all .2s" }}
                  />
                  <label style={{ fontSize:11, color:t.muted, display:"block", marginBottom:4 }}>Wallet Address</label>
                  <input value={coin.wallet||""} onChange={e=>updCoin(coin.symbol,"wallet",e.target.value)}
                    className="cc-input" placeholder="Paste wallet address…"
                    style={{ width:"100%", background:t.navy, border:`1px solid ${t.navyBorder}`, borderRadius:8, padding:"7px 10px", color:t.white, fontSize:11, transition:"all .2s" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new coin */}
        <div style={{ borderTop:`1px solid ${t.navyBorder}`, paddingTop:20 }}>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:14 }}>+ Add New Coin</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:11, color:t.muted, display:"block", marginBottom:4 }}>Symbol *</label>
              <input value={newCoin.symbol} onChange={e=>{ setNewCoin(p=>({...p,symbol:e.target.value})); setAddErr(""); }}
                className="cc-input" placeholder="e.g. LTC"
                style={{ width:"100%", background:t.navyLight, border:`1px solid ${t.navyBorder}`, borderRadius:8, padding:"9px 12px", color:t.white, fontSize:13, transition:"all .2s" }}
              />
            </div>
            <div>
              <label style={{ fontSize:11, color:t.muted, display:"block", marginBottom:4 }}>Name *</label>
              <input value={newCoin.name} onChange={e=>{ setNewCoin(p=>({...p,name:e.target.value})); setAddErr(""); }}
                className="cc-input" placeholder="e.g. Litecoin"
                style={{ width:"100%", background:t.navyLight, border:`1px solid ${t.navyBorder}`, borderRadius:8, padding:"9px 12px", color:t.white, fontSize:13, transition:"all .2s" }}
              />
            </div>
            <div>
              <label style={{ fontSize:11, color:t.muted, display:"block", marginBottom:4 }}>Network</label>
              <input value={newCoin.network} onChange={e=>setNewCoin(p=>({...p,network:e.target.value}))}
                className="cc-input" placeholder="e.g. Litecoin, Polygon…"
                style={{ width:"100%", background:t.navyLight, border:`1px solid ${t.navyBorder}`, borderRadius:8, padding:"9px 12px", color:t.white, fontSize:13, transition:"all .2s" }}
              />
            </div>
            <div>
              <label style={{ fontSize:11, color:t.muted, display:"block", marginBottom:4 }}>Wallet Address</label>
              <input value={newCoin.wallet} onChange={e=>setNewCoin(p=>({...p,wallet:e.target.value}))}
                className="cc-input" placeholder="Paste address (optional)"
                style={{ width:"100%", background:t.navyLight, border:`1px solid ${t.navyBorder}`, borderRadius:8, padding:"9px 12px", color:t.white, fontSize:13, transition:"all .2s" }}
              />
            </div>
          </div>
          {addErr && <div style={{ fontSize:12, color:t.red, marginBottom:10 }}>⚠ {addErr}</div>}
          <Btn onClick={addCoin} color={t.cyan} textColor={t.navy}>{Ico.plus} Add Coin</Btn>
          <span style={{ fontSize:12, color:t.muted, marginLeft:12 }}>
            Click <strong style={{ color:t.white }}>Save Settings</strong> above to persist all changes.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const router  = useRouter();
  const { data: session, status } = useSession();

  const [tab,        setTab]        = useState("overview");
  const [users,      setUsers]      = useState(INIT_USERS);
  const [txns,       setTxns]       = useState(INIT_TRANSACTIONS);
  const [plans,      setPlans]      = useState(INIT_PLANS);
  const [kyc,        setKyc]        = useState(INIT_KYC);
  const [settings,   setSettings]   = useState(INIT_SETTINGS);
  const [notifs,     setNotifs]     = useState(INIT_NOTIFS);
  const [showNotifs, setShowNotifs] = useState(false);
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/dashboard");
  }, [status, session, router]);

  // ── Fetch all admin data once the session confirms admin role ───────────────
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;
    let alive = true;

    // Safely parse a response — never throws, returns null on empty/bad body
    const safeJson = async (res) => {
      try {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      } catch (e) {
        console.warn("[admin load] bad JSON from", res.url, e.message);
        return null;
      }
    };

    async function load() {
      try {
        const [uRes, txRes, plRes, kycRes, stRes, notifsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/transactions"),
          fetch("/api/admin/plans"),
          fetch("/api/admin/kyc"),
          fetch("/api/admin/settings"),
          fetch("/api/admin/notifications"),
        ]);
        if (!alive) return;

        const [uData, txData, plData, kycData, stData, notifsData] = await Promise.all([
          safeJson(uRes), safeJson(txRes), safeJson(plRes),
          safeJson(kycRes), safeJson(stRes), safeJson(notifsRes),
        ]);

        if (Array.isArray(uData)      && uData.length)     setUsers(uData);
        if (Array.isArray(txData)     && txData.length)    setTxns(txData);
        if (Array.isArray(plData)     && plData.length)    setPlans(plData);
        if (Array.isArray(kycData)    && kycData.length)   setKyc(kycData);
        if (stData?.siteName)                              setSettings(prev => ({ ...prev, ...stData }));
        if (Array.isArray(notifsData) && notifsData.length) setNotifs(notifsData);
      } catch (err) {
        console.error("[admin load]", err);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [status, session]);

  // ── Refresh helpers ────────────────────────────────────────────────────────
  const parseJson = async (res) => {
    try { const t = await res.text(); return t ? JSON.parse(t) : null; } catch { return null; }
  };

  const refreshUsers = useCallback(async () => {
    try { const d = await fetch("/api/admin/users").then(parseJson); if (Array.isArray(d)) setUsers(d); } catch {}
  }, []);
  const refreshTxns = useCallback(async () => {
    try { const d = await fetch("/api/admin/transactions").then(parseJson); if (Array.isArray(d)) setTxns(d); } catch {}
  }, []);
  const refreshKyc = useCallback(async () => {
    try { const d = await fetch("/api/admin/kyc").then(parseJson); if (Array.isArray(d)) setKyc(d); } catch {}
  }, []);
  const refreshPlans = useCallback(async () => {
    try { const d = await fetch("/api/admin/plans").then(parseJson); if (Array.isArray(d)) setPlans(d); } catch {}
  }, []);

  // ── Action handlers ─────────────────────────────────────────────────────────

  /** Users: credit balance (optimistic update) */
  const handleCreditBalance = useCallback((id, amount) => {
    setUsers(prev => prev.map(u => u.id===id
      ? { ...u, balance: (u.balance||0) + amount, deposited: (u.deposited||0) + amount }
      : u
    ));
    // API call already done inside CreditBalanceModal — no extra call needed here
  }, []);

  /** Users: suspend / reinstate / verifyKYC */
  const handleToggleSuspend = useCallback(async (id) => {
    const u = users.find(x=>x.id===id);
    if (!u) return;
    const action = u.status==="suspended" ? "reinstate" : "suspend";
    // Optimistic update
    setUsers(prev => prev.map(x => x.id===id ? {...x, status: action==="suspend"?"suspended":"active"} : x));
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action }),
      });
      if (!res.ok) refreshUsers(); // revert on failure
    } catch { refreshUsers(); }
  }, [users, refreshUsers]);

  const handleVerifyKYC = useCallback(async (id) => {
    setUsers(prev => prev.map(x => x.id===id ? {...x, kyc:"verified"} : x));
    try {
      await fetch(`/api/admin/users?id=${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action:"verifyKYC" }),
      });
    } catch { refreshUsers(); }
  }, [refreshUsers]);

  /** Users: cancel / freeze / unfreeze investment */
  const handleInvestmentAction = useCallback(async (userId, investmentId, action) => {
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action, investmentId }),
      });
      if (res.ok) {
        if (action === "cancelInvestment") refreshUsers(); // balance changed
        return true;
      }
      return false;
    } catch { return false; }
  }, [refreshUsers]);

  /** Transactions: approve / reject */
  const handleTxAction = useCallback(async (tx, action, note="") => {
    const mongoId = tx._id || tx.id;
    // Optimistic update
    setTxns(prev => prev.map(x =>
      (x._id===mongoId || x.id===tx.id) ? {...x, status: action==="approve"?"completed":"rejected"} : x
    ));
    try {
      const res = await fetch(`/api/admin/transactions?id=${mongoId}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action, note }),
      });
      if (!res.ok) refreshTxns(); else refreshUsers(); // balance changed
    } catch { refreshTxns(); }
  }, [refreshTxns, refreshUsers]);

  /** Plans: create or update */
  const handlePlanSave = useCallback(async (data) => {
    const isNew = !data.id || typeof data.id === "number"; // numeric = local mock; string = real MongoDB id
    if (isNew) {
      // Optimistic add
      const tempId = `_tmp_${Date.now()}`;
      setPlans(prev => [...prev, { ...data, id:tempId, investments:0, totalInvested:0 }]);
      try {
        const res = await fetch("/api/admin/plans", {
          method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data),
        });
        if (res.ok) refreshPlans();
        else setPlans(prev => prev.filter(p=>p.id!==tempId));
      } catch { setPlans(prev => prev.filter(p=>p.id!==tempId)); }
    } else {
      setPlans(prev => prev.map(p => p.id===data.id ? {...p,...data} : p));
      try {
        const res = await fetch(`/api/admin/plans?id=${data.id}`, {
          method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data),
        });
        if (!res.ok) refreshPlans();
      } catch { refreshPlans(); }
    }
  }, [refreshPlans]);

  const handlePlanToggle = useCallback(async (id) => {
    const plan = plans.find(p=>p.id===id);
    if (!plan) return;
    setPlans(prev => prev.map(p => p.id===id ? {...p, active:!p.active} : p));
    try {
      await fetch(`/api/admin/plans?id=${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ active:!plan.active }),
      });
    } catch { refreshPlans(); }
  }, [plans, refreshPlans]);

  const handlePlanDelete = useCallback(async (id) => {
    setPlans(prev => prev.filter(p=>p.id!==id));
    try {
      await fetch(`/api/admin/plans?id=${id}`, { method:"DELETE" });
    } catch { refreshPlans(); }
  }, [refreshPlans]);

  /** KYC: approve / reject */
  const handleKycDecide = useCallback(async (id, status, note) => {
    setKyc(prev => prev.map(k => k.id===id ? {...k, status, notes:note} : k));
    // Sync user KYC badge
    const item = kyc.find(k=>k.id===id);
    if (item?.userId) {
      setUsers(prev => prev.map(u => u.id===item.userId
        ? {...u, kyc: status==="approved"?"verified":"unverified"} : u));
    }
    try {
      const res = await fetch(`/api/admin/kyc?id=${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action:status, note }),
      });
      if (!res.ok) refreshKyc();
    } catch { refreshKyc(); }
  }, [kyc, refreshKyc]);

  // ── Notifications helpers ──────────────────────────────────────────────────
  const unreadCount = notifs.filter(n=>!n.read).length;
  const markAllRead = async () => {
    setNotifs(prev => prev.map(n=>({...n,read:true})));
    try { await fetch("/api/admin/notifications", { method:"PUT" }); } catch {}
  };

  // Close notif dropdown on outside click
  useEffect(() => {
    const fn = () => setShowNotifs(false);
    if (showNotifs) { setTimeout(()=>document.addEventListener("click",fn),0); }
    return () => document.removeEventListener("click",fn);
  }, [showNotifs]);

  const navigate = (id) => { setTab(id); setSearch(""); };

  const TAB_TITLES = { overview:"Overview", users:"User Management", transactions:"Transactions", plans:"Investment Plans", realestate:"Real Estate", kyc:"KYC Review", reports:"Reports & Analytics", settings:"Site Settings" };

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (status === "loading" || (loading && status === "authenticated")) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight:"100vh", background:t.navy, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
          <div style={{ width:44, height:44, border:`3px solid ${t.navyBorder}`, borderTopColor:t.cyan, borderRadius:"50%", animation:"spin .8s linear infinite" }} />
          <span style={{ color:t.muted, fontSize:14 }}>Loading admin panel…</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="dash-layout" style={{ background:t.navy, color:t.white, fontFamily:"'DM Sans',sans-serif" }}>
        <Sidebar
          active={tab}
          onNav={navigate}
          adminName={session?.user?.name  || "Super Admin"}
          adminEmail={session?.user?.email || "admin@crestcapital.com"}
          onSignOut={() => signOut({ callbackUrl:"/auth/login" })}
        />
        <div style={{ minWidth:0, display:"flex", flexDirection:"column" }}>
          <TopBar
            title={TAB_TITLES[tab]}
            notifCount={unreadCount}
            showNotifs={showNotifs}
            setShowNotifs={setShowNotifs}
            notifs={notifs}
            onMarkRead={markAllRead}
            searchQuery={search}
            setSearchQuery={setSearch}
          />
          <main className="dash-main" style={{ padding:"24px 28px", flex:1 }}>
            {tab==="overview"     && <OverviewTab      users={users} transactions={txns} />}
            {tab==="users"        && <UsersTab         users={users} onToggleSuspend={handleToggleSuspend} onVerifyKYC={handleVerifyKYC} onCreditBalance={handleCreditBalance} onInvestmentAction={handleInvestmentAction} searchQuery={search} />}
            {tab==="transactions" && <TransactionsTab  transactions={txns} onAction={handleTxAction} searchQuery={search} />}
            {tab==="plans"        && <PlansTab         plans={plans} onSavePlan={handlePlanSave} onToggleActive={handlePlanToggle} onDeletePlan={handlePlanDelete} />}
            {tab==="realestate"   && <RealEstateTab />}
            {tab==="kyc"          && <KYCTab           kyc={kyc} onDecide={handleKycDecide} />}
            {tab==="reports"      && <ReportsTab />}
            {tab==="settings"     && <SettingsTab settings={settings} setSettings={setSettings} />}
          </main>
        </div>
        <MobileNav active={tab} onNav={navigate} />
      </div>
    </>
  );
}
