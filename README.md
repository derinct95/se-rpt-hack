# Clearview Medical Group — Provider Performance Agent

A healthcare revenue-cycle-management (RCM) analytics **agent** for a fictional practice, **Clearview Medical Group**, built on the **Claude Agent SDK** (the same SDK that powers Claude Code). **All data is 100% synthetic — no real patient or provider PHI is used anywhere in this application** (see the persistent disclaimer on the login screen, sidebar, and topbar).

Stack: React + TypeScript + Vite + Tailwind (dashboard UI), FastAPI + Python + SQLite (backend), **Claude Agent SDK** (the agent core — shared by the web app and a standalone CLI), Claude API (single-shot AI features: insights, reports, email/agenda drafting).

## Run it

**Backend** (FastAPI + SQLite, already has a `.venv` created and dependencies installed):

```
cd backend
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

Data persists in `backend/data/clearview.db` — seeded with 20 deterministic synthetic providers the first time the DB is empty, then persisted (including imports/edits/emails/appointments) across restarts. Delete the file to reseed fresh.

**Requirements for the AI/agent features:**
- `ANTHROPIC_API_KEY` set (copy `backend/.env.example` to `backend/.env`). Without it: insights/reports/email-drafts fall back to a deterministic rule-based generator automatically, and the chat agent reports itself unavailable — nothing breaks.
- **The Claude Code CLI available on PATH** (`npm install -g @anthropic-ai/claude-code`, then confirm with `claude --version`). This is required specifically for the chat agent and the standalone CLI (see below) — the Python `claude_agent_sdk` package communicates with that CLI binary under the hood. The rest of the app (dashboard, reports, insights, CSV/FHIR/HL7 import) does not need it.

**Frontend** (Vite + React + TypeScript + Tailwind, already has `node_modules` installed):

```
cd frontend
npm run dev
```

Open http://localhost:5173 — sign in with one of the two demo account cards (Practice Administrator / Clinical Analyst), or expand "Use a different account" for free-form mock login.

## The agent — two surfaces, one core

`backend/app/agent/` is the single agent definition (system prompt, 7 tools, security lockdown), shared by:

1. **The web chat widget** (floating button, bottom-right of the dashboard) — `POST /api/chat`.
2. **A standalone CLI agent** — the literal "Claude Code / CLI agent" artifact:
   ```
   cd backend
   .venv\Scripts\python agent_cli.py                                      # interactive REPL
   .venv\Scripts\python agent_cli.py "which providers are stuck at high risk?"   # one-shot
   ```

**Tools available to the agent:** `search_providers`, `get_provider_claims`, `compare_providers`, `summarize_department`, `search_policy_knowledge` (a small hand-rolled RAG — TF-IDF retrieval over a synthetic payer-policy corpus, no external embeddings dependency), `send_email` (logs to an in-app outbox — see below), `schedule_appointment` (books a meeting with one or a group of providers and auto-sends a confirmation email).

**Security note (found and fixed during development, worth knowing):** the Claude Agent SDK defaults to full Claude Code tool access (Bash/Read/Write/Edit/WebSearch/etc.) — `allowed_tools` alone does **not** restrict execution (confirmed empirically: a disallowed tool still executed in testing). The actual enforcement is a `PreToolUse` hook (`app/agent/security.py`) that denies anything outside the 7 tools above by name. This was verified by testing that PowerShell, Read, Write, WebSearch, and ToolSearch are all blocked, while the app's own tools execute normally. Without this hook, exposing the agent through a web endpoint would be a remote-code-execution risk.

## Security & responsible AI (for judges)

- **PHI safety**: every provider, claim, and metric is deterministically generated synthetic data (see `backend/app/data/seed.py`) — there is no real patient or provider information anywhere in this system, seeded or imported. The disclaimer is persistent (login screen, sidebar, topbar), not just a one-time notice.
- **Agent sandboxing**: the chat/CLI agent runs on the Claude Agent SDK, which defaults to full Claude Code tool access (file read/write, shell, web). We lock it down to exactly 7 whitelisted tools via a `PreToolUse` deny-by-default hook (`backend/app/agent/security.py`) — confirmed the only mechanism that actually enforces this (`allowed_tools` alone does not, verified empirically during development). This is the control that prevents the chat endpoint from being a remote-code-execution vector.
- **Injection surface**: all database access goes through the SQLAlchemy ORM (no raw/interpolated SQL); no `subprocess`/`eval`/`exec`/`pickle`/unsafe YAML anywhere in the backend. Reviewed and confirmed clean.
- **XSS**: no `dangerouslySetInnerHTML` or unsanitized HTML rendering anywhere in the frontend; AI-generated text (chat replies, insights) is rendered as plain text, never interpreted as markup.
- **Dependency audit**: `pip-audit` reports zero known vulnerabilities in the application's Python dependencies (only `pip` itself is out of date, which isn't invoked by the running app). `npm audit` flags one moderate/high pair in `esbuild`/`vite` — this is a **dev-server-only** issue (not present in the built static output) and only matters if the Vite dev server is exposed beyond localhost.
- **Upload handling**: import files are parsed entirely in memory (never written to disk, so no path traversal) and capped at 5MB to prevent memory-exhaustion from an oversized upload.
- **Known limitations, disclosed rather than hidden**: login is intentionally mock authentication (any email/password is accepted, matching the "demo account" login UX) — there is no real credential store or session validation, appropriate for a synthetic-data demo but not production-ready as-is. There's no rate limiting on the Claude-backed endpoints (chat, insights, reports) — acceptable for a hackathon demo's traffic volume, but would need addressing before any real deployment.

## What's in the demo

- **Login & onboarding**: demo-account cards, persistent synthetic-data-only disclaimer, first-visit guided tour, Ctrl+K command palette (providers, per-provider actions, and quick commands: compare / open AI assistant / generate practice review).
- **Main dashboard**: a gradient hero header, colorful gradient KPI tiles (total providers, average score, critical/high-risk count, top performer), an AI Proactive Insights panel that reasons over real provider data (Claude Opus 4.8, with an offline rule-based fallback — never just min/max), a searchable/sortable provider table with a Flagged-for-Review tab, and a **Stuck-at-Risk** badge for providers at high/critical risk for 2+ consecutive quarters.
- **Compare mode**: toggle the compare icon on up to 4 provider rows; a floating bar opens a side-by-side comparison view (scores, metrics table, radar overlay) as a shareable `/compare?ids=...` URL, with group email/scheduling actions.
- **Provider detail panel**: a resizable (drag the left edge) and maximizable slide-over panel (not a full page reload) with Overview / Metrics / Claims History / Actions tabs:
  - **Metrics**: a historical period picker (last quarter / last 4 / all / custom quarter range); clicking any metric card opens a **popup** with the current-vs-peer value and a trend chart across the selected period.
  - **Claims History**: aggregate volume/denial/revenue charts plus a real, paginated claims table — click any claim for a full detail **popup** (status timeline, denial reason, recurring-pattern flag, related actions).
  - **Actions**: recommendations flagged as recurring when the same issue has persisted 2+ quarters running; click any action for a **popup** showing the underlying metric trend that drove the recommendation.
  - **Email / Schedule / Download Report** buttons in the panel header — email the provider (AI-drafted, editable, sent/logged to an in-app outbox), book a meeting (AI-suggested agenda, auto-confirmation email), or download a PDF/CSV report for the currently-selected period, with graceful `—` placeholders for any missing data (never blank cells or literal "undefined").
- **AI chatbot**: see "The agent" section above.
- **AI Practice Review** (`/practice-review`): weekly/monthly/quarterly Claude-generated key findings + priority actions, downloadable as PDF/CSV.
- **Data import wizard**: upload a FHIR bundle, HL7v2 message, or CSV — auto-detects the format, previews what was parsed (with warnings for anything it couldn't extract), then commits on confirmation. Missing identity fields are backfilled with representative synthetic data so imported providers are as complete as seeded ones.
- **CSV export** of the full or flagged-only table.

Both servers are currently running in the background from the build session (backend on :8000, frontend on :5173) against a clean 20-provider dataset.

### Notes on scope

- **Email sending is simulated/logged, not real SMTP.** "Sending" an email writes it to the `email_messages` table (visible via `GET /api/communications/emails`) rather than relaying through a real mail server — by design, so the demo never risks emailing a real address and needs no external credentials.
- FHIR/HL7 parsing is a **pragmatic, best-effort subset** (Practitioner/PractitionerRole/Organization for FHIR; MSH+PRD/STF for HL7v2), not a certified health-IT interoperability implementation — HL7v2 in particular has no standard "provider directory" message type, so that mapping is an explicitly invented convention for this demo.
- Individual claim records are a representative sample (~30-50 per provider across 8 quarters) for browsing/detail purposes; the monthly claims-volume/revenue aggregates are independently generated statistics, not strictly derived 1:1 from the sampled claims.
- The chat/CLI agent calls are noticeably slower/costlier per turn (several seconds, a fraction of a dollar) than the plain single-shot Claude calls used for insights/reports/drafting — this is inherent to the Agent SDK spinning up a full Claude Code session per turn, an acceptable tradeoff for a hackathon demo's usage volume.
