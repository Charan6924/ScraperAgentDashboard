# Integration Index

A static, evidence-led case study of API access, authentication, MCP availability, and agent-toolkit buildability across 100 requested applications. The site is the presentation layer for the separate [ScraperAgent research pipeline](https://github.com/Charan6924/ScraperAgent).

The committed snapshot currently discloses 98 completed two-pass reviews and 2 failed records. Failed records remain visible but do not contribute to completed-app denominators.

## Pages

- `/` — two-minute executive overview.
- `/trends` — overall and category-level patterns.
- `/apps` — searchable 100-app explorer with evidence details.
- `/verification` — claim outcomes, citations, corrections, and failures.
- `/methodology` — agent architecture, limitations, and reproduction steps.

There are no API routes, databases, accounts, or runtime data fetches. Next.js validates the committed report with Zod at build time and emits a static `out/` directory.

## Architecture

```text
ScraperAgent
  apps.json + corrected records + second-pass reviews + batch manifest
                              │
                              ▼
                     report_exporter.py
                              │
                              ▼
ScraperAgentDashboard/src/data/report.json
                              │
                    Zod validation + selectors
                              │
                              ▼
          five static Next.js report pages + client-only filters
```

The website uses normalized presentation fields. Displayed MCP results come from `derived.strict_mcp_status`, which only counts a server when it has a GitHub repository, usable documentation, and direct MCP evidence.

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run test:run
npm run lint
npm run typecheck
npm run test:e2e
npm run build
```

`test:e2e` builds the static export and serves `out/` locally. Its Playwright suite checks all five routes, desktop and mobile navigation, filters, deep links, evidence drawer keyboard behavior, failed requests, and Axe accessibility results. Install its browser once if needed:

```bash
npx playwright install chromium
```

## Refresh the report snapshot

During development, run this from the sibling `ScraperAgent` repository:

```bash
.venv/bin/python report_exporter.py \
  --output ../ScraperAgentDashboard/src/data/report.json \
  --allow-incomplete
```

Then validate the imported snapshot:

```bash
cd ../ScraperAgentDashboard
npm run test:run
npm run lint
npm run typecheck
npm run build
```

Remove `--allow-incomplete` only when the research manifest is final-ready. Without that flag, the exporter intentionally rejects unresolved incomplete records rather than silently dropping them.

## Deploy to Vercel

1. Push this directory as its own Git repository.
2. Import that repository into Vercel as a Next.js project.
3. Use `npm install` and `npm run build`; no environment variables are required.
4. Deploy. `next.config.ts` uses `output: "export"`, so the build is portable static content.

Vercel automatically supplies `VERCEL_PROJECT_PRODUCTION_URL`, which populates the Methodology page's live-deployment link. Set `NEXT_PUBLIC_SITE_URL` only when you want to override that canonical URL.

The dashboard repository is self-contained. Vercel does not need filesystem access to the Python research repository.

## Data interpretation

- Authentication and interface totals are multi-select app counts and may exceed the completed-app denominator.
- Evidence support is an automated verifier judgment, not ground-truth accuracy.
- Corrected records remain drafts until a human resolves unavailable sources, ambiguous claims, rejected corrections, and other queued items.
- Vendor documentation and access policies change; use evidence retrieval timestamps and refresh the research before a current production decision.
