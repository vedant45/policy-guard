import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import { spawn } from "child_process";
import axios from "axios";
import * as dotenv from "dotenv";
import * as path from "path";


dotenv.config({ path: "C:\\PolicyGuard\\policy-guard\\.env" });

console.log("🔍 OM URL:", process.env.OPENMETADATA_URL);
console.log("🔍 OM USER:", process.env.OPENMETADATA_USER);

const app = express();

app.use(cors({
  origin: [
    "https://sentari.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    
  ],
  credentials: true,
}));
app.use(express.json());

const PORT = parseInt(process.env.PORT || "8080");
const OM_URL = process.env.OPENMETADATA_URL || "http://localhost:8585";

// ─── SHARED HEADERS ──────────────────────────────────────────
const CF_HEADERS = {
  "ngrok-skip-browser-warning": "true",
  "User-Agent": "PolicyGuard/1.0",
  "CF-Access-Client-Id": "bypass",
};

function getClient(token?: string) {
  return axios.create({
    baseURL: `${OM_URL}/api/v1`,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...CF_HEADERS,
    },
  });
}

// ─── AUTH ────────────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const encoded = Buffer.from(password).toString("base64");
    const response = await axios.post(`${OM_URL}/api/v1/users/login`, {
      email,
      password: encoded,
    }, {
      headers: { ...CF_HEADERS },
    });
    res.json({ token: response.data.accessToken, success: true });
  } catch (err: any) {
    console.error("Login error:", err.message);
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// ─── STATS ───────────────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Stats token:", token ? token.substring(0, 20) + "..." : "MISSING");
    if (!token) return res.status(401).json({ error: "No token provided" });

    const client = getClient(token);

    const [policies, roles, glossaries, users, teams] = await Promise.all([
      client.get("/policies?limit=50"),
      client.get("/roles?limit=50"),
      client.get("/glossaries?limit=50&fields=owners,tags"),
      client.get("/users?limit=50&isBot=false"),
      client.get("/teams?limit=50"),
    ]);

    res.json({
      policies: policies.data.data?.length ?? 0,
      roles: roles.data.data?.length ?? 0,
      glossaries: glossaries.data.data?.length ?? 0,
      users: users.data.data?.length ?? 0,
      teams: teams.data.data?.length ?? 0,
    });
  } catch (err: any) {
    console.error("Stats error:", err.message);
    if (err.response?.status === 401) return res.status(401).json({ error: "Token expired" });
    res.status(500).json({ error: err.message });
  }
});

// ─── FINDINGS ────────────────────────────────────────────────
app.get("/api/findings", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const client = getClient(token);

    const [policiesRes, glossariesRes] = await Promise.all([
      client.get("/policies?limit=50"),
      client.get("/glossaries?limit=50&fields=owners,tags"),
    ]);

    const policies = policiesRes.data.data;
    const glossaries = glossariesRes.data.data;
    const findings: any[] = [];

    for (const policy of policies) {
      for (const rule of policy.rules || []) {
        if (rule.effect === "DENY" && rule.condition?.includes("isOwner()")) {
          findings.push({
            severity: "HIGH",
            type: "DENY_POLICY_SCOPE_MISMATCH",
            asset: policy.name,
            assetType: "Policy",
            issue: "DENY rule with isOwner() may not propagate to child GlossaryTerms (Bug #25508).",
            recommendation: "Apply policy explicitly at GlossaryTerm level.",
          });
        }
      }
    }

    for (const glossary of glossaries) {
      const owners = glossary.owners || [];
      const onlyAdminOwns = owners.length > 0 && owners.every((o: any) => o.name === "admin");
      const hasTeamOwner = owners.some((o: any) => o.type === "team");

      if (owners.length === 0) {
        findings.push({ severity: "HIGH", type: "NO_OWNER", asset: glossary.name, assetType: "Glossary", issue: "Glossary has no owner.", recommendation: "Assign an owner or team." });
      } else if (onlyAdminOwns) {
        findings.push({ severity: "HIGH", type: "ADMIN_ONLY_OWNER", asset: glossary.name, assetType: "Glossary", issue: "Only admin owns this glossary — single point of failure.", recommendation: "Assign a specific team as owner." });
      } else if (!hasTeamOwner) {
        findings.push({ severity: "MEDIUM", type: "NO_TEAM_OWNER", asset: glossary.name, assetType: "Glossary", issue: "No team owner — only individual users.", recommendation: "Assign a team for better governance." });
      }
    }

    for (const policy of policies) {
      if (!policy.rules || policy.rules.length === 0) {
        findings.push({ severity: "LOW", type: "EMPTY_POLICY", asset: policy.name, assetType: "Policy", issue: "Policy has no rules defined.", recommendation: "Add rules or remove this policy." });
      }
    }

    res.json(findings);
  } catch (err: any) {
    console.error("Findings error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── CERTIFICATIONS ──────────────────────────────────────────
app.get("/api/certifications", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const client = getClient(token);

    const glossariesRes = await client.get("/glossaries?limit=50&fields=owners,tags");
    const glossaries = glossariesRes.data.data;

    const certifications = glossaries.map((g: any) => {
      const owners = g.owners || [];
      const desc = g.description || "";
      const certMatch = desc.match(/certifiedOn=([^&\s]+).*?validUntil=([^&\s]+)/);

      let certifiedOn = null, validUntil = null, daysRemaining = null, status = "UNCERTIFIED";

      if (certMatch) {
        certifiedOn = certMatch[1];
        validUntil = certMatch[2];
        const diff = new Date(validUntil).getTime() - new Date().getTime();
        daysRemaining = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) status = "EXPIRED";
        else if (daysRemaining <= 7) status = "EXPIRING_SOON";
        else status = "ACTIVE";
      }

      return {
        assetName: g.name, assetType: "Glossary", assetId: g.id,
        owners: owners.map((o: any) => o.name).join(", ") || "None",
        certifiedOn, validUntil, daysRemaining, status,
      };
    });

    res.json(certifications);
  } catch (err: any) {
    console.error("Certifications error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── CERTIFY ACTION ──────────────────────────────────────────
app.post("/api/certify/:assetId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { assetId } = req.params;
    const { assetType } = req.body;

    const client = getClient(token);

    const certifiedOn = new Date().toISOString();
    const validUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const entityPath = assetType === "Glossary" ? "glossaries" : "tables";

    const asset = await client.get(`/${entityPath}/${assetId}`);
    let currentDesc = asset.data.description || "";
    currentDesc = currentDesc.replace(/\n\n<!-- PolicyGuard:.*?-->/s, "");
    const certMeta = `\n\n<!-- PolicyGuard: certifiedOn=${certifiedOn} validUntil=${validUntil} -->`;

    await client.patch(
      `/${entityPath}/${assetId}`,
      [{ op: "add", path: "/description", value: currentDesc + certMeta }],
      { headers: { "Content-Type": "application/json-patch+json", ...CF_HEADERS }}
    );

    res.json({ success: true, certifiedOn, validUntil });
  } catch (err: any) {
    console.error("Certify error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GOVERNANCE SCORE ────────────────────────────────────────
app.get("/api/score", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const client = getClient(token);

    const [policiesRes, glossariesRes, teamsRes] = await Promise.all([
      client.get("/policies?limit=50"),
      client.get("/glossaries?limit=50&fields=owners,tags"),
      client.get("/teams?limit=50"),
    ]);

    const policies = policiesRes.data.data;
    const glossaries = glossariesRes.data.data;
    const teams = teamsRes.data.data;

    const policiesWithRules = policies.filter((p: any) => p.rules?.length > 0).length;
    const policyCoverage = policies.length > 0 ? Math.round((policiesWithRules / policies.length) * 25) : 0;

    const glossariesWithTeamOwner = glossaries.filter((g: any) => g.owners?.some((o: any) => o.type === "team")).length;
    const ownershipHealth = glossaries.length > 0 ? Math.round((glossariesWithTeamOwner / glossaries.length) * 25) : 0;

    const groupTeams = teams.filter((t: any) => t.teamType === "Group").length;
    const teamScore = Math.min(25, groupTeams * 5);

    const certifiedGlossaries = glossaries.filter((g: any) => g.description?.includes("PolicyGuard: certifiedOn")).length;
    const certScore = glossaries.length > 0 ? Math.round((certifiedGlossaries / glossaries.length) * 25) : 0;

    const total = policyCoverage + ownershipHealth + teamScore + certScore;

    res.json({
      total,
      breakdown: { policyCoverage, ownershipHealth, teamStructure: teamScore, certificationRate: certScore },
      risk: total >= 75 ? "LOW" : total >= 50 ? "MODERATE" : "HIGH",
    });
  } catch (err: any) {
    console.error("Score error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── CLASSIFICATION ──────────────────────────────────────────
app.get("/api/classifications", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const client = getClient(token);

    const tablesRes = await client.get("/tables?limit=50&fields=columns,owners,tags&include=all");
    const tables = tablesRes.data.data;

    const { classifyAsset, CLASSIFICATION_PATTERNS } = await import("./classificationEvaluator");

    const allFindings: any[] = [];
    for (const table of tables) {
      const columns = (table.columns || []).map((c: any) => ({
        name: c.name,
        description: c.description || ""
      }));
      const findings = classifyAsset(table.name, table.id, "Table", columns);
      allFindings.push(...findings);
    }

    const domains = [...new Set(allFindings.map((f: any) => f.domain))];
    const summary = domains.map(domain => ({
      domain,
      count: allFindings.filter((f: any) => f.domain === domain).length,
      high: allFindings.filter((f: any) => f.domain === domain && f.severity === "HIGH").length,
    }));

    res.json({
      findings: allFindings,
      summary,
      tablesScanned: tables.length,
      patternsUsed: CLASSIFICATION_PATTERNS.length,
    });
  } catch (err: any) {
    console.error("Classification error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POLICIES LIST ───────────────────────────────────────────
app.get("/api/policies", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    const client = getClient(token);
    const res2 = await client.get("/policies?limit=50");
    res.json(res2.data.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ROLES LIST ──────────────────────────────────────────────
app.get("/api/roles", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    const client = getClient(token);
    const res2 = await client.get("/roles?limit=50");
    res.json(res2.data.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GLOSSARIES LIST ─────────────────────────────────────────
app.get("/api/glossaries", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    const client = getClient(token);
    const res2 = await client.get("/glossaries?limit=50&fields=owners,tags");
    res.json(res2.data.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── HTTP SERVER ─────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🛡️  Sentari Backend running on http://localhost:${PORT}\n`);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;

// // ─── WEBSOCKET FOR TERMINAL ───────────────────────────────────
// const wss = new WebSocketServer({ server });

// wss.on("connection", (ws: WebSocket) => {
//   console.log("Terminal client connected");

//   ws.on("message", (message: string) => {
//     const { command } = JSON.parse(message.toString());
//     const cliPath = path.join(__dirname, "../../../");

//     const isDryRun = command.includes("dry");
//     const baseCommand = command
//       .replace(/-dry-\d+$/, "")
//       .replace(/-\d+$/, "");

//     const validCommands = ["audit", "certify", "delegate", "pre-delegate", "classify"];

//     if (!validCommands.includes(baseCommand)) {
//       ws.send(JSON.stringify({ type: "error", data: "Invalid command\n" }));
//       return;
//     }

//     const args = ["ts-node", "src/cli.ts", baseCommand];
//     if (isDryRun) args.push("--report-only");

//     const proc = spawn("npx", args, {
//       cwd: cliPath,
//       shell: true,
//     });

//     proc.stdout.on("data", (data: Buffer) => {
//       ws.send(JSON.stringify({ type: "stdout", data: data.toString() }));
//     });

//     proc.stderr.on("data", (data: Buffer) => {
//       ws.send(JSON.stringify({ type: "stderr", data: data.toString() }));
//     });

//     proc.on("close", (code: number) => {
//       ws.send(JSON.stringify({ type: "done", data: `\nProcess exited with code ${code}\n` }));
//     });
//   });
// });




// ─── WEBSOCKET FOR TERMINAL ───────────────────────────────────
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("Terminal client connected");

  ws.on("message", (message: string) => {
    const { command } = JSON.parse(message.toString());

    const cliPath = path.resolve(__dirname, "../../../");

    const isDryRun = command.includes("dry");
    const baseCommand = command
      .replace(/-dry-\d+$/, "")
      .replace(/-\d+$/, "");

    const validCommands = ["audit", "certify", "delegate", "pre-delegate", "classify"];

    if (!validCommands.includes(baseCommand)) {
      ws.send(JSON.stringify({ type: "error", data: "Invalid command\n" }));
      return;
    }

    const args = ["-r", "ts-node/register", "src/cli.ts", baseCommand];

    if (isDryRun) {
      args.push("--report-only");
    }

    const proc = spawn("node", args, {
      cwd: cliPath,
      shell: true,
      env: process.env,
    });

    proc.stdout.on("data", (data: Buffer) => {
      ws.send(JSON.stringify({ type: "stdout", data: data.toString() }));
    });

    proc.stderr.on("data", (data: Buffer) => {
      ws.send(JSON.stringify({ type: "stderr", data: data.toString() }));
    });

    proc.on("close", (code: number) => {
      ws.send(JSON.stringify({ type: "done", data: `\nProcess exited with code ${code}\n` }));
    });
  });
});