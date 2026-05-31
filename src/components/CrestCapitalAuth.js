// ============================================================
//  CrestCapital — Auth System  (Step 2 / Phase 2)
//
//  FILE LOCATION:  src/app/auth/page.jsx
//                  OR src/pages/auth.jsx
//
//  SCREENS INCLUDED:
//    1. Login
//    2. Sign Up (multi-step: personal info → password → done)
//    3. OTP Verification
//    4. PIN Setup / PIN Login
//    5. Forgot Password (email → OTP → new password → done)
//
//  Usage: <CrestCapitalAuth />
//  Props: initialScreen="login" | "signup" | "forgot"
// ============================================================

"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

// ─── THEME (matches landing page) ─────────────────────────────────────────────
const t = {
  navy:       "#050d1a",
  navyMid:    "#08142a",
  navyLight:  "#0f2040",
  navyCard:   "rgba(10,22,40,0.95)",
  navyBorder: "#1a3a6b",
  cyan:       "#00d4ff",
  cyanDim:    "#00a8cc",
  cyanGlow:   "rgba(0,212,255,0.18)",
  cyanGlow2:  "rgba(0,212,255,0.07)",
  red:        "#ff4d6d",
  green:      "#00e096",
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
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${t.navy}; }
  ::-webkit-scrollbar-thumb { background:${t.navyBorder}; border-radius:3px; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes slideIn   { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes glow      { 0%,100%{box-shadow:0 0 10px ${t.cyan}} 50%{box-shadow:0 0 28px ${t.cyan}} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes shake     { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
  @keyframes checkPop  { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }

  /* Auth card animation */
  .auth-card { animation: fadeUp .5s ease both; }
  .screen-slide { animation: slideIn .35s ease both; }

  /* Input / Select focus ring */
  .cc-input:focus { outline:none; border-color:${t.cyan} !important; box-shadow:0 0 0 3px ${t.cyanGlow2}; }
  .cc-input::placeholder { color:${t.muted}; }
  select.cc-input option { background:#050d1a; color:#eef5ff; }

  /* Responsive */
  .auth-layout { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
  .auth-panel   { display:flex; }

  @media (max-width:900px) {
    .auth-layout  { grid-template-columns:1fr; }
    .auth-panel   { display:none; }
  }
  @media (max-width:480px) {
    .auth-card-wrap { padding:16px !important; }
    .pin-grid { gap:10px !important; }
    .otp-grid { gap:8px !important; }
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const GlowOrb = ({ style }) => (
  <div style={{ position:"absolute", borderRadius:"50%", filter:"blur(80px)", pointerEvents:"none", ...style }} />
);

const Logo = ({ onClick }) => (
  <div onClick={onClick} style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22,
    letterSpacing:"-0.5px", display:"flex", alignItems:"center", gap:8, cursor:"pointer", marginBottom:36 }}>
    <span style={{ width:8, height:8, borderRadius:"50%", background:t.cyan,
      boxShadow:`0 0 14px ${t.cyan}`, display:"inline-block", animation:"glow 2s infinite" }} />
    CrestCapital
  </div>
);

const Label = ({ children, required }) => (
  <label style={{ fontSize:12, fontWeight:600, letterSpacing:"0.5px", color:t.mutedLight,
    display:"block", marginBottom:7, textTransform:"uppercase" }}>
    {children}{required && <span style={{ color:t.cyan, marginLeft:3 }}>*</span>}
  </label>
);

const Input = ({ label, required, error, icon, suffix, style, ...props }) => (
  <div style={{ marginBottom:18, ...style }}>
    {label && <Label required={required}>{label}</Label>}
    <div style={{ position:"relative" }}>
      {icon && (
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
          fontSize:16, color:t.muted, pointerEvents:"none", zIndex:1 }}>{icon}</span>
      )}
      <input className="cc-input" {...props} style={{
        width:"100%", background:"rgba(15,32,64,0.6)", border:`1px solid ${error ? t.red : t.navyBorder}`,
        borderRadius:10, padding:`13px ${suffix ? "44px" : "14px"} 13px ${icon ? "42px" : "14px"}`,
        color:t.white, fontSize:15, fontFamily:"'DM Sans',sans-serif", transition:"border-color .2s,box-shadow .2s",
      }} />
      {suffix && (
        <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
          color:t.muted, cursor:"pointer", userSelect:"none", fontSize:16 }}>{suffix}</span>
      )}
    </div>
    {error && <div style={{ fontSize:12, color:t.red, marginTop:5, display:"flex", alignItems:"center", gap:4 }}>⚠ {error}</div>}
  </div>
);

const BtnPrimary = ({ children, onClick, loading, disabled, style, type="button" }) => (
  <button type={type} onClick={onClick} disabled={disabled || loading}
    style={{ fontFamily:"'DM Sans',sans-serif", cursor: disabled||loading ? "not-allowed" : "pointer",
      border:"none", borderRadius:10, fontWeight:700, transition:"all .22s", width:"100%",
      background: disabled||loading ? "rgba(0,212,255,0.3)" : `linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
      color:t.navy, padding:"14px 28px", fontSize:15,
      boxShadow: disabled||loading ? "none" : `0 6px 28px ${t.cyanGlow}`, display:"flex",
      alignItems:"center", justifyContent:"center", gap:8, ...style }}
    onMouseEnter={e=>{ if(!disabled&&!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 10px 36px ${t.cyanGlow}`;} }}
    onMouseLeave={e=>{ e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=disabled||loading?"none":`0 6px 28px ${t.cyanGlow}`; }}>
    {loading && <span style={{ width:16, height:16, border:`2px solid ${t.navy}`, borderTopColor:"transparent",
      borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }} />}
    {children}
  </button>
);

const BtnSecondary = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{ fontFamily:"'DM Sans',sans-serif", cursor:"pointer",
    background:"transparent", border:`1px solid ${t.navyBorder}`, color:t.white,
    padding:"13px 28px", fontSize:15, borderRadius:10, width:"100%", fontWeight:500,
    transition:"all .22s", ...style }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=t.cyan;e.currentTarget.style.color=t.cyan;}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=t.navyBorder;e.currentTarget.style.color=t.white;}}>
    {children}
  </button>
);

const Divider = ({ text }) => (
  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0" }}>
    <div style={{ flex:1, height:1, background:t.navyBorder }} />
    {text && <span style={{ fontSize:12, color:t.muted, whiteSpace:"nowrap" }}>{text}</span>}
    <div style={{ flex:1, height:1, background:t.navyBorder }} />
  </div>
);

const PasswordStrength = ({ password }) => {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const labels = ["","Weak","Fair","Good","Strong"];
  const colors = ["","#ff4d6d","#ffaa00","#00c9a7",t.cyan];
  if (!password) return null;
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:"flex", gap:4, marginBottom:5 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2,
            background: i <= score ? colors[score] : t.navyBorder,
            transition:"background .3s" }} />
        ))}
      </div>
      <div style={{ fontSize:11, color:colors[score], fontWeight:600 }}>{labels[score]}</div>
    </div>
  );
};

// ─── LEFT PANEL (decorative) ──────────────────────────────────────────────────
function AuthPanel() {
  const features = [
    { icon:"🔐", text:"Bank-grade 256-bit encryption" },
    { icon:"⚡", text:"Instant deposits & withdrawals" },
    { icon:"📈", text:"Daily returns up to 3.5%" },
    { icon:"🌍", text:"Available in 100+ countries" },
    { icon:"🤖", text:"AI-powered portfolio management" },
  ];
  return (
    <div className="auth-panel" style={{ background:`linear-gradient(160deg,${t.navyMid},${t.navyLight})`,
      borderRight:`1px solid ${t.navyBorder}`, flexDirection:"column", justifyContent:"center",
      alignItems:"center", padding:"60px 48px", position:"relative", overflow:"hidden" }}>

      <GlowOrb style={{ width:400, height:400, background:"rgba(0,212,255,0.08)", top:"10%", left:"30%", transform:"translateX(-50%)" }} />
      <GlowOrb style={{ width:250, height:250, background:"rgba(0,80,200,0.1)", bottom:"15%", right:"10%" }} />

      {/* Grid overlay */}
      <div style={{ position:"absolute", inset:0,
        backgroundImage:`linear-gradient(rgba(0,212,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.025) 1px,transparent 1px)`,
        backgroundSize:"48px 48px" }} />

      <div style={{ position:"relative", zIndex:1, maxWidth:400, width:"100%" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32,
          letterSpacing:"-1px", lineHeight:1.15, marginBottom:16,
          background:`linear-gradient(140deg,${t.white} 40%,${t.cyan})`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          Invest Smarter.<br />Grow Faster.<br />Withdraw Freely.
        </div>
        <p style={{ color:t.muted, fontSize:15, lineHeight:1.75, marginBottom:40 }}>
          Join thousands of investors building wealth with CrestCapital's AI-powered digital investment platform.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:14,
              background:"rgba(10,22,40,0.7)", border:`1px solid ${t.navyBorder}`,
              borderRadius:12, padding:"14px 18px", animation:`fadeUp .5s ${i*0.08}s ease both` }}>
              <span style={{ fontSize:20 }}>{f.icon}</span>
              <span style={{ fontSize:14, color:t.mutedLight, fontWeight:500 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:36 }}>
          {[["$280M+","Managed"],["42K+","Investors"],["100+","Countries"]].map(([n,l],i)=>(
            <div key={i} style={{ textAlign:"center", background:"rgba(10,22,40,0.7)",
              border:`1px solid ${t.navyBorder}`, borderRadius:10, padding:"14px 8px" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:t.cyan }}>{n}</div>
              <div style={{ fontSize:11, color:t.muted, marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: LOGIN ────────────────────────────────────────────────────────────
function LoginScreen({ onSwitch, onSuccess }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email address";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); setShake(true); setTimeout(()=>setShake(false),600); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/check-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        const msg = data.needsVerification
          ? "Please verify your email first."
          : data.error || "Invalid email or password.";
        setErrors({ password: msg });
        setShake(true); setTimeout(()=>setShake(false),600);
        return;
      }
      onSuccess(form.email, form.password);
    } catch {
      setLoading(false);
      setErrors({ password: "Connection error. Please try again." });
    }
  };

  return (
    <div className="screen-slide" style={{ animation: shake ? "shake .4s ease" : undefined }}>
      <Logo onClick={() => onSwitch("login")} />

      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(24px,4vw,32px)",
        letterSpacing:"-0.8px", marginBottom:8 }}>Welcome back</h1>
      <p style={{ color:t.muted, fontSize:15, marginBottom:32 }}>
        Log in to your CrestCapital account
      </p>

      <Input label="Email Address" required type="email" placeholder="you@example.com"
        icon="✉️" value={form.email} error={errors.email}
        onChange={e => setForm(f=>({...f,email:e.target.value}))} />

      <Input label="Password" required type={showPass?"text":"password"} placeholder="Enter your password"
        icon="🔒" value={form.password} error={errors.password}
        suffix={<span onClick={()=>setShowPass(s=>!s)}>{showPass?"🙈":"👁️"}</span>}
        onChange={e => setForm(f=>({...f,password:e.target.value}))} />

      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:24, marginTop:-10 }}>
        <span style={{ fontSize:13, color:t.cyan, cursor:"pointer", fontWeight:500 }}
          onClick={()=>onSwitch("forgot")}>Forgot password?</span>
      </div>

      <BtnPrimary onClick={submit} loading={loading}>Login to Account</BtnPrimary>

      <Divider text="or continue with" />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
        {[
          { id:"google", label:"Google", icon:<svg width="16" height="16" viewBox="0 0 24 24" style={{marginRight:8,verticalAlign:"middle"}}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
          { id:"apple",  label:"Apple",  icon:<svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor" style={{marginRight:8,verticalAlign:"middle"}}><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 482.7 0 367.7 0 257.9c0-156.7 101.8-239.6 201.2-239.6 66.5 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg> },
        ].map(({id,label,icon})=>(
          <button key={id} style={{ background:"transparent", border:`1px solid ${t.navyBorder}`,
            color:t.white, padding:"12px", borderRadius:10, fontSize:14, fontWeight:500,
            cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s",
            display:"flex", alignItems:"center", justifyContent:"center" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=t.cyan;e.currentTarget.style.color=t.cyan;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=t.navyBorder;e.currentTarget.style.color=t.white;}}>
            {icon}{label}
          </button>
        ))}
      </div>

      <p style={{ textAlign:"center", fontSize:14, color:t.muted }}>
        Don't have an account?{" "}
        <span style={{ color:t.cyan, fontWeight:600, cursor:"pointer" }} onClick={()=>onSwitch("signup")}>
          Sign up free
        </span>
      </p>
    </div>
  );
}

// ─── SCREEN: SIGN UP (multi-step) ─────────────────────────────────────────────
function SignupScreen({ onSwitch, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = personal, 2 = password, 3 = done
  const [form, setForm] = useState(() => {
    // Auto-fill referral code from URL (?ref=CODE) or cookie (set by /ref/CODE page)
    let ref = "";
    if (typeof window !== "undefined") {
      const urlRef = new URLSearchParams(window.location.search).get("ref");
      if (urlRef) {
        ref = urlRef.toUpperCase();
      } else {
        const cookieRef = document.cookie.split(";").find(c => c.trim().startsWith("ref="));
        if (cookieRef) ref = cookieRef.split("=")[1]?.trim().toUpperCase() || "";
      }
    }
    return { firstName:"", lastName:"", email:"", phone:"", username:"", referral:ref, password:"", confirm:"", agree:false };
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const validateStep1 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim())  e.lastName  = "Last name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email";
    if (!form.username.trim())  e.username  = "Username is required";
    return e;
  };
  const validateStep2 = () => {
    const e = {};
    if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!form.agree) e.agree = "You must accept the terms";
    return e;
  };

  const nextStep = async () => {
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      const e = validateStep2();
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({});
      setLoading(true);
      try {
        const res  = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName:    form.firstName,
            lastName:     form.lastName,
            username:     form.username,
            email:        form.email,
            phone:        form.phone,
            password:     form.password,
            referralCode: form.referral,
          }),
        });
        const data = await res.json();
        setLoading(false);
        if (!res.ok) { setErrors({ confirm: data.error || "Registration failed. Please try again." }); return; }
        onSuccess("otp", form.email, form.password);
      } catch {
        setLoading(false);
        setErrors({ confirm: "Connection error. Please try again." });
      }
    }
  };

  const StepBar = () => (
    <div style={{ display:"flex", gap:8, marginBottom:32, alignItems:"center" }}>
      {["Personal Info","Security","Verify"].map((label, i) => {
        const idx = i + 1;
        const active = idx === step;
        const done   = idx < step;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : undefined }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0,
                background: done ? t.cyan : active ? "transparent" : "transparent",
                border:`2px solid ${done ? t.cyan : active ? t.cyan : t.navyBorder}`,
                color: done ? t.navy : active ? t.cyan : t.muted }}>
                {done ? "✓" : idx}
              </div>
              <span style={{ fontSize:10, color: active ? t.cyan : t.muted, fontWeight: active ? 600 : 400, whiteSpace:"nowrap" }}>
                {label}
              </span>
            </div>
            {i < 2 && <div style={{ flex:1, height:2, background: done ? t.cyan : t.navyBorder,
              margin:"0 6px", marginBottom:16, transition:"background .3s" }} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="screen-slide">
      <Logo onClick={() => onSwitch("login")} />
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(22px,4vw,30px)",
        letterSpacing:"-0.8px", marginBottom:8 }}>Create your account</h1>
      <p style={{ color:t.muted, fontSize:15, marginBottom:28 }}>
        Join thousands of investors growing with CrestCapital
      </p>

      <StepBar />

      {step === 1 && (
        <div className="screen-slide">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Input label="First Name" required placeholder="John" icon="👤"
              value={form.firstName} error={errors.firstName}
              onChange={e=>set("firstName",e.target.value)} />
            <Input label="Last Name" required placeholder="Smith" icon="👤"
              value={form.lastName} error={errors.lastName}
              onChange={e=>set("lastName",e.target.value)} />
          </div>
          <Input label="Email Address" required type="email" placeholder="john@example.com" icon="✉️"
            value={form.email} error={errors.email}
            onChange={e=>set("email",e.target.value)} />
          <Input label="Username" required placeholder="johnsmith" icon="@"
            value={form.username} error={errors.username}
            onChange={e=>set("username",e.target.value)} />
          <Input label="Phone Number" type="tel" placeholder="+1 234 567 8900" icon="📞"
            value={form.phone}
            onChange={e=>set("phone",e.target.value)} />
          <Input label="Referral Code" placeholder="Optional" icon="🔗"
            value={form.referral}
            onChange={e=>set("referral",e.target.value)} />
          <BtnPrimary onClick={nextStep}>Continue →</BtnPrimary>
        </div>
      )}

      {step === 2 && (
        <div className="screen-slide">
          <Input label="Password" required type={showPass?"text":"password"}
            placeholder="Create a strong password" icon="🔒"
            value={form.password} error={errors.password}
            suffix={<span onClick={()=>setShowPass(s=>!s)}>{showPass?"🙈":"👁️"}</span>}
            onChange={e=>set("password",e.target.value)} />
          <PasswordStrength password={form.password} />
          <div style={{ marginBottom:18 }} />

          <Input label="Confirm Password" required type={showConfirm?"text":"password"}
            placeholder="Re-enter your password" icon="🔒"
            value={form.confirm} error={errors.confirm}
            suffix={<span onClick={()=>setShowConfirm(s=>!s)}>{showConfirm?"🙈":"👁️"}</span>}
            onChange={e=>set("confirm",e.target.value)} />

          {/* Terms */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom: errors.agree ? 6 : 22,
            background:t.cyanGlow2, border:`1px solid ${errors.agree ? t.red : t.navyBorder}`,
            borderRadius:10, padding:"14px" }}>
            <div onClick={()=>set("agree",!form.agree)}
              style={{ width:20, height:20, borderRadius:5, border:`2px solid ${form.agree ? t.cyan : t.navyBorder}`,
                background: form.agree ? t.cyan : "transparent", flexShrink:0, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s", marginTop:1 }}>
              {form.agree && <span style={{ color:t.navy, fontSize:11, fontWeight:700 }}>✓</span>}
            </div>
            <p style={{ fontSize:13, color:t.muted, lineHeight:1.6 }}>
              I agree to CrestCapital's{" "}
              <span style={{ color:t.cyan, cursor:"pointer" }}>Terms of Service</span>,{" "}
              <span style={{ color:t.cyan, cursor:"pointer" }}>Privacy Policy</span>, and confirm I am 18 years or older.
            </p>
          </div>
          {errors.agree && <div style={{ fontSize:12, color:t.red, marginBottom:16 }}>⚠ {errors.agree}</div>}

          <BtnPrimary onClick={nextStep} loading={loading}>Create Account</BtnPrimary>
          <div style={{ marginTop:12 }}>
            <BtnSecondary onClick={()=>setStep(1)}>← Back</BtnSecondary>
          </div>
        </div>
      )}

      <div style={{ marginTop:24, textAlign:"center" }}>
        <p style={{ fontSize:14, color:t.muted }}>
          Already have an account?{" "}
          <span style={{ color:t.cyan, fontWeight:600, cursor:"pointer" }} onClick={()=>onSwitch("login")}>
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── SCREEN: OTP VERIFICATION ─────────────────────────────────────────────────
function OTPScreen({ onSuccess, onBack, email = "" }) {
  const [otp, setOtp] = useState(["","","","","",""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [shake, setShake] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    setError("");
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      inputs.current[5]?.focus();
    }
  };

  const submit = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter all 6 digits"); setShake(true); setTimeout(()=>setShake(false),600); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Invalid code. Please try again.");
        setShake(true); setTimeout(()=>setShake(false),600);
        setOtp(["","","","","",""]); inputs.current[0]?.focus();
        return;
      }
      onSuccess("pin-setup");
    } catch {
      setLoading(false);
      setError("Connection error. Please try again.");
    }
  };

  const resend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(60); setError(""); setOtp(["","","","","",""]); inputs.current[0]?.focus();
    try {
      await fetch("/api/auth/verify-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
  };

  return (
    <div className="screen-slide" style={{ animation: shake ? "shake .4s ease" : undefined }}>
      <Logo />
      <div style={{ width:64, height:64, borderRadius:16, background:t.cyanGlow2,
        border:`1px solid rgba(0,212,255,0.25)`, display:"flex", alignItems:"center",
        justifyContent:"center", fontSize:28, marginBottom:24 }}>✉️</div>

      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(22px,4vw,30px)",
        letterSpacing:"-0.8px", marginBottom:10 }}>Check your email</h1>
      <p style={{ color:t.muted, fontSize:15, lineHeight:1.72, marginBottom:8 }}>
        We sent a 6-digit verification code to
      </p>
      <p style={{ color:t.cyan, fontSize:15, fontWeight:600, marginBottom:32 }}>{email}</p>

      {/* OTP inputs */}
      <div className="otp-grid" style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:8 }}>
        {otp.map((d, i) => (
          <input key={i} ref={el => inputs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{ width:48, height:56, textAlign:"center", fontSize:22, fontWeight:700,
              fontFamily:"'Syne',sans-serif", background:"rgba(15,32,64,0.6)",
              border:`2px solid ${d ? t.cyan : error ? t.red : t.navyBorder}`,
              borderRadius:12, color:t.white, outline:"none", transition:"border-color .2s",
              boxShadow: d ? `0 0 0 3px ${t.cyanGlow2}` : "none" }} />
        ))}
      </div>

      {error && <div style={{ fontSize:13, color:t.red, textAlign:"center", marginBottom:12 }}>⚠ {error}</div>}

      <div style={{ marginBottom:28 }}>
        <BtnPrimary onClick={submit} loading={loading}>Verify Email</BtnPrimary>
      </div>

      <div style={{ textAlign:"center", marginBottom:16 }}>
        <span style={{ fontSize:14, color:t.muted }}>Didn't receive the code? </span>
        <span onClick={resend} style={{ fontSize:14, fontWeight:600,
          color: resendTimer > 0 ? t.muted : t.cyan,
          cursor: resendTimer > 0 ? "default" : "pointer" }}>
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
        </span>
      </div>

      <div style={{ textAlign:"center" }}>
        <span style={{ fontSize:14, color:t.muted, cursor:"pointer" }}
          onClick={onBack}>← Back to sign up</span>
      </div>
    </div>
  );
}

// ─── SCREEN: PIN SETUP ────────────────────────────────────────────────────────
function PinSetupScreen({ onSuccess, email = "" }) {
  const [pin, setPin] = useState(["","","","",""]);
  const [confirm, setConfirm] = useState(["","","","",""]);
  const [phase, setPhase] = useState("set"); // "set" | "confirm"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputs = useRef([]);

  const current = phase === "set" ? pin : confirm;
  const setter  = phase === "set" ? setPin : setConfirm;

  const handleKey = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...current];
    next[i] = val.slice(-1);
    setter(next);
    setError("");
    if (val && i < 4) inputs.current[i + 1]?.focus();
    // auto-advance phase
    if (val && i === 4) {
      if (phase === "set") { setTimeout(() => { setPhase("confirm"); inputs.current[0]?.focus(); }, 300); }
    }
  };

  const handleBack = (i, e) => {
    if (e.key === "Backspace" && !current[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const submit = async () => {
    const p = pin.join(""), c = confirm.join("");
    if (p.length < 5) { setError("Enter a 5-digit PIN"); setShake(true); setTimeout(()=>setShake(false),600); return; }
    if (p !== c)      { setError("PINs do not match. Try again."); setShake(true); setTimeout(()=>setShake(false),600); setConfirm(["","","","",""]); setPhase("set"); inputs.current[0]?.focus(); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/set-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin: p }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error || "Failed to save PIN. Please try again."); return; }
      onSuccess("success");
    } catch {
      setLoading(false);
      setError("Connection error. Please try again.");
    }
  };

  useEffect(() => { inputs.current[0]?.focus(); }, [phase]);

  return (
    <div className="screen-slide" style={{ animation: shake ? "shake .4s ease" : undefined }}>
      <Logo />
      <div style={{ width:64, height:64, borderRadius:16, background:t.cyanGlow2,
        border:`1px solid rgba(0,212,255,0.25)`, display:"flex", alignItems:"center",
        justifyContent:"center", fontSize:28, marginBottom:24 }}>🔐</div>

      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(22px,4vw,30px)",
        letterSpacing:"-0.8px", marginBottom:10 }}>
        {phase === "set" ? "Create your PIN" : "Confirm your PIN"}
      </h1>
      <p style={{ color:t.muted, fontSize:15, lineHeight:1.72, marginBottom:32 }}>
        {phase === "set"
          ? "Set a 5-digit security PIN to protect your account from unauthorized access."
          : "Re-enter your PIN to confirm. Make sure it matches."}
      </p>

      {/* Phase indicator */}
      <div style={{ display:"flex", gap:8, marginBottom:28 }}>
        {["Set PIN","Confirm PIN"].map((label, i) => {
          const active = (i === 0 && phase === "set") || (i === 1 && phase === "confirm");
          const done   = i === 0 && phase === "confirm";
          return (
            <div key={i} style={{ flex:1, display:"flex", alignItems:"center", flexDirection:"column", gap:5 }}>
              <div style={{ height:3, borderRadius:2, width:"100%",
                background: done || active ? t.cyan : t.navyBorder, transition:"background .3s" }} />
              <span style={{ fontSize:11, color: active ? t.cyan : done ? t.cyanDim : t.muted, fontWeight:600 }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* PIN dots */}
      <div style={{ display:"flex", gap:14, justifyContent:"center", marginBottom:8 }}>
        {current.map((d, i) => (
          <div key={i} style={{ position:"relative" }}>
            <input ref={el => inputs.current[i] = el}
              type="password" inputMode="numeric" maxLength={1} value={d}
              onChange={e => handleKey(i, e.target.value)}
              onKeyDown={e => handleBack(i, e)}
              style={{ width:52, height:60, textAlign:"center", fontSize:24, fontWeight:700,
                background:"rgba(15,32,64,0.6)", border:`2px solid ${d ? t.cyan : t.navyBorder}`,
                borderRadius:12, color:t.white, outline:"none", fontFamily:"'Syne',sans-serif",
                transition:"all .2s", boxShadow: d ? `0 0 0 3px ${t.cyanGlow2}` : "none" }} />
          </div>
        ))}
      </div>

      {error && <div style={{ fontSize:13, color:t.red, textAlign:"center", marginTop:8, marginBottom:8 }}>⚠ {error}</div>}

      <div style={{ marginTop:24 }}>
        {phase === "confirm"
          ? <BtnPrimary onClick={submit} loading={loading}>Save PIN & Continue</BtnPrimary>
          : <BtnSecondary onClick={()=>{ setPhase("confirm"); setTimeout(()=>inputs.current[0]?.focus(),100); }}>
              Next →
            </BtnSecondary>
        }
      </div>

      <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:t.muted }}>
        🔒 Your PIN is encrypted and never stored in plain text
      </p>
    </div>
  );
}

// ─── SCREEN: PIN LOGIN ────────────────────────────────────────────────────────
function PinLoginScreen({ onSuccess, onBack, email = "", password = "" }) {
  const [pin, setPin] = useState(["","","","",""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputs = useRef([]);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  const handleKey = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...pin];
    next[i] = val.slice(-1);
    setPin(next);
    setError("");
    if (val && i < 4) inputs.current[i + 1]?.focus();
  };

  const handleBack = (i, e) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const submit = async () => {
    const code = pin.join("");
    if (code.length < 5) { setError("Enter your 5-digit PIN"); setShake(true); setTimeout(()=>setShake(false),600); return; }
    setLoading(true);
    try {
      // Step 1 — verify PIN against stored hash
      const pinRes  = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin: code }),
      });
      const pinData = await pinRes.json();
      if (!pinRes.ok) {
        const a = attempts + 1;
        setAttempts(a);
        const remaining = a < 3 ? ` ${3 - a} attempt${3 - a !== 1 ? "s" : ""} remaining.` : "";
        setError((pinData.error || "Incorrect PIN.") + remaining);
        setShake(true); setTimeout(()=>setShake(false),600);
        setPin(["","","","",""]); inputs.current[0]?.focus();
        setLoading(false);
        return;
      }
      // Step 2 — credentials verified; create the real NextAuth session
      const result = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (result?.ok) {
        // Admins go to /admin, regular users go to /dashboard
        try {
          const me = await fetch("/api/user/profile").then(r=>r.json());
          onSuccess(me?.role === "admin" ? "admin" : "dashboard");
        } catch {
          onSuccess("dashboard");
        }
      } else {
        setError("Session error. Please log in again.");
      }
    } catch {
      setLoading(false);
      setError("Connection error. Please try again.");
    }
  };

  return (
    <div className="screen-slide" style={{ animation: shake ? "shake .4s ease" : undefined }}>
      <Logo />
      <div style={{ width:64, height:64, borderRadius:16, background:t.cyanGlow2,
        border:`1px solid rgba(0,212,255,0.25)`, display:"flex", alignItems:"center",
        justifyContent:"center", fontSize:28, marginBottom:24 }}>🔑</div>

      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(22px,4vw,30px)",
        letterSpacing:"-0.8px", marginBottom:10 }}>Enter your PIN</h1>
      <p style={{ color:t.muted, fontSize:15, marginBottom:32 }}>
        Enter your 5-digit security PIN to access your account
      </p>

      <div className="pin-grid" style={{ display:"flex", gap:14, justifyContent:"center", marginBottom:8 }}>
        {pin.map((d, i) => (
          <input key={i} ref={el => inputs.current[i] = el}
            type="password" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleKey(i, e.target.value)}
            onKeyDown={e => handleBack(i, e)}
            style={{ width:52, height:60, textAlign:"center", fontSize:24, fontWeight:700,
              background:"rgba(15,32,64,0.6)", border:`2px solid ${d ? t.cyan : error ? t.red : t.navyBorder}`,
              borderRadius:12, color:t.white, outline:"none", fontFamily:"'Syne',sans-serif",
              transition:"all .2s", boxShadow: d ? `0 0 0 3px ${t.cyanGlow2}` : "none" }} />
        ))}
      </div>

      {error && <div style={{ fontSize:13, color:t.red, textAlign:"center", margin:"8px 0 4px" }}>⚠ {error}</div>}
      {attempts >= 2 && (
        <div style={{ textAlign:"center", marginBottom:4 }}>
          <span style={{ fontSize:13, color:t.cyan, cursor:"pointer" }}
            onClick={()=>onBack("forgot")}>Forgot your PIN? Reset it here</span>
        </div>
      )}

      <div style={{ marginTop:20, marginBottom:20 }}>
        <BtnPrimary onClick={submit} loading={loading}>Unlock Account</BtnPrimary>
      </div>

      <div style={{ textAlign:"center" }}>
        <span style={{ fontSize:14, color:t.muted, cursor:"pointer" }} onClick={()=>onBack("login")}>
          ← Back to login
        </span>
      </div>
    </div>
  );
}

// ─── SCREEN: FORGOT PASSWORD ──────────────────────────────────────────────────
function ForgotPasswordScreen({ onSwitch }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password, 4=done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [pass, setPass] = useState({ new:"", confirm:"" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [step, timer]);

  const step1 = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setErrors({ email:"Enter a valid email" }); return; }
    setErrors({});
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always advance — avoids email enumeration
      setLoading(false);
      setStep(2);
    } catch {
      setLoading(false);
      setErrors({ email: "Connection error. Please try again." });
    }
  };

  const step2 = async () => {
    const code = otp.join("");
    if (code.length < 6) { setErrors({ otp:"Enter all 6 digits" }); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password?action=verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setErrors({ otp: data.error || "Invalid or expired code." }); return; }
      setStep(3);
    } catch {
      setLoading(false);
      setErrors({ otp: "Connection error. Please try again." });
    }
  };

  const step3 = async () => {
    const e = {};
    if (pass.new.length < 8)       e.new = "Minimum 8 characters";
    if (pass.new !== pass.confirm)  e.confirm = "Passwords do not match";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password?action=reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword: pass.new }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setErrors({ confirm: data.error || "Reset failed. Please try again." }); return; }
      setStep(4);
    } catch {
      setLoading(false);
      setErrors({ confirm: "Connection error. Please try again." });
    }
  };

  const handleOtp = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next);
    setErrors({});
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  return (
    <div className="screen-slide">
      <Logo onClick={() => onSwitch("login")} />

      {step === 1 && (
        <div className="screen-slide">
          <div style={{ width:64, height:64, borderRadius:16, background:t.cyanGlow2,
            border:`1px solid rgba(0,212,255,0.25)`, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:28, marginBottom:24 }}>🔓</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(22px,4vw,30px)",
            letterSpacing:"-0.8px", marginBottom:10 }}>Forgot password?</h1>
          <p style={{ color:t.muted, fontSize:15, lineHeight:1.72, marginBottom:32 }}>
            No worries. Enter your email and we'll send you a reset code.
          </p>
          <Input label="Email Address" required type="email" placeholder="you@example.com"
            icon="✉️" value={email} error={errors.email}
            onChange={e => setEmail(e.target.value)} />
          <BtnPrimary onClick={step1} loading={loading}>Send Reset Code</BtnPrimary>
          <div style={{ marginTop:20, textAlign:"center" }}>
            <span style={{ fontSize:14, color:t.muted, cursor:"pointer" }}
              onClick={() => onSwitch("login")}>← Back to login</span>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="screen-slide">
          <div style={{ width:64, height:64, borderRadius:16, background:t.cyanGlow2,
            border:`1px solid rgba(0,212,255,0.25)`, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:28, marginBottom:24 }}>✉️</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(22px,4vw,30px)",
            letterSpacing:"-0.8px", marginBottom:10 }}>Enter reset code</h1>
          <p style={{ color:t.muted, fontSize:15, marginBottom:8 }}>
            We sent a 6-digit code to
          </p>
          <p style={{ color:t.cyan, fontWeight:600, marginBottom:32 }}>{email}</p>

          <div className="otp-grid" style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:8 }}>
            {otp.map((d, i) => (
              <input key={i} ref={el => otpRefs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={e => handleOtp(i, e.target.value)}
                onKeyDown={e => { if(e.key==="Backspace"&&!d&&i>0) otpRefs.current[i-1]?.focus(); }}
                style={{ width:48, height:56, textAlign:"center", fontSize:22, fontWeight:700,
                  fontFamily:"'Syne',sans-serif", background:"rgba(15,32,64,0.6)",
                  border:`2px solid ${d ? t.cyan : errors.otp ? t.red : t.navyBorder}`,
                  borderRadius:12, color:t.white, outline:"none", transition:"all .2s",
                  boxShadow: d ? `0 0 0 3px ${t.cyanGlow2}` : "none" }} />
            ))}
          </div>
          {errors.otp && <div style={{ fontSize:13, color:t.red, textAlign:"center", marginBottom:12 }}>⚠ {errors.otp}</div>}
          <div style={{ marginBottom:24, textAlign:"center" }}>
            <span style={{ fontSize:13, color: timer > 0 ? t.muted : t.cyan,
              cursor: timer > 0 ? "default" : "pointer" }}
              onClick={() => { if(timer <= 0){ setTimer(60); setOtp(["","","","","",""]); }}}>
              {timer > 0 ? `Resend in ${timer}s` : "Resend code"}
            </span>
          </div>
          <BtnPrimary onClick={step2} loading={loading}>Verify Code</BtnPrimary>
          <div style={{ marginTop:12 }}>
            <BtnSecondary onClick={() => setStep(1)}>← Back</BtnSecondary>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="screen-slide">
          <div style={{ width:64, height:64, borderRadius:16, background:t.cyanGlow2,
            border:`1px solid rgba(0,212,255,0.25)`, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:28, marginBottom:24 }}>🔒</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(22px,4vw,30px)",
            letterSpacing:"-0.8px", marginBottom:10 }}>Create new password</h1>
          <p style={{ color:t.muted, fontSize:15, marginBottom:32 }}>
            Your new password must be different from your previous one.
          </p>
          <Input label="New Password" required type={showNew?"text":"password"}
            placeholder="Create a strong password" icon="🔒"
            value={pass.new} error={errors.new}
            suffix={<span onClick={()=>setShowNew(s=>!s)}>{showNew?"🙈":"👁️"}</span>}
            onChange={e => setPass(p=>({...p,new:e.target.value}))} />
          <PasswordStrength password={pass.new} />
          <div style={{ marginBottom:18 }} />
          <Input label="Confirm New Password" required type={showConfirm?"text":"password"}
            placeholder="Re-enter new password" icon="🔒"
            value={pass.confirm} error={errors.confirm}
            suffix={<span onClick={()=>setShowConfirm(s=>!s)}>{showConfirm?"🙈":"👁️"}</span>}
            onChange={e => setPass(p=>({...p,confirm:e.target.value}))} />
          <BtnPrimary onClick={step3} loading={loading}>Reset Password</BtnPrimary>
          <div style={{ marginTop:12 }}>
            <BtnSecondary onClick={() => setStep(2)}>← Back</BtnSecondary>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="screen-slide" style={{ textAlign:"center" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:36,
            margin:"0 auto 28px", animation:"checkPop .6s cubic-bezier(.34,1.56,.64,1) both" }}>
            ✓
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(22px,4vw,30px)",
            letterSpacing:"-0.8px", marginBottom:12 }}>Password reset!</h1>
          <p style={{ color:t.muted, fontSize:15, lineHeight:1.72, maxWidth:360, margin:"0 auto 36px" }}>
            Your password has been successfully reset. You can now log in with your new credentials.
          </p>
          <BtnPrimary onClick={() => onSwitch("login")}>Back to Login →</BtnPrimary>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: SUCCESS ──────────────────────────────────────────────────────────
function SuccessScreen({ onContinue }) {
  return (
    <div className="screen-slide" style={{ textAlign:"center" }}>
      <div style={{ width:90, height:90, borderRadius:"50%",
        background:`linear-gradient(135deg,${t.cyan},${t.cyanDim})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:40, margin:"0 auto 28px",
        animation:"checkPop .7s cubic-bezier(.34,1.56,.64,1) both" }}>✓</div>

      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(24px,4vw,34px)",
        letterSpacing:"-1px", marginBottom:14 }}>You're all set!</h1>
      <p style={{ color:t.muted, fontSize:15, lineHeight:1.75, maxWidth:380, margin:"0 auto 36px" }}>
        Welcome to CrestCapital. Your account is fully verified and your security PIN is configured.
        You're ready to start investing.
      </p>

      <div style={{ background:t.navyCard, border:`1px solid ${t.navyBorder}`, borderRadius:14,
        padding:"22px", marginBottom:32, textAlign:"left" }}>
        {[
          ["✅","Account verified"],
          ["🔐","PIN configured"],
          ["📊","Ready to invest"],
          ["⚡","Instant withdrawals enabled"],
        ].map(([icon,text],i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0",
            borderBottom: i < 3 ? `1px solid ${t.navyBorder}` : "none" }}>
            <span style={{ fontSize:16 }}>{icon}</span>
            <span style={{ fontSize:14, fontWeight:500 }}>{text}</span>
          </div>
        ))}
      </div>

      <BtnPrimary onClick={onContinue} style={{ fontSize:16, padding:"16px" }}>
        Go to Dashboard →
      </BtnPrimary>
    </div>
  );
}

// ─── MAIN AUTH COMPONENT ──────────────────────────────────────────────────────
export default function CrestCapitalAuth({ initialScreen = "login" }) {
  const router = useRouter();
  const [screen, setScreen]               = useState(initialScreen);
  const [pendingEmail, setPendingEmail]     = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  // screen values: "login" | "signup" | "otp" | "pin-setup" | "pin-login" | "forgot" | "success"

  const navigate = (to) => {
    if (to === "dashboard") { router.push("/dashboard"); return; }
    if (to === "admin")     { router.push("/admin");     return; }
    setScreen(to);
  };

  const renderScreen = () => {
    switch(screen) {
      // Login → password pre-check → PIN screen
      case "login":
        return (
          <LoginScreen
            onSwitch={navigate}
            onSuccess={(email, password) => {
              setPendingEmail(email);
              setPendingPassword(password);
              setScreen("pin-login");
            }}
          />
        );

      // Signup (multi-step) → OTP
      case "signup":
        return (
          <SignupScreen
            onSwitch={navigate}
            onSuccess={(to, email, password) => {
              if (email)    setPendingEmail(email);
              if (password) setPendingPassword(password);
              navigate(to);
            }}
          />
        );

      // Email OTP verification → PIN setup
      case "otp":
        return (
          <OTPScreen
            onSuccess={navigate}
            onBack={() => navigate("signup")}
            email={pendingEmail}
          />
        );

      // PIN creation (after signup)
      case "pin-setup":
        return <PinSetupScreen onSuccess={navigate} email={pendingEmail} />;

      // PIN entry (after login) → creates real session on success
      case "pin-login":
        return (
          <PinLoginScreen
            onSuccess={navigate}
            onBack={navigate}
            email={pendingEmail}
            password={pendingPassword}
          />
        );

      case "forgot":
        return <ForgotPasswordScreen onSwitch={navigate} />;

      // All done — create session then go to dashboard
      case "success":
        return (
          <SuccessScreen
            onContinue={async () => {
              const result = await signIn("credentials", {
                email: pendingEmail,
                password: pendingPassword,
                redirect: false,
              });
              router.push(result?.ok ? "/dashboard" : "/auth/login");
            }}
          />
        );

      default:
        return (
          <LoginScreen
            onSwitch={navigate}
            onSuccess={(email, password) => {
              setPendingEmail(email);
              setPendingPassword(password);
              setScreen("pin-login");
            }}
          />
        );
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-layout">

        {/* Left decorative panel — hidden on mobile */}
        <AuthPanel />

        {/* Right form panel */}
        <div style={{ background:t.navy, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", padding:"40px 0",
          minHeight:"100vh", position:"relative", overflow:"hidden" }}>

          <GlowOrb style={{ width:300, height:300, background:"rgba(0,212,255,0.05)",
            top:"-10%", right:"-10%", zIndex:0 }} />
          <GlowOrb style={{ width:200, height:200, background:"rgba(0,80,200,0.07)",
            bottom:"5%", left:"-5%", zIndex:0 }} />

          <div className="auth-card-wrap" style={{ width:"100%", maxWidth:480,
            padding:"0 40px", position:"relative", zIndex:1 }}>
            <div className="auth-card">
              {renderScreen()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── USAGE IN NEXT.JS ─────────────────────────────────────────────────────────
//
// src/app/auth/login/page.jsx:
//   import CrestCapitalAuth from "@/components/CrestCapitalAuth"
//   export default function LoginPage() { return <CrestCapitalAuth initialScreen="login" /> }
//
// src/app/auth/signup/page.jsx:
//   import CrestCapitalAuth from "@/components/CrestCapitalAuth"
//   export default function SignupPage() { return <CrestCapitalAuth initialScreen="signup" /> }
//
// src/app/auth/forgot/page.jsx:
//   import CrestCapitalAuth from "@/components/CrestCapitalAuth"
//   export default function ForgotPage() { return <CrestCapitalAuth initialScreen="forgot" /> }