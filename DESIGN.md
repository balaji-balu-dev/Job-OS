# JobOS Design System Specification (DESIGN.md)
*Version 1.0.0 — Production Specification*

---

## 1. System Overview & Aesthetic Philosophy

**JobOS** is an autonomous personal AI job-search workstation. It fuses a high-density productivity command center with the charm of a 2.5D virtual office staffed by 7 specialized AI agent puppy mascots.

### Core Tenets
1. **Calm Authority**: Deep, warm slate canvas with generous contrast and hairline borders. No jarring neon or noisy holographic gimmicks.
2. **Transparent Autonomy**: The user must effortlessly discern at all times:
   - *What* the agents are doing.
   - *Why* they made an inference.
   - *What* requires user approval.
   - *What* happened previously and *what* happens next.
3. **Rigorous Auditability**: Every single piece of candidate data and application answer is explicitly labeled with verification provenance:
   - `USER VERIFIED` (Absolute truth provided by the candidate)
   - `DERIVED` (Synthesized from existing facts with source citations)
   - `NEEDS REVIEW` (Ambiguous, high-risk, or missing information)
   - `UNKNOWN` (Unpopulated)
4. **Sophisticated Mascot Language**: Puppies are treated as bespoke, stylish digital companions—rendered in clean, geometric vector styling with personality-specific accessories (monocles, vests, bows, satchels) and subtle CSS micro-movements, never chaotic cartoons.

---

## 2. Color Tokens & Semantic Palette

### 2.1 Base Canvas & Neutral Surfaces
| Token | Hex | Role |
| :--- | :--- | :--- |
| `--bg-canvas` | `#0B0E14` | Primary viewport background |
| `--bg-surface-1` | `#121620` | Cards, sidebars, header command bar |
| `--bg-surface-2` | `#1A202C` | Modals, drawers, elevated containers |
| `--bg-surface-3` | `#232B3B` | Hover states, active list selections |
| `--border-subtle` | `rgba(255, 255, 255, 0.07)` | Hairline dividers and card borders |
| `--border-strong` | `rgba(255, 255, 255, 0.15)` | Active borders, input boundaries |
| `--text-primary` | `#F8FAFC` | High-contrast headings and primary labels |
| `--text-secondary` | `#94A3B8` | Subtext, timestamps, secondary labels |
| `--text-muted` | `#64748B` | Placeholders, inactive icons, hints |

### 2.2 Brand & Functional Accents
| Token | Hex | Role |
| :--- | :--- | :--- |
| `--brand-amber` | `#F59E0B` | Match highlight, top ratings, attention calls |
| `--brand-amber-dim` | `rgba(245, 158, 11, 0.12)` | Amber badges & card highlights |
| `--brand-indigo` | `#6366F1` | Primary action buttons, Orchestrator aura |
| `--brand-emerald` | `#10B981` | Verification approval, success states |
| `--brand-rose` | `#F43F5E` | Rejections, critical gate warnings, errors |
| `--brand-sky` | `#0EA5E9` | Information disclosures, Scout highlights |

### 2.3 Agent Identity Colors
| Agent | Token | Accent Hex | Role / Personality |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | `--agent-orch` | `#6366F1` (Indigo) | Office Boss, workflow coordination |
| **Scout** | `--agent-scout` | `#06B6D4` (Cyan) | Web & ATS job discovery |
| **Job Intelligence** | `--agent-intel` | `#F59E0B` (Amber) | JD analysis, match scoring, risk detection |
| **Application Agent** | `--agent-app` | `#10B981` (Emerald) | Profile-backed form preparation |
| **Tracking Agent** | `--agent-track` | `#3B82F6` (Blue) | Pipeline, emails, interview detection |
| **Email Agent** | `--agent-email` | `#F97316` (Orange) | Tailored outreach & follow-up drafting |
| **Verification Agent**| `--agent-verify`| `#EC4899` (Pink/Ruby)| Pre-submission gate audit & compliance |

### 2.4 Audit & Provenance Badges
- **`VERIFIED`**: Background `rgba(16, 185, 129, 0.15)`, Border `#10B981`, Text `#34D399`.
- **`DERIVED`**: Background `rgba(14, 165, 233, 0.15)`, Border `#0EA5E9`, Text `#38BDF8`.
- **`NEEDS REVIEW`**: Background `rgba(245, 158, 11, 0.15)`, Border `#F59E0B`, Text `#FBBF24`.
- **`UNKNOWN`**: Background `rgba(148, 163, 184, 0.15)`, Border `#64748B`, Text `#94A3B8`.

---

## 3. Typography & Numerical Formatting

- **Primary Font**: `Plus Jakarta Sans`, system-ui, sans-serif
- **Data / Telemetry Font**: `JetBrains Mono`, monospace

### Typography Scale
| Level | Font Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `Display` | 28px (1.75rem) | 1.2 | 700 | Main Dashboard hero headers |
| `Heading 1` | 22px (1.375rem) | 1.3 | 700 | Primary view titles, modal titles |
| `Heading 2` | 18px (1.125rem) | 1.4 | 600 | Section headers, drawer titles |
| `Heading 3` | 15px (0.9375rem)| 1.4 | 600 | Card titles, step headings |
| `Body Base` | 13.5px (0.84rem) | 1.5 | 400/500 | Main reading text, form fields |
| `Body Small` | 12px (0.75rem) | 1.4 | 400 | Meta data, timestamps, badges |
| `Micro / Code`| 11px (0.6875rem)| 1.3 | 500 | Raw tokens, hash keys, citations |

---

## 4. Spacing, Radii & Depth

### 4.1 Spacing Units (8pt Grid)
- `4px` (`0.25rem`) — Micro gap, badge padding
- `8px` (`0.5rem`) — Tight component spacing, icon gaps
- `12px` (`0.75rem`) — Button padding, input padding
- `16px` (`1rem`) — Card internal padding, grid gap
- `24px` (`1.5rem`) — Section margins, drawer padding
- `32px` (`2rem`) — Major section layout spacing

### 4.2 Radii
- `--radius-sm`: `6px` (Pills, badges, micro buttons)
- `--radius-md`: `10px` (Inputs, standard buttons, tabs)
- `--radius-lg`: `14px` (Cards, drawers, desk panels)
- `--radius-xl`: `20px` (Modals, virtual office stage)

### 4.3 Depth & Elevation Shadows
- `--shadow-sm`: `0 1px 2px rgba(0, 0, 0, 0.25)`
- `--shadow-md`: `0 4px 12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.05)`
- `--shadow-lg`: `0 12px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08)`
- `--shadow-glow-amber`: `0 0 24px rgba(245, 158, 11, 0.25)`
- `--shadow-glow-indigo`: `0 0 24px rgba(99, 102, 241, 0.25)`

---

## 5. Virtual Office & Puppy Mascot Specifications

### 5.1 The 7 Desks Layout
Arranged in an executive command circle surrounding a central coordination carpet:
1. **Center**: Orchestrator Executive Desk
2. **Top Left**: Scout Discovery Radar Desk
3. **Top Right**: Job Intelligence Analytics Desk
4. **Mid Left**: Application Drafting Station
5. **Mid Right**: Verification Audit Gate
6. **Bottom Left**: Tracking & Pipeline Station
7. **Bottom Right**: Email & Communications Desk

### 5.2 Puppy Breeds & Character Signatures
- **Orchestrator ("Chief")**: Golden Retriever. Wears a midnight navy waistcoat and golden clip-on collar badge.
- **Scout ("Tracker")**: Beagle. Wears wire-rimmed round spectacles and a brass compass pendant.
- **Intelligence ("Sage")**: Corgi. Features an amber silk bowtie and desk microscope.
- **Application ("Quill")**: Cream Shiba Inu. Wears an ink-dipped fountain pen holster.
- **Tracking ("Radar")**: Slate Husky. Equipped with a mini satellite radar antenna tag.
- **Email ("Courier")**: Red Dachshund. Wears a cross-body leather mail messenger pouch.
- **Verification ("Sentry")**: Obsidian French Bulldog. Wears an emerald wax-seal medallion.

### 5.3 Agent States & Micro-Animations
- **`Idle`**: Subtle torso breathing scale (1.0 to 1.02, 3s loop), occasional slow ear tilt.
- **`Working` / `Searching`**: Rapid alternating paw tap animation on keyboard, moving radar sweep.
- **`Thinking`**: Thoughtful head-angle tilt with soft floating pulsing dots.
- **`Waiting`**: Tail wagging gently back and forth (15deg swing).
- **`Success`**: Ears perk up, tail wags rapidly, golden star burst effect.
- **`Error`**: Head scratching posture, gentle warm-amber alert outline pulse.
- **`User Attention Required`**: Mascot trots forward to desk edge, carrying an attention envelope icon with glowing amber border pulse.

---

## 6. Core Component Specifications

### 6.1 "Needs Your Attention" Priority Card
- **Border**: Highlighted with 1.5px solid amber gradient.
- **Header**: Agent mascot badge, Urgency rating (`HIGH`, `MEDIUM`), Time elapsed.
- **Body**: Concise reason for block, direct summary of question or submission decision.
- **Actions**: High-visibility primary action button (e.g. `Review & Approve`, `Review Answers`) and secondary `Defer / Snooze`.

### 6.2 Application Review Question Row
- Displays numbered question prompt from ATS.
- Generated answer with editable markdown toggle.
- Verification status pill (`VERIFIED` with candidate profile citation, `DERIVED` with derivation logic, or `NEEDS REVIEW`).
- Confidence telemetry pill (e.g., `98% Confidence`).
- Quick actions: `Edit`, `Ask Agent to Re-evaluate`, `Approve Answer`.

### 6.3 Final Submission Gate
- Multi-step pre-flight checklist:
  - [x] Tailored Resume Verified (Candidate v3.2)
  - [x] Cover Letter Checked for Hallucinations
  - [x] Required ATS Fields Populated (14/14)
  - [x] Verification Agent Seal Granted
  - [x] No Disqualifying Conflicts Detected
- Explicit two-step submission gate: Sliding unlock button or deliberate double-action `CONFIRM & TRANSMIT` to eliminate accidental submissions.

### 6.4 11-Stage Application Pipeline (Kanban / Timeline)
1. `Discovered`
2. `Shortlisted`
3. `Approved`
4. `Preparing`
5. `Ready`
6. `Submitted`
7. `Screening`
8. `Interview`
9. `Offer`
10. `Rejected`
11. `Withdrawn`

---

## 7. Responsive Breakpoints & Accessibility
- **Desktop Primary**: `1440px+` (Optimized for dual-pane workstation layouts, 3-column dashboard, full 7-desk virtual office).
- **Laptop**: `1024px – 1439px` (Collapsible sidebar, 2-column dashboard layout, responsive virtual office scaling).
- **Tablet**: `768px – 1023px` (Icon-only sidebar, single-column stacked view, scrollable virtual office deck).
- **Accessibility**: Minimum WCAG AA 4.5:1 text contrast ratio on all interactive controls. Fully keyboard navigable with shortcut mappings (`Cmd/Ctrl + 1..9` for view navigation).
