# 🛡️ Sentari
> Governance Intelligence Platform for OpenMetadata

Sentari brings IAM governance concepts (SOD policies, access certifications, ownership delegation) to data asset management in OpenMetadata.

> [!IMPORTANT]
> **Sentari requires 3 services running on your machine to work:**
> - **OpenMetadata** — the metadata platform (runs via Docker)
> - **Cloudflare Tunnel** — exposes OpenMetadata publicly so Sentari can connect
> - **ngrok** — exposes the Sentari backend publicly so the frontend can connect
>
> Without all three running, the app will not function.

## 🎯 Problem

OpenMetadata's governance policies silently fail in real-world scenarios:
- DENY rules with `isOwner()` don't propagate to child GlossaryTerms ([Bug #25508](https://github.com/open-metadata/OpenMetadata/issues/25508))
- Assets owned only by `admin` — single point of failure
- No tooling to detect, delegate, or certify data asset ownership

## 🚀 Commands

```bash
# Scan for governance misconfigurations
npm run audit

# Preview auto-delegation (dry run)
npm run delegate -- --dry-run

# Auto-assign owners based on rules
npm run delegate

# Run access certification report
npm run certify
```

## 🔄 Full Governance Lifecycle

```
npm run audit       →  Detect misconfigurations
npm run delegate    →  Auto-assign owners by rules
npm run audit       →  Verify fixes
npm run certify     →  Certify ownership is valid
```

## ⚙️ Installation

### Prerequisites

Before running Sentari, you need all three of these services set up:

| Service | Purpose | Link |
|---|---|---|
| **Node.js v18+** | Run the backend | [nodejs.org](https://nodejs.org/) |
| **Docker & Docker Compose** | Run OpenMetadata locally | [docs.docker.com](https://docs.docker.com/get-docker/) |
| **OpenMetadata** | Metadata platform Sentari connects to | Runs via Docker below |
| **Cloudflare Tunnel** | Expose OpenMetadata to Sentari frontend | [cloudflare.com](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) |
| **ngrok** | Expose Sentari backend to Vercel frontend | [ngrok.com](https://ngrok.com/download) |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/vedant45/sentari
cd sentari
npm install
```

---

### Step 2 — Start OpenMetadata via Docker

```bash
docker compose up -d
```

Wait for it to be healthy at `http://localhost:8585`.  
Default credentials: `admin / admin`

---

### Step 3 — Start Cloudflare Tunnel

Sentari needs OpenMetadata to be publicly accessible. Run:

```bash
cloudflared tunnel --url http://localhost:8585
```

You will get a URL like:
```
https://your-tunnel.trycloudflare.com
```

Keep this terminal open. You will need this URL in the next step.

---

### Step 4 — Configure Environment Variables

Use the `.env` file provided in the repo and fill in your Cloudflare URL:

```env
OPENMETADATA_URL=https://your-tunnel.trycloudflare.com
```

> ⚠️ Every time you restart Cloudflare Tunnel, you get a new URL. Update your `.env` each time.

---

### Step 5 — Run the Backend

```bash
npm run backend
```

In a new terminal, expose it via ngrok:

```bash
ngrok http 8080
```

You will get a URL like:
```
https://your-ngrok-url.ngrok-free.app
```

Update your `vercel.json` with this URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-ngrok-url.ngrok-free.app/api/:path*"
    },
    {
      "source": "/ws",
      "destination": "https://your-ngrok-url.ngrok-free.app/ws"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "ngrok-skip-browser-warning",
          "value": "true"
        }
      ]
    }
  ]
}
```

> ⚠️ Every time you restart ngrok, you get a new URL. Update `vercel.json` each time.

---

### Step 6 — Open Sentari

Login at [https://sentari.vercel.app](https://sentari.vercel.app)

---

### 🔁 Every Time You Start Sentari

Run these in order:

```bash
# 1. Start OpenMetadata
docker compose up -d

# 2. Start Cloudflare Tunnel (new terminal)
cloudflared tunnel --url http://localhost:8585

# 3. Start backend (new terminal)
npm run backend

# 4. Start ngrok (new terminal)
ngrok http 8080
```

Then update `.env` with the new Cloudflare URL and `vercel.json` with the new ngrok URL.

---

## 🏗️ Architecture

```
src/
├── cli.ts                          # CLI entry point (audit, delegate, certify)
├── api/
│   └── openmetadata.ts             # OpenMetadata REST API client
└── evaluator/
    ├── policyEvaluator.ts          # Governance policy checks
    ├── certificationEvaluator.ts   # Access certification logic
    └── delegationEvaluator.ts      # Ownership delegation rules
```

## 🔍 What It Detects

| Check | Severity | Description |
|---|---|---|
| `DENY_POLICY_SCOPE_MISMATCH` | 🔴 HIGH | isOwner() DENY rules that don't apply to child resources |
| `ADMIN_ONLY_OWNER` | 🔴 HIGH | Assets owned only by admin — governance risk |
| `NO_OWNER` | 🔴 HIGH | Assets with no owner — policies will never match |
| `NO_TEAM_OWNER` | 🟡 MEDIUM | Assets owned by individuals, not teams |
| `EMPTY_POLICY` | 🟢 LOW | Policies with no rules defined |

## 💡 Inspiration

Built on enterprise IAM patterns from SailPoint IIQ:
- **SOD Policies** → policy conflict detection
- **Access Certifications** → periodic ownership review
- **Role Mining** → delegation rule engine

## 🏆 Built For

[OpenMetadata Hackathon](https://wemakedevs.org) — Governance & Classification Track
