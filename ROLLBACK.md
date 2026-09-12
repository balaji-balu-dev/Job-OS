# JobOS Rollback Procedure & Safe Recovery Guide

### Available Rollback Snapshots:
1. **Pre-Audit Baseline:**  
   `backups/jobos-before-functionality-audit-2026-09-12-18-37/` (Timestamp: `2026-09-12 18:37 IST`)
2. **Pre-Production Packaging Baseline:**  
   `backups/jobos-before-production-packaging-2026-09-12-19-46/` (Timestamp: `2026-09-12 19:46 IST`)

---

## 1. Original Project State at Backup
- **Version:** `JobOS 2.0.0` (Production Local-First)
- **Node.js Environment:** Windows x64, Node v24.19.0
- **Database Engine:** SQLite in WAL Mode (`data/jobos.db`, `data/jobos.db-wal`, `data/jobos.db-shm`)
- **Automated Tests:** 55 passing unit and E2E suites (`server/tests/unit/`, `server/tests/e2e/`)
- **Frontend Architecture:** Vanilla ES Modules with Three.js r125 isometric command center, off-canvas navigation flyout drawer, and dynamic modal manager.
- **Backend Architecture:** Express.js REST API with 17 registered namespaces, SSE telemetry stream, cryptographic AES-256-GCM vault, and background crawler simulations.

---

## 2. Preserved Artifacts & Data Stores
The backup folder contains an exact byte-for-byte snapshot of:
1. `data/jobos.db` + WAL files (candidate profile, seeded jobs, 14 applications, 7 agent states, token ledgers, templates)
2. `data/resumes/` (all candidate PDF and text resumes)
3. `data/backups/` (prior encrypted database backups)
4. `js/` (application router, reactive store, mascot generator, 3D engine, all 16 views)
5. `css/` (tokens, layout, components, typography, animations, daylight & obsidian styles)
6. `server/` (controllers, adapters, crypto vault, repositories, unit & e2e test suites)
7. `index.html`, `launch.html`, `server.js`, `package.json`, `tsconfig.json`

---

## 3. Step-by-Step Restoration Instructions

### Option A: Complete Project Restoration (PowerShell)
To revert the entire codebase and database back to this exact baseline:

```powershell
# 1. Terminate any running server daemon
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Copy the preserved backup over the working directory (excluding node_modules)
Copy-Item -Path "backups\jobos-before-functionality-audit-2026-09-12-18-37\*" -Destination "." -Recurse -Force

# 3. Verify SQLite database integrity
node -e "import { DatabaseSync } from 'node:sqlite'; const db = new DatabaseSync('data/jobos.db'); console.log('Integrity:', db.prepare('PRAGMA integrity_check').get());"

# 4. Restart JobOS
node server.js
```

### Option B: Database-Only Restoration
If code changes are sound but the database requires rollback:
```powershell
Copy-Item -Path "backups\jobos-before-functionality-audit-2026-09-12-18-37\data\jobos.db*" -Destination "data\" -Force
```

---

## 4. Post-Rollback Verification Checklist
- Run `npm run typecheck` (must exit code 0)
- Run `npm run build` (must exit code 0)
- Run `npm test` (all 55 tests must pass)
- Verify `http://localhost:3000/api/health` returns `status: "healthy"`
