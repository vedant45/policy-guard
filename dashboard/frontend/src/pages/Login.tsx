import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../config";

export default function Login() {
  const [email, setEmail] = useState("admin@open-metadata.org");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/api/login`, { email, password });
      if (res.data.success) {
        login(res.data.token, email);
        navigate("/dashboard");
      }
    } catch (e) {
      setError("Invalid credentials. Try admin@open-metadata.org / admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 100%)",
    }}>
      <div style={{
        background: "#1a1f2e",
        border: "1px solid #2d3748",
        borderRadius: "16px",
        padding: "48px",
        width: "400px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🛡️</div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Sentari</h1>
          <p style={{ color: "#718096", fontSize: "14px", marginTop: "4px" }}>
            OpenMetadata Governance Platform
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#718096", marginBottom: "6px", display: "block" }}>
              EMAIL
            </label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#0a0e1a",
                border: "1px solid #2d3748",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#718096", marginBottom: "6px", display: "block" }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#0a0e1a",
                border: "1px solid #2d3748",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#fc8181", fontSize: "13px", textAlign: "center" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: "14px",
              background: loading
                ? "#2d3748"
                : "linear-gradient(135deg, #667eea, #764ba2)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#4a5568",
          marginTop: "24px"
        }}>
          OpenMetadata Hackathon 2026 — Governance Track
        </p>
      </div>
    </div>
  );
}