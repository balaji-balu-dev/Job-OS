# JobOS — Production Data Policy & Seed Classification

> **Document:** `PRODUCTION_DATA_POLICY.md`  
> **Status:** ACTIVE & ENFORCED  
> **Classification Standard:** Strict separation of SYSTEM-REQUIRED records vs DEMO/TEST fixtures.

---

## 1. Data Classification Matrix

| Data Entity | Category | Initialized in Clean Production? | Policy & Behavior |
|---|---|---|---|
| **Autonomous Agents (7)** | **SYSTEM REQUIRED** | **YES (Clean State)** | 7 specialized agent entities (`orchestrator`, `scout`, `job-intelligence`, `application-agent`, `verification-agent`, `email-agent`, `tracking-agent`). Seeded with clean zero-token, zero-queue, ready state. |
| **Job Portal Adapters (9)** | **SYSTEM REQUIRED** | **YES** | Default adapter configurations in `portal_health` (Greenhouse, Lever, Ashby, Naukri, LinkedIn, Indeed, etc.) enabling crawlers to operate. |
| **Standard Document Templates** | **SYSTEM REQUIRED** | **YES (Standard Only)** | Standard Markdown Resume & Cover Letter variable templates in `templates` table (`tmpl-resume-std`, `tmpl-cl-forward`). |
| **AI Safeguards & Budget** | **SYSTEM REQUIRED** | **YES (Default Caps)** | Initial configuration in `safeguard_config` and `ai_usage_config` with default daily submission limits and cost protection thresholds. |
| **System Metadata** | **SYSTEM REQUIRED** | **YES** | Internal schema version (`2.0.0`), environment (`production`), and initialization timestamp in `system_metadata`. |
| **Candidate Profile Vault** | **USER DATA ONLY** | **NO (Empty)** | Clean production starts with 0 profile records. Must be provided or imported by the user. |
| **Role-Tailored Resumes** | **USER DATA ONLY** | **NO (Empty)** | Clean production starts with 0 uploaded files. No sample candidate PDF or text resumes. |
| **Job Listings** | **USER DATA ONLY** | **NO (Empty)** | Clean production starts with 0 jobs. Jobs are only added through user search, portal discovery, or manual creation. |
| **Applications Pipeline** | **USER DATA ONLY** | **NO (Empty)** | Clean production starts with 0 applications. |
| **Autonomous Missions** | **USER DATA ONLY** | **NO (Empty)** | Clean production starts with 0 user missions. |
| **Interview Preparation** | **USER DATA ONLY** | **NO (Empty)** | Clean production starts with 0 interviews. |
| **Email Signals** | **USER DATA ONLY** | **NO (Empty)** | Clean production starts with 0 signals. |
| **AI User Credentials** | **USER DATA ONLY** | **NO (Empty)** | Clean production starts with 0 stored keys. User must supply their own key in Settings if desired. |

---

## 2. Test Environment Exception

To maintain regression testing integrity, test suites executing under `NODE_ENV=test` or with `JOBOS_SEED_DEMO=true` automatically load test fixtures (e.g. `job-razorpay`, sample candidate profile, demo resumes) into isolated test databases. These test fixtures are strictly prevented from populating a clean production database.

---

## 3. Production Initialization Invariant

1. **Existing Database Protection:**
   If `data/jobos.db` exists, JobOS will **NEVER** overwrite, wipe, reseed, or reset the database during normal startup. Existing data is permanently preserved.
2. **First-Run Behavior:**
   If `data/jobos.db` does not exist when `Start-JobOS.cmd` is executed, JobOS automatically creates a clean production database containing only the **SYSTEM REQUIRED** records above.
3. **Explicit Reset Protection:**
   Destructive reinitialization is only permitted through the standalone `Initialize-JobOS-Production.cmd` utility, which:
   - Halts if an existing database is detected.
   - Requires explicit user confirmation.
   - Creates a timestamped safety backup in `data/backups/` before any action.
