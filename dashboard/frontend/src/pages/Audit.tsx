import { useState } from "react";
import Terminal from "../components/Terminal";
import { useAuth } from "../context/AuthContext";


import { getApi } from "../api";

export default function Audit() {
  const { token } = useAuth();
  const [command, setCommand] = useState<string | null>(null);
  const [findings, setFindings] = useState<any[]>([]);

  const runAudit = async () => {
    setCommand(`audit-${Date.now()}`);
    const api = getApi(token!);
    const res = await api.get("/api/findings");
    setFindings(res.data);
  };

  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9" }}>🔍 Audit</h1>
        <button onClick={runAudit} style={{
          padding: "10px 24px",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          border: "none", borderRadius: "8px",
          color: "white", cursor: "pointer", fontWeight: "600"
        }}>Run Audit</button>
      </div>

      <Terminal command={command} />

      {findings.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h2 style={{ marginBottom: "16px", color: "#f1f5f9" }}>Findings ({findings.length})</h2>
          {findings.map((f, i) => (
            <div key={i} style={{
              background: "#1e293b", border: `1px solid ${f.severity === "HIGH" ? "#ef4444" : f.severity === "MEDIUM" ? "#f59e0b" : "#10b981"}33`,
              borderRadius: "10px", padding: "16px", marginBottom: "12px",
            }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <span style={{
                  padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "700",
                  background: f.severity === "HIGH" ? "#ef444433" : f.severity === "MEDIUM" ? "#f59e0b33" : "#10b98133",
                  color: f.severity === "HIGH" ? "#ef4444" : f.severity === "MEDIUM" ? "#f59e0b" : "#10b981",
                }}>{f.severity}</span>
                <span style={{ color: "#94a3b8", fontSize: "13px" }}>{f.assetType}: {f.asset}</span>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "14px" }}>❗ {f.issue}</p>
              <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>✅ {f.recommendation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}