import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

import Terminal from "../components/Terminal";
import { getApi } from "../api";

const DOMAIN_COLORS: Record<string, string> = {
  "Financial": "#f59e0b",
  "Healthcare": "#ef4444",
  "Geolocation": "#3b82f6",
  "Infrastructure": "#8b5cf6",
  "EU PII": "#ec4899",
  "General PII": "#10b981",
};

const DOMAIN_ICONS: Record<string, string> = {
  "Financial": "💰",
  "Healthcare": "🏥",
  "Geolocation": "🌍",
  "Infrastructure": "⚙️",
  "EU PII": "🇪🇺",
  "General PII": "👤",
};

export default function Classify() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [command, setCommand] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

    const fetchData = async () => {
    setLoading(true);
    try {
      const api = getApi(token!);
      const res = await api.get("/api/classifications");
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredFindings = data?.findings?.filter((f: any) =>
    !selectedDomain || f.domain === selectedDomain
  ) || [];

  return (
    <div style={{ maxWidth: "1200px", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.5px" }}>
            🏷️ Classification Engine
          </h1>
          <p style={{ color: "#374151", marginTop: "4px", fontSize: "13px" }}>
            Auto-detect sensitive data using domain-specific pattern recognizers (#26664)
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setCommand(`classify-dry-${Date.now()}`)} style={{
            padding: "8px 16px", background: "transparent",
            border: "1px solid #1f2937", borderRadius: "8px",
            color: "#374151", cursor: "pointer", fontSize: "12px", fontWeight: "600"
          }}>📋 Report Only</button>
          <button onClick={() => setCommand(`classify-${Date.now()}`)} style={{
            padding: "8px 16px",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            border: "none", borderRadius: "8px",
            color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "600"
          }}>🏷️ Auto-Classify</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Tables Scanned", value: data?.tablesScanned ?? 0, color: "#8b5cf6" },
          { label: "Patterns Used", value: data?.patternsUsed ?? 0, color: "#3b82f6" },
          { label: "Total Findings", value: data?.findings?.length ?? 0, color: "#f59e0b" },
          { label: "Domains Detected", value: data?.summary?.length ?? 0, color: "#10b981" },
        ].map(card => (
          <div key={card.label} style={{
            background: "#0d1117", border: "1px solid #0f1724",
            borderRadius: "10px", padding: "16px",
            borderLeft: `3px solid ${card.color}`,
          }}>
            <div style={{ fontSize: "24px", fontWeight: "700", color: card.color, fontFamily: "monospace" }}>
              {card.value}
            </div>
            <div style={{ fontSize: "11px", color: "#374151", marginTop: "4px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Domain cards */}
      {data?.summary?.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {data.summary.map((s: any) => {
            const color = DOMAIN_COLORS[s.domain] || "#8b5cf6";
            const icon = DOMAIN_ICONS[s.domain] || "🔍";
            const isSelected = selectedDomain === s.domain;
            return (
              <div
                key={s.domain}
                onClick={() => setSelectedDomain(isSelected ? null : s.domain)}
                style={{
                  background: isSelected ? `${color}11` : "#0d1117",
                  border: `1px solid ${isSelected ? color : "#0f1724"}`,
                  borderRadius: "10px", padding: "16px",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}>{icon}</span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{s.domain}</span>
                  </div>
                  <div style={{
                    padding: "2px 10px", borderRadius: "20px",
                    background: `${color}22`, color,
                    fontSize: "12px", fontWeight: "700"
                  }}>{s.count}</div>
                </div>
                {s.high > 0 && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#ef4444" }}>
                    ⚠️ {s.high} HIGH severity
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Findings list */}
      {filteredFindings.length > 0 && (
        <div style={{
          background: "#0d1117", border: "1px solid #0f1724",
          borderRadius: "12px", padding: "20px", marginBottom: "20px"
        }}>
          <h2 style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0", marginBottom: "16px", letterSpacing: "0.5px" }}>
            {selectedDomain ? `${DOMAIN_ICONS[selectedDomain]} ${selectedDomain} Findings` : "All Findings"}
            <span style={{ color: "#374151", fontWeight: "400", marginLeft: "8px" }}>
              ({filteredFindings.length})
            </span>
          </h2>
          {filteredFindings.map((f: any, i: number) => {
            const color = DOMAIN_COLORS[f.domain] || "#8b5cf6";
            const sevColor = f.severity === "HIGH" ? "#ef4444" : f.severity === "MEDIUM" ? "#f59e0b" : "#10b981";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 0",
                borderBottom: i < filteredFindings.length - 1 ? "1px solid #0f1724" : "none"
              }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: sevColor, flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: "#c4b5fd", fontWeight: "600" }}>
                    {f.assetName}
                    {f.columnName && <span style={{ color: "#374151", fontWeight: "400" }}> → {f.columnName}</span>}
                  </div>
                  <div style={{ fontSize: "11px", color: "#374151", marginTop: "2px" }}>{f.description}</div>
                </div>
                <div style={{
                  padding: "2px 8px", borderRadius: "4px", fontSize: "10px",
                  background: `${color}22`, color, fontWeight: "600"
                }}>{f.domain}</div>
                <div style={{
                  padding: "2px 8px", borderRadius: "4px", fontSize: "10px",
                  background: `${sevColor}22`, color: sevColor, fontWeight: "600"
                }}>{f.severity}</div>
                <div style={{ fontSize: "10px", color: "#1f2d42", fontFamily: "monospace", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {f.tag}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && data?.findings?.length === 0 && (
        <div style={{
          background: "#0d1117", border: "1px solid #0f1724",
          borderRadius: "12px", padding: "40px", textAlign: "center", marginBottom: "20px"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
          <div style={{ color: "#10b981", fontSize: "14px" }}>No sensitive patterns detected in your data assets!</div>
          <div style={{ color: "#374151", fontSize: "12px", marginTop: "4px" }}>
            Add tables with sensitive column names to test classification
          </div>
        </div>
      )}

      {/* Terminal */}
      <Terminal command={command} onDone={fetchData} />
    </div>
  );
}