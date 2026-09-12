# JobOS User Guide & Operational Manual
*Version 2.0 — Production Guide*

Welcome to **JobOS**, your local-first, autonomous AI job-search command center. JobOS operates as a private digital office staffed by 7 specialized AI agents working to find, deconstruct, and prepare high-match job applications under your strict supervision.

---

## Table of Contents
1. [Quick Start & Launching](#1-quick-start--launching)
2. [Tour of the Virtual Office Floorplan](#2-tour-of-the-virtual-office-floorplan)
3. [The 7 Autonomous Puppy Agents](#3-the-7-autonomous-puppy-agents)
4. [Setting Up Target Search Missions](#4-setting-up-target-search-missions)
5. [The Human Safety Gate Protocol](#5-the-human-safety-gate-protocol)
6. [Candidate Profile Vault & Truth Model](#6-candidate-profile-vault--truth-model)
7. [Recruiter Email & Interview Triage](#7-recruiter-email--interview-triage)
8. [Running Costs Breakdown](#8-running-costs-breakdown)
9. [Keyboard Shortcuts & Emergency Controls](#9-keyboard-shortcuts--emergency-controls)

---

## 1. Quick Start & Launching

JobOS runs locally on your machine with zero external cloud database dependencies.

### Launching the Server
```bash
# 1. Install dependencies (first time only)
npm install

# 2. Launch the JobOS Modular Server
npm start
```

### Accessing the Web Application
Open your browser and navigate to:
- **Command Center**: [http://localhost:3000](http://localhost:3000)
- **Virtual Office Floorplan**: [http://localhost:3000/#office](http://localhost:3000/#office)
- **Interactive Feature Presentation**: [http://localhost:3000/presentation.html](http://localhost:3000/presentation.html)

---

## 2. Tour of the Virtual Office Floorplan

The Virtual Office (`#office`) is an interactive 3D digital floorplan powered by Three.js rendering all 7 agent workstations.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               3D VIRTUAL OFFICE FLOORPLAN                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                 [Scout Puppy]                        [Job Intelligence]          │
│                (Beagle • Radar)                      (Border Collie • Vectors)   │
│                                                                                  │
│                                [Orchestrator]                                    │
│                           (Golden Retriever • Boss)                              │
│                                                                                  │
│           [Application Agent]                             [Verification Desk]    │
│         (German Shepherd • Gate)                          (Doberman • Audit)     │
│                                                                                  │
│                 [Email Agent]                        [Tracking Puppy]            │
│               (Cocker Spaniel)                       (Basset Hound • Radar)      │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Key UI Features:
1. **Interactive Camera Parallax**: Gently tracks mouse movement across the executive floor.
2. **Camera Perspective Buttons**:
   - **Isometric**: Standard 3D isometric command view.
   - **Top Floor**: Top-down operational perspective.
   - **Orchestrator Focus**: Close-up camera angle centered on the Orchestrator command podium.
3. **Desk Triage Filters**:
   - `All Desks (7)`: Displays all 7 pods.
   - `Active Work (4)`: Filters to agents currently executing background operations.
   - `Paused at Gate (2)`: Immediately highlights desks blocked at the Human Safety Gate.
   - `Idle / Vigilant (1)`: Displays resting or monitoring agents.
4. **Deep Telemetry Inspector Panel**:
   - Clicking any desk card populates the inspector with live ReAct reasoning (`Thought`, `Action`, `Observation`), cluster throughput metrics, and real-time safe activity logs via Server-Sent Events (SSE).

---

## 3. The 7 Autonomous Puppy Agents

| Agent Persona | Breed & Accessories | Core Responsibility |
| :--- | :--- | :--- |
| **1. Orchestrator ("Chief")** | Golden Retriever • Executive Glasses | Fleet Commander. Schedules tasks, balances crawler concurrency, routes payloads, and enforces emergency stops. |
| **2. Scout ("Tracker")** | Beagle • Dual-Antenna Headset | Continuous web crawler harvesting Greenhouse, Lever, Ashby, and Naukri feeds. Deduplicates listings using SHA-256 hashing. |
| **3. Job Intelligence ("Sage")** | Border Collie • Analyst Spectacles | Analyzes Job Descriptions, extracts technical skills (e.g. Raft, Paxos, Kafka), and scores semantic match against candidate profile. |
| **4. Application Agent ("Quill")** | German Shepherd • Drafting Blueprint | Form artisan. Generates tailored answers using *only* facts present in your Candidate Vault with source citations. |
| **5. Verification Desk ("Sentry")** | Doberman • Cryptographic Wax Seal | Truth Auditor. 0% hallucination tolerance. Audits every single bullet point and generates the SHA-256 seal (e.g. `0x9B44F`). |
| **6. Email Agent ("Courier")** | Cocker Spaniel • Letter Satchel | Correspondence Bureau. Categorizes inbound recruiter emails, drafts polite replies, and stages them for human approval. |
| **7. Tracking Puppy ("Radar")** | Basset Hound • Observability Radar | Watchdog monitoring active submissions across 11 stages and parsing interview calendar invites. |

---

## 4. Setting Up Target Search Missions

Missions are reusable, structured search campaigns that direct Scout on where and what to discover.

### Managing Missions (`#missions`)
1. **Pre-configured Missions**:
   - **Senior Backend India**: Targets Senior/Staff Backend Engineer roles in Bangalore, Hyderabad, or Remote India requiring Java, Go, Spring Boot, Kafka, and AWS.
   - **Global Platform & Cloud Remote**: Targets Worldwide Remote Platform & SRE roles.
2. **Instant Rescan**:
   - In the Virtual Office Inspector or Jobs tab, click **Force Instant Rescan** to trigger Scout immediately.
   - Any job matching 80%+ is automatically shortlisted and queued for review.

---

## 5. The Human Safety Gate Protocol

JobOS enforces an unbreakable rule: **No application, document, or email is ever transmitted without your explicit physical sign-off.**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             HUMAN GATE UNLOCK WORKFLOW                           │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   1. Verification Desk audits all questions → 100% Truth Provenance verified.    │
│   2. Payload sealed with SHA-256 hash (e.g. 0x9B44F).                            │
│   3. Status halted at GATE_HALTED. Token generated: [GATE-8821].                 │
│   4. User clicks "Review Artifacts & Unlock Gate".                               │
│   5. Backend validates token and checksum, releasing payload to Browser Worker. │
│   6. Application submitted with official HTTP 201 receipt logged to SQLite.     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Reviewing Application Answers (`#app-review` & `#submission-gate`)
- Every question displays an audit badge:
  - `USER VERIFIED` (Green): Exact match from your verified profile.
  - `DERIVED` (Cyan): Synthesized from existing facts with explicit citations (e.g. *Incident Post-Mortem 2024*).
  - `NEEDS REVIEW` (Amber): Ambiguous or missing skills (e.g. Ruby on Rails when profile lists Java/Go).
- You can click **Edit** on any generated answer to modify it before approving.

---

## 6. Candidate Profile Vault & Truth Model

The Candidate Vault (`#profile`) organizes your qualifications into 16 structured sections:
1. **Identity** (Full name, pronouns, citizenship)
2. **Contact Info** (Email, phone, LinkedIn, GitHub)
3. **Location & Remote Preferences**
4. **Work Authorization & Visas**
5. **Employment History** (Highlights, titles, dates)
6. **Education & Degrees**
7. **Technical Skills** (Languages, frameworks, databases, cloud tools)
8. **Featured Projects** (Architecture, tech stack, quantifiable impact)
9. **Salary Expectations** (Current CTC, target band, minimum acceptable)
10. **Notice Period** (Official notice, negotiable buyout days)
11. **Approved Answer Vault** (Reusable vetted system design stories)

> [!IMPORTANT]
> **Zero Guessing Policy**: If an ATS asks a question about an unlisted skill (e.g., *"Do you have 5 years C# experience?"*), the agent outputs `UNKNOWN` and refuses to invent claims. The verification desk halts the gate until you provide the facts.

---

## 7. Recruiter Email & Interview Triage

When an inbound recruiter message or interview invitation arrives:
1. **Tracking Agent** detects the interview invite and moves the pipeline to the **Interview** stage (`#interviews`).
2. **Email Agent** drafts a warm, technically calibrated confirmation email confirming your availability.
3. The draft is staged in the **Needs Your Attention** dock on the Dashboard.
4. You can edit the message, change the meeting slot, and click **Approve & Send**.

---

## 8. Running Costs Breakdown

Because JobOS is built as an on-demand, local-first system with native SQLite, **running costs are effectively $0.00 / month** for typical job-hunting workloads.

| Component | Cost Model | Monthly Expense |
| :--- | :--- | :--- |
| **Compute & Host** | Localhost (Your existing computer) | **$0.00** |
| **Database** | SQLite + WAL (Stored locally in `data/jobos.db`) | **$0.00** |
| **AI API (Gemini 2.5 Flash)** | Google AI Studio Free Tier (15 RPM / 1,500 requests per day) | **$0.00** |
| **AI API (Paid Tier Fallback)** | Gemini 2.5 Flash ($0.075 / 1M input tokens, $0.30 / 1M output tokens) | **~$0.45 – $1.20 / mo** |
| **Job Discovery Ingest** | Public ATS endpoints (Greenhouse, Lever, Ashby) + Naukri extension | **$0.00** |
| **Total Estimated Cost** | **Zero subscription lock-in** | **$0.00 – $1.20 / month** |

*Compare this to commercial AI job tools like Simplify Copilot ($29/mo), Teal+ ($39/mo), or LazyApply ($79/mo).*

---

## 9. Keyboard Shortcuts & Emergency Controls

| Action | Shortcut / Control | Result |
| :--- | :--- | :--- |
| **Toggle Theme** | `Shift + D` | Toggles between Daylight Studio and Obsidian Night Mode. |
| **Close Modals / Drawers** | `Escape` | Dismisses inspector drawer or dialog without saving. |
| **Emergency Pause** | Top Bar "Pause All Agents" | Instantly halts all background scraping and autonomous loops. |
| **View Floorplan** | Click "Virtual Office" in sidebar | Returns to 3D Three.js interactive agent pods. |
| **View Feature Deck** | Open `/presentation.html` | Launches interactive 6-slide executive presentation. |
