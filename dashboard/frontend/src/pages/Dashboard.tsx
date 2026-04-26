// import { useEffect, useState} from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
// } from "recharts";

// const C = {
//   high: "#ef4444",
//   medium: "#f59e0b",
//   low: "#10b981",
//   purple: "#8b5cf6",
//   blue: "#3b82f6",
//   bg: "#0f172a",
//   card: "#1e293b",
//   border: "#334155",
//   text: "#94a3b8",
//   bright: "#f1f5f9",
// };

// function AnimatedNumber({ target }: { target: number }) {
//   const [current, setCurrent] = useState(0);
//   useEffect(() => {
//     if (target === 0) return;
//     let start = 0;
//     const step = Math.ceil(target / 30);
//     const timer = setInterval(() => {
//       start += step;
//       if (start >= target) {
//         setCurrent(target);
//         clearInterval(timer);
//       } else {
//         setCurrent(start);
//       }
//     }, 30);
//     return () => clearInterval(timer);
//   }, [target]);
//   return <>{current}</>;
// }

// function RiskGauge({ score, risk }: { score: number; risk: string }) {
//   const color = risk === "LOW" ? C.low : risk === "MODERATE" ? C.medium : C.high;
//   const [animated, setAnimated] = useState(0);

//   useEffect(() => {
//     let s = 0;
//     const timer = setInterval(() => {
//       s += 2;
//       if (s >= score) { setAnimated(score); clearInterval(timer); }
//       else setAnimated(s);
//     }, 20);
//     return () => clearInterval(timer);
//   }, [score]);

//   const pct = animated / 100;
//   const radius = 60;
//   const circumference = Math.PI * radius;
//   const strokeDash = circumference * pct;

//   return (
//     <div style={{ textAlign: "center" }}>
//       <svg width="160" height="90" viewBox="0 0 160 90">
//         <path
//           d="M 20 80 A 60 60 0 0 1 140 80"
//           fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round"
//         />
//         <path
//           d="M 20 80 A 60 60 0 0 1 140 80"
//           fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
//           strokeDasharray={`${strokeDash} ${circumference}`}
//           style={{ transition: "stroke-dasharray 0.1s ease" }}
//         />
//         <text x="80" y="72" textAnchor="middle" fill={color} fontSize="24" fontWeight="700">
//           {animated}
//         </text>
//         <text x="80" y="86" textAnchor="middle" fill={C.text} fontSize="10">
//           / 100
//         </text>
//       </svg>
//       <div style={{
//         display: "inline-block",
//         padding: "4px 16px", borderRadius: "20px",
//         background: `${color}22`, color,
//         fontSize: "12px", fontWeight: "700", marginTop: "4px",
//         border: `1px solid ${color}44`,
//       }}>
//         {risk} RISK
//       </div>
//     </div>
//   );
// }

// export default function Dashboard() {
//   const { token, email } = useAuth();
//   const navigate = useNavigate();
//   const [stats, setStats] = useState<any>(null);
//   const [findings, setFindings] = useState<any[]>([]);
//   const [certs, setCerts] = useState<any[]>([]);
//   const [score, setScore] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const headers = { Authorization: `Bearer ${token}` };
//     Promise.all([
//       axios.get("/api/stats", { headers }),
//       axios.get("/api/findings", { headers }),
//       axios.get("/api/certifications", { headers }),
//       axios.get("/api/score", { headers }),
//     ]).then(([s, f, c, sc]) => {
//       setStats(s.data);
//       setFindings(Array.isArray(f.data) ? f.data : []);
//       setCerts(Array.isArray(c.data) ? c.data : []);
//       setScore(sc.data);
//     }).catch(err => setError(err.message))
//       .finally(() => setLoading(false));
//   }, [token]);

//   const high = findings.filter(f => f.severity === "HIGH").length;
//   const medium = findings.filter(f => f.severity === "MEDIUM").length;
//   const low = findings.filter(f => f.severity === "LOW").length;

//   const pieData = [
//     { name: "High", value: high, color: C.high },
//     { name: "Medium", value: medium, color: C.medium },
//     { name: "Low", value: low, color: C.low },
//   ].filter(d => d.value > 0);

//   const barData = stats ? [
//     { name: "Policies", value: stats.policies ?? 0, fill: C.purple },
//     { name: "Roles", value: stats.roles ?? 0, fill: C.blue },
//     { name: "Glossaries", value: stats.glossaries ?? 0, fill: C.low },
//     { name: "Users", value: stats.users ?? 0, fill: C.medium },
//     { name: "Teams", value: stats.teams ?? 0, fill: C.high },
//   ] : [];

//   const certStatusData = [
//     { name: "Active", value: certs.filter(c => c.status === "ACTIVE").length, color: C.low },
//     { name: "Expiring", value: certs.filter(c => c.status === "EXPIRING_SOON").length, color: C.medium },
//     { name: "Expired", value: certs.filter(c => c.status === "EXPIRED").length, color: C.high },
//     { name: "Uncertified", value: certs.filter(c => c.status === "UNCERTIFIED").length, color: C.text },
//   ];

//   const scoreBreakdown = score ? [
//     { name: "Policy Coverage", value: score.breakdown.policyCoverage, max: 25, color: C.purple },
//     { name: "Ownership Health", value: score.breakdown.ownershipHealth, max: 25, color: C.blue },
//     { name: "Team Structure", value: score.breakdown.teamStructure, max: 25, color: C.low },
//     { name: "Certification Rate", value: score.breakdown.certificationRate, max: 25, color: C.medium },
//   ] : [];

//   const typeData = findings.reduce((acc: any[], f) => {
//     const existing = acc.find(a => a.type === f.type);
//     if (existing) existing.count++;
//     else acc.push({ type: f.type.replace(/_/g, " "), count: 1 });
//     return acc;
//   }, []);

//   if (loading) return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center" }}>
//         <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛡️</div>
//         <div style={{ color: C.text, fontSize: "14px" }}>Loading governance data...</div>
//       </div>
//     </div>
//   );

//   if (error) return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center" }}>
//         <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
//         <div style={{ color: C.high, fontSize: "16px", marginBottom: "8px" }}>Failed to load: {error}</div>
//         <div style={{ color: C.text, fontSize: "13px", marginBottom: "24px" }}>
//           Make sure OpenMetadata is running at localhost:8585
//         </div>
//         <button onClick={() => window.location.reload()} style={{
//           padding: "10px 24px",
//           background: "linear-gradient(135deg, #667eea, #764ba2)",
//           border: "none", borderRadius: "8px",
//           color: "white", cursor: "pointer", fontSize: "14px"
//         }}>🔄 Retry</button>
//       </div>
//     </div>
//   );

//   return (
//     <div style={{ maxWidth: "1200px" }}>
//       {/* Header */}
//       <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//         <div>
//           <h1 style={{ fontSize: "26px", fontWeight: "700", color: C.bright, letterSpacing: "-0.5px" }}>
//             Governance Overview
//           </h1>
//           <p style={{ color: C.text, marginTop: "4px", fontSize: "13px" }}>
//             {email} · {new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
//           </p>
//         </div>
//         <div style={{ display: "flex", gap: "8px" }}>
//           {[
//             { label: "🔍 Audit", path: "/audit" },
//             { label: "🤝 Delegate", path: "/delegate" },
//             { label: "🏅 Certify", path: "/certify" },
//           ].map(a => (
//             <button key={a.path} onClick={() => navigate(a.path)} style={{
//               padding: "8px 14px",
//               background: "linear-gradient(135deg, #667eea, #764ba2)",
//               border: "none", borderRadius: "8px",
//               color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//             }}>{a.label}</button>
//           ))}
//         </div>
//       </div>

//       {/* Top row — Risk Score + Stat Cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", marginBottom: "20px" }}>

//         {/* Risk Score Card */}
//         <div style={{
//           background: C.card,
//           border: `1px solid ${score?.risk === "LOW" ? C.low : score?.risk === "MODERATE" ? C.medium : C.high}44`,
//           borderRadius: "16px", padding: "24px",
//           boxShadow: `0 0 20px ${score?.risk === "LOW" ? C.low : score?.risk === "MODERATE" ? C.medium : C.high}11`,
//           display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
//         }}>
//           <div style={{ fontSize: "13px", color: C.text, marginBottom: "12px", fontWeight: "600", letterSpacing: "1px" }}>
//             GOVERNANCE SCORE
//           </div>
//           {score && <RiskGauge score={score.total} risk={score.risk} />}
//           <div style={{ marginTop: "16px", width: "100%" }}>
//             {scoreBreakdown.map(item => (
//               <div key={item.name} style={{ marginBottom: "8px" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                   <span style={{ fontSize: "11px", color: C.text }}>{item.name}</span>
//                   <span style={{ fontSize: "11px", color: item.color, fontWeight: "600" }}>{item.value}/{item.max}</span>
//                 </div>
//                 <div style={{ height: "4px", background: "#0f172a", borderRadius: "2px" }}>
//                   <div style={{
//                     height: "100%", borderRadius: "2px",
//                     width: `${(item.value / item.max) * 100}%`,
//                     background: item.color,
//                     transition: "width 1s ease",
//                   }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Stat Cards Grid */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
//           {[
//             { label: "Policies", value: stats?.policies ?? 0, icon: "📋", color: C.purple, sub: "governance rules" },
//             { label: "Roles", value: stats?.roles ?? 0, icon: "🎭", color: C.blue, sub: "access roles" },
//             { label: "Glossaries", value: stats?.glossaries ?? 0, icon: "📚", color: C.low, sub: "data glossaries" },
//             { label: "Users", value: stats?.users ?? 0, icon: "👥", color: C.medium, sub: "active users" },
//             { label: "Teams", value: stats?.teams ?? 0, icon: "👨‍👩‍👧", color: C.high, sub: "team groups" },
//             {
//               label: "Issues",
//               value: high + medium + low,
//               icon: high > 0 ? "🔴" : "✅",
//               color: high > 0 ? C.high : C.low,
//               sub: `${high} critical`
//             },
//           ].map(card => (
//             <div key={card.label} style={{
//               background: C.card,
//               border: `1px solid ${C.border}`,
//               borderRadius: "12px",
//               padding: "16px 20px",
//               borderLeft: `3px solid ${card.color}`,
//               cursor: "pointer",
//               transition: "border-color 0.2s",
//             }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                 <div>
//                   <div style={{ fontSize: "24px", fontWeight: "700", color: card.color, fontFamily: "monospace" }}>
//                     <AnimatedNumber target={card.value} />
//                   </div>
//                   <div style={{ fontSize: "13px", color: C.bright, marginTop: "2px", fontWeight: "600" }}>{card.label}</div>
//                   <div style={{ fontSize: "11px", color: C.text, marginTop: "2px" }}>{card.sub}</div>
//                 </div>
//                 <div style={{ fontSize: "24px" }}>{card.icon}</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Middle row */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>

//         {/* Findings pie */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             🔍 FINDINGS BY SEVERITY
//           </h2>
//           {pieData.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "32px", color: C.low }}>
//               <div style={{ fontSize: "40px" }}>✅</div>
//               <div style={{ marginTop: "8px", fontSize: "14px" }}>No findings! Governance is healthy.</div>
//             </div>
//           ) : (
//             <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
//               <ResponsiveContainer width={150} height={150}>
//                 <PieChart>
//                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={65} dataKey="value" paddingAngle={4}>
//                     {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//                   </Pie>
//                 </PieChart>
//               </ResponsiveContainer>
//               <div style={{ flex: 1 }}>
//                 {[
//                   { label: "Critical", value: high, color: C.high },
//                   { label: "Medium", value: medium, color: C.medium },
//                   { label: "Low", value: low, color: C.low },
//                 ].map(item => (
//                   <div key={item.label} style={{
//                     display: "flex", justifyContent: "space-between",
//                     alignItems: "center", marginBottom: "10px",
//                     padding: "8px 12px", borderRadius: "8px",
//                     background: `${item.color}11`,
//                     border: `1px solid ${item.color}22`,
//                   }}>
//                     <span style={{ fontSize: "12px", color: C.text }}>{item.label}</span>
//                     <span style={{ fontSize: "18px", fontWeight: "700", color: item.color, fontFamily: "monospace" }}>{item.value}</span>
//                   </div>
//                 ))}
//                 <button onClick={() => navigate("/audit")} style={{
//                   width: "100%", marginTop: "4px", padding: "8px",
//                   background: "linear-gradient(135deg, #667eea22, #764ba222)",
//                   border: `1px solid #667eea44`, borderRadius: "6px",
//                   color: "#a78bfa", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//                 }}>View All Findings →</button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Cert status */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             🏅 CERTIFICATION STATUS
//           </h2>
//           <ResponsiveContainer width="100%" height={150}>
//             <BarChart data={certStatusData} barSize={28}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
//               <XAxis dataKey="name" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <YAxis tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.bright, fontSize: "12px" }} />
//               <Bar dataKey="value" radius={[4, 4, 0, 0]}>
//                 {certStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//           <button onClick={() => navigate("/certify")} style={{
//             width: "100%", marginTop: "12px", padding: "8px",
//             background: "linear-gradient(135deg, #667eea22, #764ba222)",
//             border: `1px solid #667eea44`, borderRadius: "6px",
//             color: "#a78bfa", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//           }}>Manage Certifications →</button>
//         </div>
//       </div>

//       {/* Bottom row */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

//         {/* Asset breakdown */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             📊 ASSET BREAKDOWN
//           </h2>
//           <ResponsiveContainer width="100%" height={160}>
//             <BarChart data={barData} layout="vertical" barSize={14}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
//               <XAxis type="number" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <YAxis type="category" dataKey="name" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
//               <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.bright, fontSize: "12px" }} />
//               <Bar dataKey="value" radius={[0, 4, 4, 0]}>
//                 {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Finding types + Quick actions */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             ⚠️ FINDING TYPES
//           </h2>
//           {typeData.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "24px", color: C.low }}>
//               <div style={{ fontSize: "32px" }}>✅</div>
//               <div style={{ marginTop: "8px", fontSize: "13px" }}>No issues detected!</div>
//             </div>
//           ) : (
//             <div style={{ marginBottom: "16px" }}>
//               {typeData.map((t, i) => (
//                 <div key={i} style={{
//                   display: "flex", justifyContent: "space-between", alignItems: "center",
//                   padding: "8px 0",
//                   borderBottom: i < typeData.length - 1 ? `1px solid ${C.border}` : "none"
//                 }}>
//                   <span style={{ fontSize: "12px", color: C.text }}>{t.type.toLowerCase()}</span>
//                   <span style={{
//                     padding: "2px 10px", borderRadius: "20px",
//                     background: "rgba(239,68,68,0.1)", color: C.high,
//                     fontSize: "11px", fontWeight: "700"
//                   }}>{t.count}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "auto" }}>
//             {[
//               { label: "🔐 Pre-Delegate", path: "/pre-delegate" },
//               { label: "🤝 Delegate", path: "/delegate" },
//               { label: "🔍 Audit", path: "/audit" },
//               { label: "🏅 Certify", path: "/certify" },
//             ].map(a => (
//               <button key={a.path} onClick={() => navigate(a.path)} style={{
//                 padding: "8px",
//                 background: "linear-gradient(135deg, #667eea22, #764ba222)",
//                 border: `1px solid #667eea44`,
//                 borderRadius: "6px", color: "#a78bfa",
//                 cursor: "pointer", fontSize: "11px", fontWeight: "600"
//               }}>{a.label}</button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// //second part

// import { getApi } from "../api";

// import { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
// } from "recharts";

// const C = {
//   high: "#ef4444",
//   medium: "#f59e0b",
//   low: "#10b981",
//   purple: "#8b5cf6",
//   blue: "#3b82f6",
//   bg: "#0f172a",
//   card: "#1e293b",
//   border: "#334155",
//   text: "#94a3b8",
//   bright: "#f1f5f9",
// };

// function AnimatedNumber({ target }: { target: number }) {
//   const [current, setCurrent] = useState(0);
//   useEffect(() => {
//     if (target === 0) return;
//     let start = 0;
//     const step = Math.ceil(target / 30);
//     const timer = setInterval(() => {
//       start += step;
//       if (start >= target) {
//         setCurrent(target);
//         clearInterval(timer);
//       } else {
//         setCurrent(start);
//       }
//     }, 30);
//     return () => clearInterval(timer);
//   }, [target]);
//   return <>{current}</>;
// }

// function RiskGauge({ score, risk }: { score: number; risk: string }) {
//   const color = risk === "LOW" ? C.low : risk === "MODERATE" ? C.medium : C.high;
//   const [animated, setAnimated] = useState(0);

//   useEffect(() => {
//     let s = 0;
//     const timer = setInterval(() => {
//       s += 2;
//       if (s >= score) { setAnimated(score); clearInterval(timer); }
//       else setAnimated(s);
//     }, 20);
//     return () => clearInterval(timer);
//   }, [score]);

//   const pct = animated / 100;
//   const radius = 60;
//   const circumference = Math.PI * radius;
//   const strokeDash = circumference * pct;

//   return (
//     <div style={{ textAlign: "center" }}>
//       <svg width="160" height="90" viewBox="0 0 160 90">
//         <path
//           d="M 20 80 A 60 60 0 0 1 140 80"
//           fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round"
//         />
//         <path
//           d="M 20 80 A 60 60 0 0 1 140 80"
//           fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
//           strokeDasharray={`${strokeDash} ${circumference}`}
//           style={{ transition: "stroke-dasharray 0.1s ease" }}
//         />
//         <text x="80" y="72" textAnchor="middle" fill={color} fontSize="24" fontWeight="700">
//           {animated}
//         </text>
//         <text x="80" y="86" textAnchor="middle" fill={C.text} fontSize="10">
//           / 100
//         </text>
//       </svg>
//       <div style={{
//         display: "inline-block",
//         padding: "4px 16px", borderRadius: "20px",
//         background: `${color}22`, color,
//         fontSize: "12px", fontWeight: "700", marginTop: "4px",
//         border: `1px solid ${color}44`,
//       }}>
//         {risk} RISK
//       </div>
//     </div>
//   );
// }

// // ─── MODAL COMPONENT ─────────────────────────────────────────
// type ModalType = "Policies" | "Roles" | "Glossaries";

// function DetailModal({
//   type,
//   data,
//   loading,
//   onClose,
// }: {
//   type: ModalType;
//   data: any[];
//   loading: boolean;
//   onClose: () => void;
// }) {
//   const icons: Record<ModalType, string> = {
//     Policies: "📋",
//     Roles: "🔑",
//     Glossaries: "📚",
//   };

//   const accentColors: Record<ModalType, string> = {
//     Policies: C.purple,
//     Roles: C.blue,
//     Glossaries: C.low,
//   };

//   const accent = accentColors[type];

//   return (
//     <div
//       onClick={onClose}
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(0,0,0,0.65)",
//         backdropFilter: "blur(6px)",
//         zIndex: 1000,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         animation: "fadeIn 0.15s ease",
//       }}
//     >
//       <style>{`
//         @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
//         @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
//         .modal-item:hover { background: #162032 !important; border-color: ${accent}44 !important; }
//         .modal-scroll::-webkit-scrollbar { width: 6px; }
//         .modal-scroll::-webkit-scrollbar-track { background: transparent; }
//         .modal-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
//         .close-btn:hover { background: #334155 !important; color: #f1f5f9 !important; }
//       `}</style>

//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           background: "#1a2744",
//           border: `1px solid ${accent}33`,
//           borderTop: `3px solid ${accent}`,
//           borderRadius: "16px",
//           padding: "28px",
//           width: "580px",
//           maxHeight: "72vh",
//           display: "flex",
//           flexDirection: "column",
//           boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${accent}11`,
//           animation: "slideUp 0.2s ease",
//         }}
//       >
//         {/* Header */}
//         <div style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "20px",
//         }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//             <div style={{
//               width: "36px", height: "36px",
//               borderRadius: "10px",
//               background: `${accent}22`,
//               border: `1px solid ${accent}44`,
//               display: "flex", alignItems: "center", justifyContent: "center",
//               fontSize: "18px",
//             }}>
//               {icons[type]}
//             </div>
//             <div>
//               <h2 style={{ color: C.bright, fontSize: "17px", fontWeight: "700", margin: 0 }}>
//                 {type}
//               </h2>
//               {!loading && (
//                 <p style={{ color: C.text, fontSize: "12px", margin: 0 }}>
//                   {data.length} {type.toLowerCase()} found
//                 </p>
//               )}
//             </div>
//           </div>
//           <button
//             className="close-btn"
//             onClick={onClose}
//             style={{
//               background: "none",
//               border: "1px solid #334155",
//               color: C.text,
//               cursor: "pointer",
//               fontSize: "16px",
//               width: "32px", height: "32px",
//               borderRadius: "8px",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               transition: "all 0.15s",
//             }}
//           >
//             ✕
//           </button>
//         </div>

//         {/* Search bar */}
//         {!loading && data.length > 0 && (
//           <SearchableList type={type} data={data} accent={accent} />
//         )}

//         {/* Loading state */}
//         {loading && (
//           <div style={{ textAlign: "center", padding: "48px", color: C.text }}>
//             <div style={{ fontSize: "36px", marginBottom: "14px", animation: "spin 1s linear infinite" }}>⏳</div>
//             <div style={{ fontSize: "13px" }}>Loading {type.toLowerCase()}...</div>
//           </div>
//         )}

//         {/* Empty state */}
//         {!loading && data.length === 0 && (
//           <div style={{ textAlign: "center", padding: "48px", color: C.text }}>
//             <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
//             <div style={{ fontSize: "13px" }}>No {type.toLowerCase()} found.</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function SearchableList({ type, data, accent }: { type: ModalType; data: any[]; accent: string }) {
//   const [query, setQuery] = useState("");

//   const filtered = data.filter((item: any) =>
//     (item.displayName || item.name || "").toLowerCase().includes(query.toLowerCase()) ||
//     (item.description || "").toLowerCase().includes(query.toLowerCase())
//   );

//   return (
//     <>
//       {/* Search */}
//       <div style={{ marginBottom: "14px", position: "relative" }}>
//         <span style={{
//           position: "absolute", left: "12px", top: "50%",
//           transform: "translateY(-50%)", fontSize: "13px", color: C.text,
//         }}>🔍</span>
//         <input
//           type="text"
//           placeholder={`Search ${type.toLowerCase()}...`}
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           style={{
//             width: "100%",
//             padding: "9px 12px 9px 34px",
//             background: "#0f172a",
//             border: `1px solid #334155`,
//             borderRadius: "8px",
//             color: C.bright,
//             fontSize: "13px",
//             outline: "none",
//             boxSizing: "border-box",
//           }}
//         />
//       </div>

//       {/* List */}
//       <div
//         className="modal-scroll"
//         style={{ overflowY: "auto", flex: 1 }}
//       >
//         {filtered.length === 0 ? (
//           <div style={{ textAlign: "center", padding: "32px", color: C.text, fontSize: "13px" }}>
//             No results for "{query}"
//           </div>
//         ) : (
//           filtered.map((item: any, i: number) => (
//             <div
//               key={item.id ?? i}
//               className="modal-item"
//               style={{
//                 padding: "13px 16px",
//                 borderRadius: "10px",
//                 marginBottom: "8px",
//                 background: "#0f172a",
//                 border: "1px solid #1e293b",
//                 transition: "all 0.15s",
//                 cursor: "default",
//               }}
//             >
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
//                 <div style={{ flex: 1, minWidth: 0 }}>

//                   {/* Name */}
//                   <div style={{ color: C.bright, fontWeight: "600", fontSize: "14px", marginBottom: "3px" }}>
//                     {item.displayName || item.name}
//                   </div>

//                   {/* Description */}
//                   {item.description && (
//                     <div style={{ color: C.text, fontSize: "12px", lineHeight: "1.5",
//                       overflow: "hidden", textOverflow: "ellipsis",
//                       display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
//                     }}>
//                       {item.description.replace(/\n\n<!-- PolicyGuard:.*?-->/s, "")}
//                     </div>
//                   )}

//                   {/* Tags row */}
//                   <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>

//                     {/* POLICIES → rules count + rule effects */}
//                     {type === "Policies" && (
//                       <>
//                         <Tag
//                           label={`${item.rules?.length ?? 0} rule${item.rules?.length !== 1 ? "s" : ""}`}
//                           color={accent}
//                         />
//                         {item.rules?.slice(0, 3).map((r: any, ri: number) => (
//                           <Tag
//                             key={ri}
//                             label={r.effect === "ALLOW" ? "✓ ALLOW" : "✗ DENY"}
//                             color={r.effect === "ALLOW" ? C.low : C.high}
//                           />
//                         ))}
//                       </>
//                     )}

//                     {/* ROLES → linked policies */}
//                     {type === "Roles" && item.policies?.length > 0 && (
//                       item.policies.slice(0, 4).map((p: any) => (
//                         <Tag key={p.id} label={`📋 ${p.displayName || p.name}`} color={accent} />
//                       ))
//                     )}
//                     {type === "Roles" && (!item.policies || item.policies.length === 0) && (
//                       <Tag label="No policies attached" color={C.text} />
//                     )}

//                     {/* GLOSSARIES → owners */}
//                     {type === "Glossaries" && item.owners?.length > 0 && (
//                       item.owners.map((o: any) => (
//                         <Tag
//                           key={o.id}
//                           label={`${o.type === "team" ? "👥" : "👤"} ${o.name}`}
//                           color={accent}
//                         />
//                       ))
//                     )}
//                     {type === "Glossaries" && (!item.owners || item.owners.length === 0) && (
//                       <Tag label="⚠ No owner" color={C.high} />
//                     )}

//                     {/* GLOSSARIES → cert status */}
//                     {type === "Glossaries" && (() => {
//                       const hasCert = item.description?.includes("PolicyGuard: certifiedOn");
//                       return hasCert
//                         ? <Tag label="🏅 Certified" color={C.low} />
//                         : <Tag label="Uncertified" color={C.text} />;
//                     })()}
//                   </div>
//                 </div>

//                 {/* Index badge */}
//                 <span style={{
//                   fontSize: "10px", color: "#475569",
//                   fontFamily: "monospace",
//                   background: "#0f172a",
//                   border: "1px solid #1e293b",
//                   padding: "2px 6px", borderRadius: "4px",
//                   whiteSpace: "nowrap", flexShrink: 0,
//                 }}>
//                   #{String(i + 1).padStart(2, "0")}
//                 </span>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Footer count */}
//       <div style={{
//         marginTop: "14px",
//         paddingTop: "14px",
//         borderTop: `1px solid #334155`,
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//       }}>
//         <span style={{ color: C.text, fontSize: "12px" }}>
//           {query ? `${filtered.length} of ${data.length} shown` : `${data.length} total`}
//         </span>
//         <div style={{
//           width: "8px", height: "8px", borderRadius: "50%",
//           background: accent,
//           boxShadow: `0 0 6px ${accent}`,
//         }} />
//       </div>
//     </>
//   );
// }

// function Tag({ label, color }: { label: string; color: string }) {
//   return (
//     <span style={{
//       fontSize: "11px",
//       padding: "2px 8px",
//       borderRadius: "20px",
//       background: `${color}18`,
//       color,
//       border: `1px solid ${color}30`,
//       whiteSpace: "nowrap",
//     }}>
//       {label}
//     </span>
//   );
// }

// // ─── MAIN DASHBOARD ──────────────────────────────────────────
// export default function Dashboard() {
//   const { token, email } = useAuth();
//   const navigate = useNavigate();

//   const [stats, setStats] = useState<any>(null);
//   const [findings, setFindings] = useState<any[]>([]);
//   const [certs, setCerts] = useState<any[]>([]);
//   const [score, setScore] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Modal state
//   const [modal, setModal] = useState<{
//     type: ModalType | null;
//     data: any[];
//     loading: boolean;
//   }>({ type: null, data: [], loading: false });

//   // Hover state for clickable cards
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//       useEffect(() => {
//       if (!token) return;

//       const api = getApi(token);

//       Promise.all([
//         api.get("/api/stats"),
//         api.get("/api/findings"),
//         api.get("/api/certifications"),
//         api.get("/api/score"),
//       ])
//         .then(([s, f, c, sc]) => {
//           setStats(s.data);
//           setFindings(Array.isArray(f.data) ? f.data : []);
//           setCerts(Array.isArray(c.data) ? c.data : []);
//           setScore(sc.data);
//         })
//         .catch((err) => setError(err.message))
//         .finally(() => setLoading(false));
//     }, [token]);

//   const openModal = async (type: ModalType) => {
//     setModal({ type, data: [], loading: true });
//     try {
//       const endpoint = type.toLowerCase(); // policies, roles, glossaries
//       const res = await axios.get(`/api/${endpoint}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setModal({ type, data: Array.isArray(res.data) ? res.data : [], loading: false });
//     } catch {
//       setModal({ type, data: [], loading: false });
//     }
//   };

//   const closeModal = () => setModal({ type: null, data: [], loading: false });

//   const high = findings.filter(f => f.severity === "HIGH").length;
//   const medium = findings.filter(f => f.severity === "MEDIUM").length;
//   const low = findings.filter(f => f.severity === "LOW").length;

//   const pieData = [
//     { name: "High", value: high, color: C.high },
//     { name: "Medium", value: medium, color: C.medium },
//     { name: "Low", value: low, color: C.low },
//   ].filter(d => d.value > 0);

//   const barData = stats ? [
//     { name: "Policies", value: stats.policies ?? 0, fill: C.purple },
//     { name: "Roles", value: stats.roles ?? 0, fill: C.blue },
//     { name: "Glossaries", value: stats.glossaries ?? 0, fill: C.low },
//     { name: "Users", value: stats.users ?? 0, fill: C.medium },
//     { name: "Teams", value: stats.teams ?? 0, fill: C.high },
//   ] : [];

//   const certStatusData = [
//     { name: "Active", value: certs.filter(c => c.status === "ACTIVE").length, color: C.low },
//     { name: "Expiring", value: certs.filter(c => c.status === "EXPIRING_SOON").length, color: C.medium },
//     { name: "Expired", value: certs.filter(c => c.status === "EXPIRED").length, color: C.high },
//     { name: "Uncertified", value: certs.filter(c => c.status === "UNCERTIFIED").length, color: C.text },
//   ];

//     const scoreBreakdown = [
//     { name: "Policy Coverage", value: score?.breakdown?.policyCoverage ?? 0, max: 25, color: C.purple },
//     { name: "Ownership Health", value: score?.breakdown?.ownershipHealth ?? 0, max: 25, color: C.blue },
//     { name: "Team Structure", value: score?.breakdown?.teamStructure ?? 0, max: 25, color: C.low },
//     { name: "Certification Rate", value: score?.breakdown?.certificationRate ?? 0, max: 25, color: C.medium },
//   ];

//   const typeData = findings.reduce((acc: any[], f) => {
//     const existing = acc.find(a => a.type === f.type);
//     if (existing) existing.count++;
//     else acc.push({ type: f.type.replace(/_/g, " "), count: 1 });
//     return acc;
//   }, []);

//   const CLICKABLE: ModalType[] = ["Policies", "Roles", "Glossaries"];

//   if (loading) return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center" }}>
//         <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛡️</div>
//         <div style={{ color: C.text, fontSize: "14px" }}>Loading governance data...</div>
//       </div>
//     </div>
//   );

//   if (error) return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center" }}>
//         <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
//         <div style={{ color: C.high, fontSize: "16px", marginBottom: "8px" }}>Failed to load: {error}</div>
//         <div style={{ color: C.text, fontSize: "13px", marginBottom: "24px" }}>
//           Make sure OpenMetadata is running at localhost:8585
//         </div>
//         <button onClick={() => window.location.reload()} style={{
//           padding: "10px 24px",
//           background: "linear-gradient(135deg, #667eea, #764ba2)",
//           border: "none", borderRadius: "8px",
//           color: "white", cursor: "pointer", fontSize: "14px"
//         }}>🔄 Retry</button>
//       </div>
//     </div>
//   );

//   return (
//     <div style={{ maxWidth: "1200px" }}>
//       {/* Header */}
//       <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//         <div>
//           <h1 style={{ fontSize: "26px", fontWeight: "700", color: C.bright, letterSpacing: "-0.5px" }}>
//             Governance Overview
//           </h1>
//           <p style={{ color: C.text, marginTop: "4px", fontSize: "13px" }}>
//             {email} · {new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
//           </p>
//         </div>
//         <div style={{ display: "flex", gap: "8px" }}>
//           {[
//             { label: "🔍 Audit", path: "/audit" },
//             { label: "🤝 Delegate", path: "/delegate" },
//             { label: "🏅 Certify", path: "/certify" },
//           ].map(a => (
//             <button key={a.path} onClick={() => navigate(a.path)} style={{
//               padding: "8px 14px",
//               background: "linear-gradient(135deg, #667eea, #764ba2)",
//               border: "none", borderRadius: "8px",
//               color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//             }}>{a.label}</button>
//           ))}
//         </div>
//       </div>

//       {/* Top row — Risk Score + Stat Cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", marginBottom: "20px" }}>

//         {/* Risk Score Card */}
//         <div style={{
//           background: C.card,
//           border: `1px solid ${score?.risk === "LOW" ? C.low : score?.risk === "MODERATE" ? C.medium : C.high}44`,
//           borderRadius: "16px", padding: "24px",
//           boxShadow: `0 0 20px ${score?.risk === "LOW" ? C.low : score?.risk === "MODERATE" ? C.medium : C.high}11`,
//           display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
//         }}>
//           <div style={{ fontSize: "13px", color: C.text, marginBottom: "12px", fontWeight: "600", letterSpacing: "1px" }}>
//             GOVERNANCE SCORE
//           </div>
//           {score && <RiskGauge score={score.total} risk={score.risk} />}
//           <div style={{ marginTop: "16px", width: "100%" }}>
//             {scoreBreakdown.map(item => (
//               <div key={item.name} style={{ marginBottom: "8px" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                   <span style={{ fontSize: "11px", color: C.text }}>{item.name}</span>
//                   <span style={{ fontSize: "11px", color: item.color, fontWeight: "600" }}>{item.value}/{item.max}</span>
//                 </div>
//                 <div style={{ height: "4px", background: "#0f172a", borderRadius: "2px" }}>
//                   <div style={{
//                     height: "100%", borderRadius: "2px",
//                     width: `${(item.value / item.max) * 100}%`,
//                     background: item.color,
//                     transition: "width 1s ease",
//                   }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Stat Cards Grid */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
//           {[
//             { label: "Policies", value: stats?.policies ?? 0, icon: "📋", color: C.purple, sub: "governance rules" },
//             { label: "Roles", value: stats?.roles ?? 0, icon: "🔑", color: C.blue, sub: "access roles" },
//             { label: "Glossaries", value: stats?.glossaries ?? 0, icon: "📚", color: C.low, sub: "data glossaries" },
//             { label: "Users", value: stats?.users ?? 0, icon: "👥", color: C.medium, sub: "active users" },
//             { label: "Teams", value: stats?.teams ?? 0, icon: "👨‍👩‍👧", color: C.high, sub: "team groups" },
//             {
//               label: "Issues",
//               value: high + medium + low,
//               icon: high > 0 ? "🔴" : "✅",
//               color: high > 0 ? C.high : C.low,
//               sub: `${high} critical`,
//             },
//           ].map(card => {
//             const isClickable = CLICKABLE.includes(card.label as ModalType);
//             const isHovered = hoveredCard === card.label;
//             return (
//               <div
//                 key={card.label}
//                 onClick={() => isClickable && openModal(card.label as ModalType)}
//                 onMouseEnter={() => isClickable && setHoveredCard(card.label)}
//                 onMouseLeave={() => setHoveredCard(null)}
//                 style={{
//                   background: isHovered ? "#243350" : C.card,
//                   border: `1px solid ${isHovered ? card.color + "88" : C.border}`,
//                   borderRadius: "12px",
//                   padding: "16px 20px",
//                   borderLeft: `3px solid ${card.color}`,
//                   cursor: isClickable ? "pointer" : "default",
//                   transition: "all 0.2s ease",
//                   transform: isHovered ? "translateY(-2px)" : "translateY(0)",
//                   boxShadow: isHovered ? `0 8px 24px ${card.color}22` : "none",
//                   position: "relative",
//                 }}
//               >
//                 {/* Clickable hint */}
//                 {isClickable && (
//                   <div style={{
//                     position: "absolute",
//                     top: "8px",
//                     right: "8px",
//                     fontSize: "9px",
//                     color: card.color,
//                     opacity: isHovered ? 1 : 0,
//                     transition: "opacity 0.2s",
//                     fontWeight: "600",
//                     letterSpacing: "0.5px",
//                   }}>
//                     VIEW ALL ↗
//                   </div>
//                 )}
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                   <div>
//                     <div style={{ fontSize: "24px", fontWeight: "700", color: card.color, fontFamily: "monospace" }}>
//                       <AnimatedNumber target={card.value} />
//                     </div>
//                     <div style={{ fontSize: "13px", color: C.bright, marginTop: "2px", fontWeight: "600" }}>{card.label}</div>
//                     <div style={{ fontSize: "11px", color: C.text, marginTop: "2px" }}>{card.sub}</div>
//                   </div>
//                   <div style={{ fontSize: "24px" }}>{card.icon}</div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Middle row */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>

//         {/* Findings pie */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             🔍 FINDINGS BY SEVERITY
//           </h2>
//           {pieData.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "32px", color: C.low }}>
//               <div style={{ fontSize: "40px" }}>✅</div>
//               <div style={{ marginTop: "8px", fontSize: "14px" }}>No findings! Governance is healthy.</div>
//             </div>
//           ) : (
//             <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
//               <ResponsiveContainer width={150} height={150}>
//                 <PieChart>
//                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={65} dataKey="value" paddingAngle={4}>
//                     {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//                   </Pie>
//                 </PieChart>
//               </ResponsiveContainer>
//               <div style={{ flex: 1 }}>
//                 {[
//                   { label: "Critical", value: high, color: C.high },
//                   { label: "Medium", value: medium, color: C.medium },
//                   { label: "Low", value: low, color: C.low },
//                 ].map(item => (
//                   <div key={item.label} style={{
//                     display: "flex", justifyContent: "space-between",
//                     alignItems: "center", marginBottom: "10px",
//                     padding: "8px 12px", borderRadius: "8px",
//                     background: `${item.color}11`,
//                     border: `1px solid ${item.color}22`,
//                   }}>
//                     <span style={{ fontSize: "12px", color: C.text }}>{item.label}</span>
//                     <span style={{ fontSize: "18px", fontWeight: "700", color: item.color, fontFamily: "monospace" }}>{item.value}</span>
//                   </div>
//                 ))}
//                 <button onClick={() => navigate("/audit")} style={{
//                   width: "100%", marginTop: "4px", padding: "8px",
//                   background: "linear-gradient(135deg, #667eea22, #764ba222)",
//                   border: `1px solid #667eea44`, borderRadius: "6px",
//                   color: "#a78bfa", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//                 }}>View All Findings →</button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Cert status */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             🏅 CERTIFICATION STATUS
//           </h2>
//           <ResponsiveContainer width="100%" height={150}>
//             <BarChart data={certStatusData} barSize={28}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
//               <XAxis dataKey="name" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <YAxis tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.bright, fontSize: "12px" }} />
//               <Bar dataKey="value" radius={[4, 4, 0, 0]}>
//                 {certStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//           <button onClick={() => navigate("/certify")} style={{
//             width: "100%", marginTop: "12px", padding: "8px",
//             background: "linear-gradient(135deg, #667eea22, #764ba222)",
//             border: `1px solid #667eea44`, borderRadius: "6px",
//             color: "#a78bfa", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//           }}>Manage Certifications →</button>
//         </div>
//       </div>

//       {/* Bottom row */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

//         {/* Asset breakdown */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             📊 ASSET BREAKDOWN
//           </h2>
//           <ResponsiveContainer width="100%" height={160}>
//             <BarChart data={barData} layout="vertical" barSize={14}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
//               <XAxis type="number" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <YAxis type="category" dataKey="name" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
//               <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.bright, fontSize: "12px" }} />
//               <Bar dataKey="value" radius={[0, 4, 4, 0]}>
//                 {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Finding types + Quick actions */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             ⚠️ FINDING TYPES
//           </h2>
//           {typeData.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "24px", color: C.low }}>
//               <div style={{ fontSize: "32px" }}>✅</div>
//               <div style={{ marginTop: "8px", fontSize: "13px" }}>No issues detected!</div>
//             </div>
//           ) : (
//             <div style={{ marginBottom: "16px" }}>
//               {typeData.map((t, i) => (
//                 <div key={i} style={{
//                   display: "flex", justifyContent: "space-between", alignItems: "center",
//                   padding: "8px 0",
//                   borderBottom: i < typeData.length - 1 ? `1px solid ${C.border}` : "none"
//                 }}>
//                   <span style={{ fontSize: "12px", color: C.text }}>{t.type.toLowerCase()}</span>
//                   <span style={{
//                     padding: "2px 10px", borderRadius: "20px",
//                     background: "rgba(239,68,68,0.1)", color: C.high,
//                     fontSize: "11px", fontWeight: "700"
//                   }}>{t.count}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "auto" }}>
//             {[
//               { label: "🔐 Pre-Delegate", path: "/pre-delegate" },
//               { label: "🤝 Delegate", path: "/delegate" },
//               { label: "🔍 Audit", path: "/audit" },
//               { label: "🏅 Certify", path: "/certify" },
//             ].map(a => (
//               <button key={a.path} onClick={() => navigate(a.path)} style={{
//                 padding: "8px",
//                 background: "linear-gradient(135deg, #667eea22, #764ba222)",
//                 border: `1px solid #667eea44`,
//                 borderRadius: "6px", color: "#a78bfa",
//                 cursor: "pointer", fontSize: "11px", fontWeight: "600"
//               }}>{a.label}</button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ─── MODAL ─────────────────────────────────────────────── */}
//       {modal.type && (
//         <DetailModal
//           type={modal.type}
//           data={modal.data}
//           loading={modal.loading}
//           onClose={closeModal}
//         />
//       )}
//     </div>
//   );
// }









//third part 



import { getApi } from "../api";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const C = {
  high: "#f87171",
  medium: "#fbbf24",
  low: "#34d399",
  purple: "#a78bfa",
  blue: "#60a5fa",
  bg: "#07090f",
  card: "#0d1117",
  border: "#1a2332",
  borderLight: "#1e2d3d",
  text: "#64748b",
  textMid: "#94a3b8",
  bright: "#e2e8f0",
  white: "#f8fafc",
  accent: "#6366f1",
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
    }

    .dash-row > * { animation: fadeUp 0.4s ease both; }
    .dash-row > *:nth-child(1) { animation-delay: 0.05s; }
    .dash-row > *:nth-child(2) { animation-delay: 0.1s; }
    .dash-row > *:nth-child(3) { animation-delay: 0.15s; }
    .dash-row > *:nth-child(4) { animation-delay: 0.2s; }
    .dash-row > *:nth-child(5) { animation-delay: 0.25s; }
    .dash-row > *:nth-child(6) { animation-delay: 0.3s; }

    .stat-card { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
    .stat-card:hover { transform: translateY(-2px); }

    .nav-btn { transition: all 0.15s ease; }
    .nav-btn:hover { opacity: 0.85; transform: translateY(-1px); }

    .action-btn { transition: all 0.15s ease; }
    .action-btn:hover { transform: translateY(-1px); opacity: 0.85; }

    .close-btn:hover { background: #1a2332 !important; color: #e2e8f0 !important; }

    .modal-scroll::-webkit-scrollbar { width: 4px; }
    .modal-scroll::-webkit-scrollbar-track { background: transparent; }
    .modal-scroll::-webkit-scrollbar-thumb { background: #1e2d3d; border-radius: 2px; }

    .modal-item:hover { background: #111827 !important; border-color: #1e2d3d !important; }

    input:focus {
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
      outline: none;
    }
  `}</style>
);

function AnimatedNumber({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCurrent(target); clearInterval(timer); }
      else setCurrent(start);
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return <>{current}</>;
}

function RiskGauge({ score, risk }: { score: number; risk: string }) {
  const color = risk === "LOW" ? C.low : risk === "MODERATE" ? C.medium : C.high;
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    let s = 0;
    const timer = setInterval(() => {
      s += 1;
      if (s >= score) { setAnimated(score); clearInterval(timer); }
      else setAnimated(s);
    }, 15);
    return () => clearInterval(timer);
  }, [score]);

  const circumference = Math.PI * 56;
  const strokeDash = (animated / 100) * circumference;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="152" height="88" viewBox="0 0 152 88">
        <path d="M 16 80 A 60 60 0 0 1 136 80" fill="none" stroke="#07090f" strokeWidth="8" strokeLinecap="round" />
        <path d="M 16 80 A 60 60 0 0 1 136 80" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`} opacity="0.15" style={{ filter: "blur(4px)" }} />
        <path d="M 16 80 A 60 60 0 0 1 136 80" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.05s linear" }} />
        <text x="76" y="68" textAnchor="middle" fill={color} fontSize="28" fontWeight="700"
          fontFamily="'JetBrains Mono', monospace">{animated}</text>
        <text x="76" y="82" textAnchor="middle" fill={C.text} fontSize="10" fontFamily="'Syne', sans-serif">/ 100</text>
      </svg>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "3px 12px", borderRadius: "20px",
        background: `${color}12`, color,
        fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px",
        border: `1px solid ${color}25`, fontFamily: "'Syne', sans-serif",
      }}>
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, display: "inline-block" }} />
        {risk} RISK
      </div>
    </div>
  );
}

function ScoreBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
        <span style={{ fontSize: "11px", color: C.textMid, fontFamily: "'Syne', sans-serif" }}>{label}</span>
        <span style={{ fontSize: "10px", color, fontFamily: "'JetBrains Mono', monospace", fontWeight: "600" }}>{value}/{max}</span>
      </div>
      <div style={{ height: "3px", background: "#07090f", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: "2px",
          width: `${(value / max) * 100}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 8px ${color}50`,
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
}

type ModalType = "Policies" | "Roles" | "Glossaries";

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: "10px", padding: "2px 7px", borderRadius: "4px",
      background: `${color}12`, color, border: `1px solid ${color}25`,
      whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace",
    }}>{label}</span>
  );
}

function SearchableList({ type, data, accent }: { type: ModalType; data: any[]; accent: string }) {
  const [query, setQuery] = useState("");
  const filtered = data.filter((item: any) =>
    (item.displayName || item.name || "").toLowerCase().includes(query.toLowerCase()) ||
    (item.description || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div style={{ marginBottom: "12px", position: "relative" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.text, fontSize: "12px" }}>⌕</span>
        <input type="text" placeholder={`Search ${type.toLowerCase()}...`}
          value={query} onChange={e => setQuery(e.target.value)}
          style={{
            width: "100%", padding: "9px 12px 9px 32px",
            background: "#07090f", border: `1px solid ${C.border}`,
            borderRadius: "8px", color: C.bright, fontSize: "13px",
            boxSizing: "border-box", fontFamily: "'Syne', sans-serif",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }} />
      </div>

      <div className="modal-scroll" style={{ overflowY: "auto", flex: 1 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: C.text, fontSize: "13px", fontFamily: "'Syne', sans-serif" }}>
            No results for "{query}"
          </div>
        ) : filtered.map((item: any, i: number) => (
          <div key={item.id ?? i} className="modal-item" style={{
            padding: "12px 14px", borderRadius: "8px", marginBottom: "6px",
            background: "#07090f", border: `1px solid ${C.border}`,
            transition: "all 0.15s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.white, fontWeight: "600", fontSize: "13px", marginBottom: "3px", fontFamily: "'Syne', sans-serif" }}>
                  {item.displayName || item.name}
                </div>
                {item.description && (
                  <div style={{
                    color: C.text, fontSize: "11px", lineHeight: "1.5", marginBottom: "8px",
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                  }}>
                    {item.description.replace(/\n\n<!-- .*?-->/gs, "")}
                  </div>
                )}
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {type === "Policies" && (<>
                    <Tag label={`${item.rules?.length ?? 0} rules`} color={accent} />
                    {item.rules?.slice(0, 3).map((r: any, ri: number) => (
                      <Tag key={ri} label={r.effect} color={r.effect === "ALLOW" ? C.low : C.high} />
                    ))}
                  </>)}
                  {type === "Roles" && (item.policies?.length > 0
                    ? item.policies.slice(0, 4).map((p: any) => <Tag key={p.id} label={p.displayName || p.name} color={accent} />)
                    : <Tag label="no policies" color={C.text} />
                  )}
                  {type === "Glossaries" && (<>
                    {item.owners?.length > 0
                      ? item.owners.map((o: any) => <Tag key={o.id} label={`${o.type} · ${o.name}`} color={accent} />)
                      : <Tag label="no owner" color={C.high} />}
                    <Tag label={item.description?.includes("certifiedOn") ? "certified" : "uncertified"}
                      color={item.description?.includes("certifiedOn") ? C.low : C.text} />
                  </>)}
                </div>
              </div>
              <span style={{
                fontSize: "10px", color: C.text, fontFamily: "'JetBrains Mono', monospace",
                background: C.card, border: `1px solid ${C.border}`,
                padding: "2px 6px", borderRadius: "4px", flexShrink: 0,
              }}>{String(i + 1).padStart(2, "0")}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: C.text, fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>
          {query ? `${filtered.length} / ${data.length}` : `${data.length} total`}
        </span>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}` }} />
      </div>
    </>
  );
}

function DetailModal({ type, data, loading, onClose }: { type: ModalType; data: any[]; loading: boolean; onClose: () => void }) {
  const accentColors: Record<ModalType, string> = { Policies: C.purple, Roles: C.blue, Glossaries: C.low };
  const accent = accentColors[type];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(8px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.15s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, border: `1px solid ${C.borderLight}`,
        borderTop: `2px solid ${accent}`, borderRadius: "16px",
        padding: "24px", width: "560px", maxHeight: "70vh",
        display: "flex", flexDirection: "column",
        boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 60px ${accent}08`,
        animation: "slideUp 0.2s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ color: C.white, fontSize: "15px", fontWeight: "700", margin: 0, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.3px" }}>
              {type}
            </h2>
            {!loading && (
              <p style={{ color: C.text, fontSize: "11px", margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                {data.length} {type.toLowerCase()} in system
              </p>
            )}
          </div>
          <button className="close-btn" onClick={onClose} style={{
            background: "none", border: `1px solid ${C.border}`,
            color: C.text, cursor: "pointer", fontSize: "14px",
            width: "30px", height: "30px", borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: C.text, fontFamily: "'Syne', sans-serif", fontSize: "13px" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px", animation: "pulse 1.5s ease infinite" }}>◌</div>
            Loading {type.toLowerCase()}...
          </div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: C.text, fontFamily: "'Syne', sans-serif", fontSize: "13px" }}>
            No {type.toLowerCase()} found.
          </div>
        ) : (
          <SearchableList type={type} data={data} accent={accent} />
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { token, email } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: ModalType | null; data: any[]; loading: boolean }>
    ({ type: null, data: [], loading: false });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const api = getApi(token);
    Promise.all([
      api.get("/api/stats"),
      api.get("/api/findings"),
      api.get("/api/certifications"),
      api.get("/api/score"),
    ]).then(([s, f, c, sc]) => {
      setStats(s.data);
      setFindings(Array.isArray(f.data) ? f.data : []);
      setCerts(Array.isArray(c.data) ? c.data : []);
      setScore(sc.data);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const openModal = async (type: ModalType) => {
    setModal({ type, data: [], loading: true });
    try {
      const res = await axios.get(`/api/${type.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      setModal({ type, data: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch {
      setModal({ type, data: [], loading: false });
    }
  };

  const closeModal = () => setModal({ type: null, data: [], loading: false });

  const high = findings.filter(f => f.severity === "HIGH").length;
  const medium = findings.filter(f => f.severity === "MEDIUM").length;
  const low = findings.filter(f => f.severity === "LOW").length;

  const pieData = [
    { name: "High", value: high, color: C.high },
    { name: "Medium", value: medium, color: C.medium },
    { name: "Low", value: low, color: C.low },
  ].filter(d => d.value > 0);

  const barData = stats ? [
    { name: "Policies", value: stats.policies ?? 0, fill: C.purple },
    { name: "Roles", value: stats.roles ?? 0, fill: C.blue },
    { name: "Glossaries", value: stats.glossaries ?? 0, fill: C.low },
    { name: "Users", value: stats.users ?? 0, fill: C.medium },
    { name: "Teams", value: stats.teams ?? 0, fill: C.high },
  ] : [];

  const certStatusData = [
    { name: "Active", value: certs.filter(c => c.status === "ACTIVE").length, color: C.low },
    { name: "Expiring", value: certs.filter(c => c.status === "EXPIRING_SOON").length, color: C.medium },
    { name: "Expired", value: certs.filter(c => c.status === "EXPIRED").length, color: C.high },
    { name: "Uncertified", value: certs.filter(c => c.status === "UNCERTIFIED").length, color: C.text },
  ];

  const scoreBreakdown = [
    { name: "Policy Coverage", value: score?.breakdown?.policyCoverage ?? 0, max: 25, color: C.purple },
    { name: "Ownership Health", value: score?.breakdown?.ownershipHealth ?? 0, max: 25, color: C.blue },
    { name: "Team Structure", value: score?.breakdown?.teamStructure ?? 0, max: 25, color: C.low },
    { name: "Certification Rate", value: score?.breakdown?.certificationRate ?? 0, max: 25, color: C.medium },
  ];

  const typeData = findings.reduce((acc: any[], f) => {
    const existing = acc.find(a => a.type === f.type);
    if (existing) existing.count++;
    else acc.push({ type: f.type.replace(/_/g, " "), count: 1 });
    return acc;
  }, []);

  const CLICKABLE: ModalType[] = ["Policies", "Roles", "Glossaries"];
  const riskColor = score?.risk === "LOW" ? C.low : score?.risk === "MODERATE" ? C.medium : C.high;

  if (loading) return (
    <>
      <GlobalStyles />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px", animation: "pulse 1.5s ease infinite" }}>◌</div>
          <div style={{ color: C.text, fontSize: "13px", fontFamily: "'Syne', sans-serif", letterSpacing: "0.5px" }}>
            Loading governance data...
          </div>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <GlobalStyles />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>—</div>
          <div style={{ color: C.high, fontSize: "14px", marginBottom: "6px", fontFamily: "'Syne', sans-serif" }}>
            Failed to load
          </div>
          <div style={{ color: C.text, fontSize: "12px", marginBottom: "24px", fontFamily: "'JetBrains Mono', monospace" }}>
            {error}
          </div>
          <button onClick={() => window.location.reload()} className="nav-btn" style={{
            padding: "10px 24px", background: C.accent,
            border: "none", borderRadius: "8px", color: "white",
            cursor: "pointer", fontSize: "13px", fontFamily: "'Syne', sans-serif", fontWeight: "600",
          }}>Retry</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <GlobalStyles />
      <div style={{ maxWidth: "1200px", fontFamily: "'Syne', sans-serif" }}>

        {/* ── Header ── */}
        <div style={{
          marginBottom: "32px", display: "flex",
          justifyContent: "space-between", alignItems: "flex-start",
          animation: "fadeUp 0.3s ease",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{
                width: "6px", height: "24px", borderRadius: "3px",
                background: `linear-gradient(180deg, ${C.accent}, ${C.purple})`,
              }} />
              <h1 style={{ fontSize: "22px", fontWeight: "800", color: C.white, letterSpacing: "-0.5px", margin: 0 }}>
                Governance Overview
              </h1>
            </div>
            <p style={{ color: C.text, fontSize: "12px", margin: 0, fontFamily: "'JetBrains Mono', monospace", paddingLeft: "16px" }}>
              {email} · {new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { label: "Audit", path: "/audit", color: C.purple },
              { label: "Delegate", path: "/delegate", color: C.blue },
              { label: "Certify", path: "/certify", color: C.medium },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)} className="nav-btn" style={{
                padding: "8px 16px",
                background: `${a.color}12`,
                border: `1px solid ${a.color}30`,
                borderRadius: "8px", color: a.color,
                cursor: "pointer", fontSize: "12px", fontWeight: "600",
                fontFamily: "'Syne', sans-serif", letterSpacing: "0.3px",
              }}>{a.label}</button>
            ))}
          </div>
        </div>

        {/* ── Row 1: Score + Stats ── */}
        <div className="dash-row" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "16px", marginBottom: "16px" }}>

          {/* Score Card */}
          <div style={{
            background: C.card, border: `1px solid ${riskColor}20`,
            borderRadius: "16px", padding: "24px",
            boxShadow: `0 0 40px ${riskColor}08`,
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ fontSize: "10px", color: C.text, marginBottom: "14px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase" }}>
              Governance Score
            </div>
            {score && <RiskGauge score={score.total} risk={score.risk} />}
            <div style={{ marginTop: "20px", width: "100%" }}>
              {scoreBreakdown.map(item => (
                <ScoreBar key={item.name} value={item.value} max={item.max} color={item.color} label={item.name} />
              ))}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="dash-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {[
              { label: "Policies", value: stats?.policies ?? 0, color: C.purple, sub: "governance rules" },
              { label: "Roles", value: stats?.roles ?? 0, color: C.blue, sub: "access roles" },
              { label: "Glossaries", value: stats?.glossaries ?? 0, color: C.low, sub: "data glossaries" },
              { label: "Users", value: stats?.users ?? 0, color: C.medium, sub: "active users" },
              { label: "Teams", value: stats?.teams ?? 0, color: C.high, sub: "team groups" },
              {
                label: "Issues", value: high + medium + low,
                color: high > 0 ? C.high : C.low,
                sub: `${high} critical`,
              },
            ].map(card => {
              const isClickable = CLICKABLE.includes(card.label as ModalType);
              const isHovered = hoveredCard === card.label;
              return (
                <div key={card.label} className="stat-card"
                  onClick={() => isClickable && openModal(card.label as ModalType)}
                  onMouseEnter={() => isClickable && setHoveredCard(card.label)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: isHovered ? "#111827" : C.card,
                    border: `1px solid ${isHovered ? card.color + "40" : C.border}`,
                    borderRadius: "12px", padding: "18px",
                    cursor: isClickable ? "pointer" : "default",
                    boxShadow: isHovered ? `0 8px 32px ${card.color}15` : "none",
                    position: "relative", overflow: "hidden",
                  }}>
                  {/* Accent line */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: "2px", background: card.color,
                    opacity: isHovered ? 1 : 0.4,
                    transition: "opacity 0.2s",
                  }} />
                  {isClickable && (
                    <div style={{
                      position: "absolute", top: "10px", right: "10px",
                      fontSize: "9px", color: card.color,
                      opacity: isHovered ? 1 : 0, transition: "opacity 0.2s",
                      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px",
                    }}>VIEW ↗</div>
                  )}
                  <div style={{ fontSize: "28px", fontWeight: "800", color: card.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                    <AnimatedNumber target={card.value} />
                  </div>
                  <div style={{ fontSize: "13px", color: C.bright, marginTop: "6px", fontWeight: "600" }}>{card.label}</div>
                  <div style={{ fontSize: "10px", color: C.text, marginTop: "2px", fontFamily: "'JetBrains Mono', monospace" }}>{card.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Row 2: Findings + Certs ── */}
        <div className="dash-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

          {/* Findings */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: C.high }} />
              <h2 style={{ fontSize: "12px", fontWeight: "700", color: C.textMid, margin: 0, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Findings by Severity
              </h2>
            </div>
            {pieData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px", color: C.low }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>✓</div>
                <div style={{ fontSize: "13px" }}>No findings. Governance is healthy.</div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {[
                    { label: "Critical", value: high, color: C.high },
                    { label: "Medium", value: medium, color: C.medium },
                    { label: "Low", value: low, color: C.low },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      marginBottom: "8px", padding: "7px 10px", borderRadius: "6px",
                      background: `${item.color}08`, border: `1px solid ${item.color}15`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color }} />
                        <span style={{ fontSize: "11px", color: C.textMid }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: "16px", fontWeight: "700", color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
                    </div>
                  ))}
                  <button onClick={() => navigate("/audit")} className="action-btn" style={{
                    width: "100%", marginTop: "6px", padding: "7px",
                    background: `${C.accent}10`, border: `1px solid ${C.accent}25`,
                    borderRadius: "6px", color: C.purple, cursor: "pointer",
                    fontSize: "11px", fontWeight: "600", fontFamily: "'Syne', sans-serif",
                  }}>View All Findings →</button>
                </div>
              </div>
            )}
          </div>

          {/* Cert Status */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: C.medium }} />
              <h2 style={{ fontSize: "12px", fontWeight: "700", color: C.textMid, margin: 0, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Certification Status
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={certStatusData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0d1117" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.text, fontSize: 10, fontFamily: "'Syne', sans-serif" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.bright, fontSize: "11px", fontFamily: "'Syne', sans-serif" }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {certStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <button onClick={() => navigate("/certify")} className="action-btn" style={{
              width: "100%", marginTop: "10px", padding: "7px",
              background: `${C.medium}10`, border: `1px solid ${C.medium}25`,
              borderRadius: "6px", color: C.medium, cursor: "pointer",
              fontSize: "11px", fontWeight: "600", fontFamily: "'Syne', sans-serif",
            }}>Manage Certifications →</button>
          </div>
        </div>

        {/* ── Row 3: Asset Breakdown + Finding Types ── */}
        <div className="dash-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          {/* Asset Breakdown */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: C.blue }} />
              <h2 style={{ fontSize: "12px", fontWeight: "700", color: C.textMid, margin: 0, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Asset Breakdown
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={barData} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0d1117" horizontal={false} />
                <XAxis type="number" tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: C.textMid, fontSize: 11, fontFamily: "'Syne', sans-serif" }} axisLine={false} tickLine={false} width={68} />
                <Tooltip contentStyle={{ background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.bright, fontSize: "11px" }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Finding Types + Quick Actions */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "22px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: C.high }} />
              <h2 style={{ fontSize: "12px", fontWeight: "700", color: C.textMid, margin: 0, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Finding Types
              </h2>
            </div>
            {typeData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: C.low, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
                <div style={{ fontSize: "12px" }}>No issues detected</div>
              </div>
            ) : (
              <div style={{ flex: 1, marginBottom: "14px" }}>
                {typeData.map((t, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "7px 0",
                    borderBottom: i < typeData.length - 1 ? `1px solid ${C.border}` : "none",
                  }}>
                    <span style={{ fontSize: "11px", color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
                      {t.type.toLowerCase()}
                    </span>
                    <span style={{
                      padding: "2px 8px", borderRadius: "4px",
                      background: `${C.high}10`, color: C.high,
                      fontSize: "10px", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace",
                    }}>{t.count}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
              {[
                { label: "Pre-Delegate", path: "/pre-delegate", color: C.purple },
                { label: "Delegate", path: "/delegate", color: C.blue },
                { label: "Audit", path: "/audit", color: C.high },
                { label: "Certify", path: "/certify", color: C.medium },
              ].map(a => (
                <button key={a.path} onClick={() => navigate(a.path)} className="action-btn" style={{
                  padding: "8px",
                  background: `${a.color}10`,
                  border: `1px solid ${a.color}25`,
                  borderRadius: "6px", color: a.color,
                  cursor: "pointer", fontSize: "11px", fontWeight: "600",
                  fontFamily: "'Syne', sans-serif",
                }}>{a.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Modal ── */}
        {modal.type && (
          <DetailModal type={modal.type} data={modal.data} loading={modal.loading} onClose={closeModal} />
        )}
      </div>
    </>
  );
}