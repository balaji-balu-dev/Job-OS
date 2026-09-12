'use client';

import React, { type FC } from 'react';
import { CardSplitAccordion, type AccordionItemData } from './card-split-accordian';
import { Shield, Search, Brain, FileEdit, CheckCircle2, Mail, Radar } from 'lucide-react';

export const JOBOS_AGENT_FLEET_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    title: 'Chief — Autonomous Fleet Orchestrator',
    icon: <Shield className="size-4 text-amber-400" />,
    content:
      'Coordinates priority mission scheduling, token rate-limit governance, concurrency locks, and system-wide emergency pause/resume across all worker subagents.',
  },
  {
    id: 2,
    title: 'Tracker — Multi-Portal Scout (7 Active Portals)',
    icon: <Search className="size-4 text-emerald-400" />,
    content:
      'Continuously harvests verified listings across Greenhouse, Lever, LinkedIn, Indeed, Wellfound, RemoteOK, and Naukri Enterprise with composite SHA-256 deduplication.',
  },
  {
    id: 3,
    title: 'Sage — Deep Job Intelligence & 6D Fit Engine',
    icon: <Brain className="size-4 text-sky-400" />,
    content:
      'Analyzes unstructured JDs against the Candidate Truth Vault across 6 dimensions: Skills (30%), Experience (25%), Location (15%), Salary (10%), Seniority (10%), and Domain (10%) with explicit deal-breaker detection.',
  },
  {
    id: 4,
    title: 'Quill — Precision Resume & Cover Letter Drafter',
    icon: <FileEdit className="size-4 text-indigo-400" />,
    content:
      'Tailors application documents according to the 4-stage versioning lifecycle (v1 Base → v2 Tailored → v3 Reviewed → v4 Frozen) with strict zero-fabrication guarantees.',
  },
  {
    id: 5,
    title: 'Sentry — Cryptographic Verification Gatekeeper',
    icon: <CheckCircle2 className="size-4 text-emerald-400" />,
    content:
      'Enforces mandatory explicit human approval before any transmission. Audits claims against Candidate Vault provenance (USER_VERIFIED) and issues tamper-proof GATE-xxxx tokens.',
  },
  {
    id: 6,
    title: 'Courier — Recruiter Email Signal Triage',
    icon: <Mail className="size-4 text-purple-400" />,
    content:
      'Parses inbound recruiter signals, interview requests, and assessment links, staging automated status transitions and calibrated responses for user sign-off.',
  },
  {
    id: 7,
    title: 'Radar — Application Lifecycle Tracking Puppy',
    icon: <Radar className="size-4 text-rose-400" />,
    content:
      'Monitors the 12-stage application pipeline, calculates velocity KPIs, and flags quiet applications exceeding 8 days for strategic follow-up actions.',
  },
];

export const JobOSMissionAccordion: FC = () => {
  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-serif font-normal text-white sm:text-2xl">
          Autonomous Agent Fleet Controls
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Click any specialized agent to inspect active protocols, authority levels, and live telemetry.
        </p>
      </div>
      <CardSplitAccordion items={JOBOS_AGENT_FLEET_ITEMS} />
    </div>
  );
};

export default JobOSMissionAccordion;
