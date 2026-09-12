# JobOS Enterprise Production Deployment Checklist

Validated for **JobOS (v2.1)** — Local-First Autonomous AI Job-Search Command Center with complete feature parity to [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search).

---

## 1. Environment & Server Configuration
- [x] **Production Environment Variables**: Configured in `.env` / `.env.example` (`NODE_ENV=production`, `PORT=3000`, `VAULT_MASTER_KEY`, `GEMINI_API_KEY`, `JOBOS_DB_PATH`).
- [x] **Vault Master Key**: High-entropy 32-byte master key for AES-256-GCM encryption.
- [x] **Storage Directories**: `data/`, `data/resumes/`, and `data/backups/` initialized with private permissions.
- [x] **CORS & Headers**: Strict CORS, `X-Content-Type-Options: nosniff`, and parameterized body limit up to 15MB.

---

## 2. Database & Data Integrity (SQLite + WAL)
- [x] **SQLite Engine**: Native `node:sqlite` (DatabaseSync) operating in Write-Ahead Logging (`PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;`).
- [x] **Concurrency Safety**: `PRAGMA busy_timeout = 5000;` on all database connections to prevent lock contention.
- [x] **Relational Schema**: 20 tables in `server/db/schema.sql` covering agents, candidate vault, jobs, applications, templates, search profiles, portal health, email signals, interview packs, and evidence.
- [x] **Automated PRAGMA Integrity Checks**: Automated `PRAGMA integrity_check` and `PRAGMA foreign_key_check` with UI health badge.
- [x] **One-Click WAL Backup**: Automated WAL checkpointing (`PRAGMA wal_checkpoint(TRUNCATE)`) and backup generation.
- [x] **Encrypted Archive Export**: AES-256 encrypted export of profile and application history.

---

## 3. Job Discovery & Portal Health
- [x] **Extensible Portal Architecture**: Standardized `SourceAdapter` lifecycle (`Search` → `Extract` → `Normalize` → `Deduplicate` → `Validate` → `Store`).
- [x] **Supported Adapters**: Greenhouse ATS, Lever ATS, LinkedIn Jobs, Indeed Global, Wellfound, RemoteOK, Naukri Enterprise, Foundit, and Internshala.
- [x] **Failure Isolation**: Errors or rate-limits on individual job boards never crash or block remaining adapters.
- [x] **Scraping Resilience**: Exponential backoff with random jitter, 10s request timeouts, and cooldown timers.
- [x] **Portal Health Dashboard**: Real-time health status (`Healthy`, `Degraded`, `Rate-Limited`, `Offline`), error counters, and enable/disable toggles.

---

## 4. Multi-Profile Search Configuration
- [x] **Saved Search Profiles**: Manage multiple simultaneous search profiles (e.g. *"Senior Distributed Systems — India & Remote"*, *"Lead Full Stack & Cloud Architect"*).
- [x] **Per-Profile Configuration**: Dedicated keywords, target titles, location preferences, salary floors, and enabled portals.
- [x] **Instant Switcher**: Active profile switcher in UI toolbar with automatic background query alignment.

---

## 5. Fit Ranking & Deal-Breaker Detection
- [x] **6-Dimension Fit Engine**: Skills (30%), Experience (25%), Location (15%), Salary (10%), Seniority (10%), Industry (10%).
- [x] **Deal-Breaker Detection**: Prominent warning callouts (`⚠ DEAL BREAKERS`) without hiding postings.
- [x] **Priority Tiers**: Classification into 🔥 High Priority, 🟢 Good Match, 🟡 Possible Match, and 🔴 Low Match.

---

## 6. Drafter & Independent Reviewer Pipeline
- [x] **2-Tier Tailoring Pipeline**: Drafter agent prepares initial draft; Independent Reviewer audits against Truth Vault.
- [x] **Zero Fabrication Guarantee**: The reviewer blocks any unverified employers, dates, metrics, degrees, or skills.
- [x] **Diff Summary**: Visual change highlights showing exactly which sections were tailored.
- [x] **Deterministic ATS Verification**: Keyword match density, text extraction readability, contact details check, section header checks, and simulated PDF layout inspection.
- [x] **Cover Letter Generator**: Forward-looking, company-specific cover letters with in-place editor and download.

---

## 7. Application Automation Safety & Evidence Archive
- [x] **Mandatory Human Gate**: Cryptographic seal (`GATE-xxxx`) requiring explicit human click before transmission.
- [x] **Submission Preview Modal**: Full side-by-side inspection of all form fields, answers, tailored resume, and cover letter.
- [x] **Duplicate Prevention**: Multi-criteria check stopping duplicate applications to the same company/role within 90 days.
- [x] **4-Stage Document Versioning**: Full lineage tracking (`v1 Base` → `v2 Tailored` → `v3 Reviewed` → `v4 Submitted/Frozen`).
- [x] **Comprehensive Application Evidence**: Archive storing original JD, URL, base resume, tailored diff, cover letter, ATS report, reviewer report, submission token, status transitions, emails, and notes.

---

## 8. Communication, Interview Prep & Reporting
- [x] **Email & Recruiter Signal Triage**: Inbound recruiter email signal parsing with 1-click human approval.
- [x] **Follow-Up System**: Radar for quiet applications (8+ days) with automated follow-up drafts and thank-you notes.
- [x] **Interview Preparation Packs**: Technical Q&A, behavioral STAR stories, company dossiers, and questions for interviewers.
- [x] **Skill Gap & Upskilling Engine**: Heatmap comparing profile vs job requirements, personalized learning roadmap, and salary benchmarks.
- [x] **Offline HTML Dashboard Report**: Self-contained, zero-dependency HTML dashboard report with inline SVG charts and funnel metrics.

---

## 9. Verification & Automated Test Pass
- [x] **Build Verification**: `npm run build` exits 0 with zero syntax errors.
- [x] **Typecheck Verification**: `npm run typecheck` (`tsc --noEmit`) passes with zero compiler diagnostics.
- [x] **Automated Test Suite**: **55 / 55 tests pass** (100% passing across unit, e2e, security, and diagnostics suites).
- [x] **Live Server Smoke Test**: `GET /api/health` returns `status: healthy` with latency, uptime, and sub-checks.
- [x] **Endpoint Verification**: All 17 REST route namespaces verified and operational.

---

## 10. Real-Time System Diagnostics, Database Observability & Self-Test Engine
- [x] **Dedicated Diagnostics Center**: Accessible via `/diagnostics`, `#diagnostics`, Settings view card, and Topbar live health pill.
- [x] **Structured Health Matrix**: Real-time endpoints (`/api/health`, `/database`, `/ai`, `/portals`, `/storage`, `/backup`, `/full`).
- [x] **Zero AI Token Billing Guarantee**: All diagnostic checks and self-tests execute without consuming billable AI API tokens.
- [x] **Local SQLite Database Explorer**:
  - Live file resolution (`data/jobos.db`, `data/jobos.db-wal`, `data/jobos.db-shm`).
  - Read-only table schema inspection with column types and primary keys.
  - Interactive table row browser with strict cryptographic masking of sensitive secrets and tokens (`maskSecrets`).
  - Safe transactional write/rollback verification and PRAGMA checks (`integrity_check = ok`, `foreign_key_check = ok`).
- [x] **16-Subsystem Self-Test Runner**: `POST /api/diagnostics/self-test` safely evaluates Backend, Database, Integrity, Foreign Keys, Storage, Vault, Routes, AI Provider, Token Ledger, Resumes, Discovery, Applications Gate, Truth Vault, Fleet, Backup Recovery, and Portal Adapters.
- [x] **Sanitized Diagnostic Export**: `GET /api/diagnostics/export` exports comprehensive system snapshot with all credentials stripped.
- [x] **Bidirectional Cinematic Scroll Animations**: `launch.html` kinetic 3D scroll observer re-triggers on every scroll down and up.

