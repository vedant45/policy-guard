import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

import Terminal from "../components/Terminal";
import { getApi } from "../api";
export default function Certify() {
  const { token } = useAuth();
  const [certs, setCerts] = useState<any[]>([]);
  const [command, setCommand] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

      const fetchCerts = async () => {
      const api = getApi(token!);
      const res = await api.get("/api/certifications");
      setCerts(res.data);
      setLoading(false);
    };
  useEffect(() => { fetchCerts(); }, []);

    const certify = async (assetId: string, assetType: string) => {
    const api = getApi(token!);
    await api.post(`/api/certify/${assetId}`, { assetType });
    fetchCerts();
  };

  const statusColor = (status: string) => {
    if (status === "ACTIVE") return "#10b981";
    if (status === "EXPIRING_SOON") return "#f59e0b";
    if (status === "EXPIRED") return "#ef4444";
    return "#64748b";
  };

  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9" }}>🏅 Certify</h1>
        <button onClick={() => setCommand(`certify-${Date.now()}`)} style={{
          padding: "10px 24px",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          border: "none", borderRadius: "8px",
          color: "white", cursor: "pointer", fontWeight: "600"
        }}>Run Certify</button>
      </div>

      <Terminal command={command} />

      <div style={{ marginTop: "24px" }}>
        <h2 style={{ marginBottom: "16px", color: "#f1f5f9" }}>Certification Status</h2>
        {loading ? <div style={{ color: "#64748b" }}>Loading...</div> : (
          certs.map((cert, i) => (
            <div key={i} style={{
              background: "#1e293b", border: "1px solid #334155",
              borderRadius: "10px", padding: "20px", marginBottom: "12px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontWeight: "600", color: "#f1f5f9", marginBottom: "4px" }}>
                  {cert.assetName}
                  <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "8px" }}>
                    {cert.assetType}
                  </span>
                </div>
                <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Owner: {cert.owners || "None"}
                </div>
                {cert.validUntil && (
                  <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>
                    Valid until: {new Date(cert.validUntil).toLocaleDateString()}
                    {cert.daysRemaining !== null && (
                      <span style={{ color: statusColor(cert.status), marginLeft: "8px" }}>
                        ({cert.daysRemaining} days remaining)
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                  background: `${statusColor(cert.status)}22`,
                  color: statusColor(cert.status),
                }}>
                  {cert.status}
                </span>
                <button
                  onClick={() => certify(cert.assetId, cert.assetType)}
                  style={{
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    border: "none", borderRadius: "6px",
                    color: "white", cursor: "pointer", fontSize: "13px"
                  }}
                >
                  {cert.status === "UNCERTIFIED" ? "Certify" : "Re-Certify"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}