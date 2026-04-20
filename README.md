# 🛡️ AccessRakshak

> Enterprise-grade governance auditor for OpenMetadata 

PolicyGuard brings IAM governance concepts (SOD policies, access certifications, ownership delegation) to data asset management in OpenMetadata.

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

## 📊 Demo

```
🔍 PolicyGuard - OpenMetadata Governance Auditor

🔴 [HIGH] Glossary: FinanceGlossary
   ❗ Issue: Glossary is only owned by admin. Single point of failure.
   ✅ Fix:   Assign a specific team as owner instead of admin.

Policies scanned:       15
Roles scanned:          15
Glossaries scanned:     2
Users scanned:          1
Teams scanned:          2
```

## 🔄 Full Governance Lifecycle

```
npm run audit       →  Detect misconfigurations
npm run delegate    →  Auto-assign owners by rules
npm run audit       →  Verify fixes
npm run certify     →  Certify ownership is valid
```

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- OpenMetadata instance (local or cloud)

### Installation

```bash
git clone https://github.com/vedant45/policy-guard
cd policy-guard
npm install
```

### Configuration

Create a `.env` file:
```env
OPENMETADATA_URL=http://localhost:8585
OPENMETADATA_USER=admin@open-metadata.org
OPENMETADATA_PASSWORD=admin
```

### Run

```bash
npm run audit
```

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
