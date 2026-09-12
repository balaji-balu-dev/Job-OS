/**
 * ============================================================================
 * JobOS SQLite Database Engine (server/db/database.js)
 * Native node:sqlite with WAL mode, auto-migration, and seed data initialization
 * ============================================================================
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
export const RESUMES_DIR = path.resolve(DATA_DIR, 'resumes');
const DB_PATH = process.env.JOBOS_DB_PATH || path.join(DATA_DIR, 'jobos.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

export const isProduction = () => process.env.NODE_ENV === 'production' && process.env.JOBOS_SEED_DEMO !== 'true';

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(RESUMES_DIR)) {
      fs.mkdirSync(RESUMES_DIR, { recursive: true });
    }

    dbInstance = new DatabaseSync(DB_PATH);
    
    // Concurrency & busy timeout
    dbInstance.exec('PRAGMA busy_timeout = 5000;');
    
    // Enable WAL mode & foreign keys
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA synchronous = NORMAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');

    // Run Schema
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    dbInstance.exec(schemaSql);

    // Run Schema Migrations (Column additions and system_metadata)
    runSchemaMigrations(dbInstance);

    // Run Seeds
    seedInitialData(dbInstance);
    seedResumesIfEmpty(dbInstance);
    seedPortalsIfEmpty(dbInstance);
    seedTemplatesIfEmpty(dbInstance);
    seedSearchProfilesIfEmpty(dbInstance);
    seedEmailSignalsIfEmpty(dbInstance);
  }
  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (e) {
      console.error('Error closing database:', e);
    }
    dbInstance = null;
  }
}

function seedInitialData(db) {
  const checkAgents = db.prepare('SELECT COUNT(*) as count FROM agents').get();
  if (checkAgents && checkAgents.count > 0) {
    return; // Already seeded
  }

  const now = Date.now();

  // 1. Seed 7 Agents
  const insertAgent = db.prepare(`
    INSERT INTO agents (id, name, nickname, breed, role, state, color, current_task, progress, queue_count, uptime, tokens_spent, cluster_efficiency, last_activity, details_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialAgents = [
    {
      id: 'orchestrator',
      name: 'Orchestrator',
      nickname: 'Chief',
      breed: 'Golden Retriever',
      role: 'Office Boss & Coordination',
      state: 'working',
      color: '#f59e0b',
      current_task: 'Balancing Workday API crawler concurrency & routing approved Stripe payload to Verification agent.',
      progress: 68,
      queue_count: 4,
      uptime: '4d 18h',
      tokens_spent: 12400,
      cluster_efficiency: 99.4,
      last_activity: '4s ago',
      details: { subAgents: 6, queuedTasks: 14 }
    },
    {
      id: 'scout',
      name: 'Scout',
      nickname: 'Tracker',
      breed: 'Beagle',
      role: 'Job Discovery & Crawling',
      state: 'searching',
      color: '#38bdf8',
      current_task: 'Crawling 18 career portals (Greenhouse, Lever, Ashby, Workday) + Naukri enterprise feed for Staff Distributed Systems roles.',
      progress: 82,
      queue_count: 14,
      uptime: '4d 18h',
      tokens_spent: 8900,
      cluster_efficiency: 99.8,
      last_activity: '3s ago',
      details: { discoveredToday: 142, pendingIngest: 42 }
    },
    {
      id: 'job-intelligence',
      name: 'Job Intelligence',
      nickname: 'Sage',
      breed: 'Border Collie',
      role: 'JD Analysis & Vector Match',
      state: 'thinking',
      color: '#a855f7',
      current_task: 'Deconstructing Stripe JD requirements: parsing distributed consensus (Raft/Paxos) vs candidate profile vectors.',
      progress: 45,
      queue_count: 3,
      uptime: '4d 18h',
      tokens_spent: 14200,
      cluster_efficiency: 98.9,
      last_activity: '28s ago',
      details: { semanticMatch: 94.2, extractedSkills: 14 }
    },
    {
      id: 'application-agent',
      name: 'Application Agent',
      nickname: 'Quill',
      breed: 'German Shepherd',
      role: 'Precision Tailoring & Form Synthesis',
      state: 'waiting',
      color: '#f59e0b',
      current_task: 'Tailored resume and 4 custom question responses ready for Stripe. Awaiting explicit user sign-off at Human Gate.',
      progress: 90,
      queue_count: 2,
      uptime: '4d 18h',
      tokens_spent: 9800,
      cluster_efficiency: 99.1,
      last_activity: '1m ago',
      details: { gateLocked: true, gateId: 'GATE-8821' }
    },
    {
      id: 'verification-agent',
      name: 'Verification Desk',
      nickname: 'Sentry',
      breed: 'Doberman',
      role: 'Truth Vault & Hallucination Auditor',
      state: 'working',
      color: '#10b981',
      current_task: 'Truth Vault Audit complete: 100% of facts cross-verified against Candidate Profile Vault. Zero hallucinated claims detected.',
      progress: 100,
      queue_count: 0,
      uptime: '4d 18h',
      tokens_spent: 5400,
      cluster_efficiency: 100.0,
      last_activity: '45s ago',
      details: { auditHash: '0x9B44F', zeroTolerance: true }
    },
    {
      id: 'email-agent',
      name: 'Email Agent',
      nickname: 'Courier',
      breed: 'Cocker Spaniel',
      role: 'Recruiter Communications & Inbound Triage',
      state: 'waiting',
      color: '#f97316',
      current_task: 'Inbound recruiter reply drafted for Elena Vance (Coinbase). Tone: Warm, highly technical, calibrated to candidate voice.',
      progress: 100,
      queue_count: 1,
      uptime: '4d 18h',
      tokens_spent: 3100,
      cluster_efficiency: 99.2,
      last_activity: '6m ago',
      details: { confidence: 96, reviewQueue: 1 }
    },
    {
      id: 'tracking-agent',
      name: 'Tracking Puppy',
      nickname: 'Radar',
      breed: 'Basset Hound',
      role: 'Application Radar & Telemetry Watchdog',
      state: 'idle',
      color: '#64748b',
      current_task: 'Monitoring 14 submitted ATS applications, tracking email delivery receipts, and syncing calendar invites.',
      progress: 100,
      queue_count: 0,
      uptime: '4d 18h',
      tokens_spent: 2100,
      cluster_efficiency: 99.9,
      last_activity: '4m ago',
      details: { activePipelines: 6, nextPoll: '2m 18s' }
    }
  ];

  for (const a of initialAgents) {
    insertAgent.run(
      a.id, a.name, a.nickname, a.breed, a.role, a.state, a.color,
      a.current_task, a.progress, a.queue_count, a.uptime,
      a.tokens_spent, a.cluster_efficiency, a.last_activity,
      JSON.stringify(a.details), now
    );
  }

  // System Required: Safeguard Config
  const insertConfig = db.prepare(`
    INSERT INTO safeguard_config (key, value_json, updated_at)
    VALUES (?, ?, ?)
  `);
  insertConfig.run('daily_cap', JSON.stringify({ maxPerDay: 15, currentToday: isProduction() ? 0 : 3 }), now);
  insertConfig.run('blacklisted_employers', JSON.stringify(isProduction() ? [] : ['Current Employer LLC']), now);
  insertConfig.run('strict_human_gate', JSON.stringify({ enabled: true }), now);

  // System Required: AI Usage Config
  const checkUsageConfig = db.prepare('SELECT COUNT(*) as c FROM ai_usage_config').get();
  if (!checkUsageConfig || checkUsageConfig.c === 0) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const insertUsageConfig = db.prepare(`
      INSERT INTO ai_usage_config (id, is_manually_paused, is_auto_paused, pause_reason, paused_at, token_limit, cost_limit_usd, warning_threshold_pct, hard_stop_threshold_pct, period_type, period_start, period_end, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUsageConfig.run(
      'default', 0, 0, null, null,
      100000, 5.00, 80.0, 100.0,
      'MONTHLY', monthStart.getTime(), monthEnd.getTime(), now
    );
  }

  // Clean Production short-circuit: do not seed demo jobs, applications, profile, or missions
  if (isProduction()) {
    console.log('[JobOS] Production mode: Clean database initialized with system-required records.');
    return;
  }

  // 2. Seed Jobs (Development / Test only)
  const insertJob = db.prepare(`
    INSERT INTO jobs (id, external_id, title, company, location, source, source_type, match_score, salary, employment_type, discovered_time, application_method, difficulty, status, dedup_hash, match_reasons_json, concerns_json, skills_json, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialJobs = [
    {
      id: 'job-razorpay',
      external_id: 'gh-rzp-8819',
      title: 'Senior Backend Engineer - Core Payments',
      company: 'Razorpay',
      location: 'Bangalore, India (Hybrid)',
      source: 'Greenhouse ATS',
      source_type: 'ats',
      match_score: 94,
      salary: '₹42,00,000 - ₹55,00,000 + ESOPs',
      employment_type: 'Full-time',
      discovered_time: '2 hours ago',
      application_method: 'Direct ATS Integration',
      difficulty: 'Moderate (3 custom questions)',
      status: 'ready_to_submit',
      dedup_hash: 'hash-razorpay-senior-backend-payments',
      match_reasons: [
        'Matches primary mission: "Senior Backend India"',
        'Extensive 6+ yrs Java / Spring Boot & Distributed Architecture alignment',
        'Demonstrated payment gateway/ledger transaction experience from previous role'
      ],
      concerns: ['Hybrid requirement (2 days in Bangalore office)'],
      skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'AWS', 'Redis', 'Microservices'],
      description: 'Razorpay is seeking a Senior Backend Engineer to join our Core Payments Infrastructure team. You will architect high-throughput, low-latency financial rails handling over 10,000 transactions per second with 99.999% reliability.'
    },
    {
      id: 'job-stripe',
      external_id: 'strp-plat-492',
      title: 'Staff Platform Engineer',
      company: 'Stripe',
      location: 'Remote (India)',
      source: 'Stripe Careers Page',
      source_type: 'career_page',
      match_score: 89,
      salary: '₹65,00,000 - ₹82,00,000 + RSUs',
      employment_type: 'Full-time',
      discovered_time: '5 hours ago',
      application_method: 'Custom Career Portal',
      difficulty: 'High (4 architectural essays)',
      status: 'preparing',
      dedup_hash: 'hash-stripe-staff-platform-remote',
      match_reasons: [
        'Exceptional match for Kubernetes, Cloud infrastructure & developer tooling',
        'Strong background in platform engineering and service mesh architectures'
      ],
      concerns: ['Mention of Ruby/Sorbet codebase internals; candidate has Java/Rust/Go experience'],
      skills: ['Go', 'Kubernetes', 'AWS', 'Docker', 'Distributed Tracing', 'Terraform'],
      description: 'Stripe build tools and platforms power millions of global businesses. We are looking for a Staff Platform Engineer to elevate developer velocity and infrastructure resiliency across our global fleet.'
    },
    {
      id: 'job-datadog',
      external_id: 'dd-dist-109',
      title: 'Senior Software Engineer - Distributed Systems',
      company: 'Datadog',
      location: 'Bangalore / Remote',
      source: 'Search Discovery',
      source_type: 'search',
      match_score: 92,
      salary: '₹48,00,000 - ₹62,00,000',
      employment_type: 'Full-time',
      discovered_time: 'Yesterday',
      application_method: 'Lever ATS',
      difficulty: 'Low',
      status: 'interview',
      dedup_hash: 'hash-datadog-senior-distributed-systems',
      match_reasons: [
        'Direct telemetry & observability pipeline background',
        'Kafka partition tuning and time-series database optimizations match exactly'
      ],
      concerns: [],
      skills: ['Go', 'Kafka', 'Cassandra', 'Time Series DB', 'Linux Internals'],
      description: 'Join Datadog\'s ingest pipeline team. We process trillions of data points every day from servers and cloud workloads around the world.'
    },
    {
      id: 'job-postman',
      external_id: 'pm-lead-993',
      title: 'Lead Engineer - API Platform',
      company: 'Postman',
      location: 'Bangalore / Remote',
      source: 'Naukri Sync Extension',
      source_type: 'naukri',
      match_score: 88,
      salary: '₹50,00,000 - ₹65,00,000',
      employment_type: 'Full-time',
      discovered_time: '2 days ago',
      application_method: 'Direct Extension Submit',
      difficulty: 'Low',
      status: 'interview',
      dedup_hash: 'hash-postman-lead-engineer-api',
      match_reasons: [
        'Strong API design principles and Developer Experience focus',
        'Extensive node/microservices ecosystem leadership'
      ],
      concerns: [],
      skills: ['Node.js', 'TypeScript', 'Kubernetes', 'API Gateway', 'GraphQL'],
      description: 'Postman is looking for a Lead Engineer to scale the core collaboration engine used by 30 million developers.'
    }
  ];

  for (const j of initialJobs) {
    insertJob.run(
      j.id, j.external_id, j.title, j.company, j.location, j.source, j.source_type,
      j.match_score, j.salary, j.employment_type, j.discovered_time,
      j.application_method, j.difficulty, j.status, j.dedup_hash,
      JSON.stringify(j.match_reasons), JSON.stringify(j.concerns),
      JSON.stringify(j.skills), j.description, now, now
    );
  }

  // 3. Seed Application Under Human Gate (Razorpay)
  const insertApp = db.prepare(`
    INSERT INTO applications (id, job_id, company, role, status, verification_score, verification_hash, lock_token, lock_expires_at, preflight_checks_json, answers_json, submitted_at, receipt_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const razorpayApp = {
    id: 'app-razorpay',
    job_id: 'job-razorpay',
    company: 'Razorpay',
    role: 'Senior Backend Engineer - Core Payments',
    status: 'GATE_HALTED',
    verification_score: '100% (14/14 fields confirmed)',
    verification_hash: '0x9B44F',
    lock_token: 'GATE-8821',
    lock_expires_at: now + 900000, // 15 mins TTL
    preflight_checks: [
      { id: 'pf-1', name: 'Tailored Resume (v3.2 Backend Focus)', passed: true, details: 'Verified ATS parsing score 98%' },
      { id: 'pf-2', name: 'Tailored Cover Letter (Zero Hallucinations)', passed: true, details: 'Checked against candidate employment history' },
      { id: 'pf-3', name: 'All 14 Required ATS Fields Populated', passed: true, details: 'Legal name, contact, citizenship, notice period, compensation' },
      { id: 'pf-4', name: 'Verification Agent Seal of Compliance', passed: true, details: 'Signed by Sentry (Verification Agent)' },
      { id: 'pf-5', name: 'Zero Salary or Work Authorization Conflict', passed: true, details: 'Profile matches requirements' }
    ],
    answers: [
      {
        id: 'ans-1',
        question: 'Why do you want to join Razorpay and the Core Payments team?',
        answer: 'Having engineered distributed ledger pipelines processing 4M+ daily transactions at my current role, I have seen first-hand the technical complexity of payment settlements. Razorpay is the backbone of Indian digital commerce. I want to solve high-concurrency database locking, idempotency guarantees, and sub-100ms financial transaction routing at true national scale.',
        provenance: 'DERIVED',
        sourceCitation: 'Profile: Projects (Chronos Ledger) + Preferences (Fintech Focus)',
        confidence: 98,
        status: 'approved'
      },
      {
        id: 'ans-2',
        question: 'Describe a time you diagnosed and resolved a high-severity production distributed systems outage.',
        answer: 'During a Black Friday spike, our Kafka consumer group encountered partition rebalance storms due to slow downstream PostgreSQL writes. I diagnosed consumer heartbeats timing out under write queue saturation. I introduced bulk-upsert buffering with an in-memory queue, tuned max.poll.interval.ms, and partitioned the database write replica pool, reducing p99 latency from 1.8s to 120ms without data loss.',
        provenance: 'VERIFIED',
        sourceCitation: 'Profile: Achievements -> Incident Post-Mortem 2024 & Project Chronos Architecture',
        confidence: 99,
        status: 'approved'
      },
      {
        id: 'ans-3',
        question: 'What is your current notice period and are you open to hybrid work in Bangalore?',
        answer: 'My notice period is 30 days (negotiable to 15 days upon buyout). Yes, I am fully open to the hybrid requirement in Bangalore (2 days in office).',
        provenance: 'VERIFIED',
        sourceCitation: 'Profile: Work Preferences -> Notice Period (30 Days) & Location Preferences',
        confidence: 100,
        status: 'approved'
      },
      {
        id: 'ans-4',
        question: 'What are your expected CTC expectations for this position?',
        answer: 'My target compensation is ₹48,00,000 - ₹55,00,000 fixed CTC plus ESOPs, aligned with the posted budget band.',
        provenance: 'DERIVED',
        sourceCitation: 'Profile: Salary Expectations (Target: ₹50L) + Job Intelligence Market Band',
        confidence: 96,
        status: 'approved'
      }
    ]
  };

  insertApp.run(
    razorpayApp.id, razorpayApp.job_id, razorpayApp.company, razorpayApp.role,
    razorpayApp.status, razorpayApp.verification_score, razorpayApp.verification_hash,
    razorpayApp.lock_token, razorpayApp.lock_expires_at,
    JSON.stringify(razorpayApp.preflight_checks),
    JSON.stringify(razorpayApp.answers),
    null, null, now, now
  );

  // 4. Seed Candidate Profile Sections
  const insertProfile = db.prepare(`
    INSERT INTO candidate_profile (section_key, content_json, provenance, updated_at)
    VALUES (?, ?, ?, ?)
  `);

  const profileSections = {
    identity: {
      fullName: 'Balaji S.',
      preferredName: 'Balaji',
      pronouns: 'He/Him',
      citizenship: 'Citizen of India'
    },
    contact: {
      email: 'balaji.dev@example.com',
      phone: '+91 98765 43210',
      linkedin: 'https://linkedin.com/in/balaji-dev',
      github: 'https://github.com/balaji-dev'
    },
    location: {
      currentCity: 'Bangalore, Karnataka, India',
      openToRelocation: 'Yes (Hyderabad, Pune, Remote)',
      workModelPreference: 'Remote or Hybrid (1-2 days)'
    },
    work_authorization: {
      indiaCitizen: 'Yes',
      usVisaStatus: 'None (Requires sponsorship)',
      euVisaStatus: 'None'
    },
    employment: [
      {
        company: 'Apex Cloud Systems',
        title: 'Senior Backend Engineer',
        period: '2022 - Present (3 yrs)',
        highlights: 'Architected distributed event-driven payment rails in Java and Go handling 10k RPS.'
      },
      {
        company: 'Veloce Data Labs',
        title: 'Software Engineer II',
        period: '2019 - 2022 (3 yrs)',
        highlights: 'Scaled Redis caching layers and GraphQL federation gateways for microservices.'
      }
    ],
    education: {
      degree: 'Bachelor of Technology in Computer Science',
      institution: 'National Institute of Technology',
      year: '2019'
    },
    skills: {
      languages: 'Java, Go, TypeScript, SQL, Rust (Foundational)',
      frameworks: 'Spring Boot, Quarkus, Node.js, Express',
      databases: 'PostgreSQL, DynamoDB, Redis, Cassandra',
      messaging: 'Apache Kafka, RabbitMQ, AWS SQS',
      cloudDevops: 'AWS, Kubernetes, Docker, Terraform, Prometheus'
    },
    salary: {
      currentCTC: '₹36,00,000 Fixed',
      expectedCTC: '₹48,00,000 - ₹55,00,000 + Equity',
      minimumAcceptable: '₹44,00,000'
    },
    notice_period: {
      official: '30 Days',
      negotiableDays: '15 Days with buyout'
    }
  };

  for (const [key, val] of Object.entries(profileSections)) {
    insertProfile.run(key, JSON.stringify(val), 'USER_VERIFIED', now);
  }

  // 5. Seed Attention Items
  const insertAttention = db.prepare(`
    INSERT INTO attention_items (id, type, urgency, title, description, agent, time_elapsed, action_label, target_view, target_id, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAttention.run(
    'att-1',
    'submission_approval',
    'high',
    'Razorpay — Senior Backend Engineer',
    'Application prepared (14/14 fields verified). Verification Agent gave 100% compliance seal. Requires your final sign-off before transmission.',
    'verification-agent',
    '12m ago',
    'Review & Submit Gate',
    'submission-gate',
    'app-razorpay',
    'PENDING',
    now
  );

  insertAttention.run(
    'att-2',
    'email_approval',
    'medium',
    'Datadog — Recruiter Interview Confirmation',
    'Email Agent drafted a personalized confirmation for Technical Screening with Sarah Miller (Lead Recruiter). Never sent automatically.',
    'email-agent',
    '24m ago',
    'Review Draft Email',
    'interviews',
    'int-datadog',
    'PENDING',
    now
  );

  // 6. Seed Missions
  const insertMission = db.prepare(`
    INSERT INTO missions (id, name, status, schedule, titles_json, locations_json, skills_json, min_match_score, applications_submitted, interviews_generated, last_run, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMission.run(
    'mission-backend-india',
    'Senior Backend India',
    'active',
    'Every 2 hours',
    JSON.stringify(['Senior Backend Engineer', 'Staff Backend Engineer', 'Principal Engineer']),
    JSON.stringify(['India', 'Bangalore', 'Hyderabad', 'Remote']),
    JSON.stringify(['Java', 'Spring Boot', 'AWS', 'Kubernetes', 'Kafka', 'Go']),
    80, 14, 3, '18 minutes ago', now
  );

  // 7. Seed Demo AI Usage Ledger
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  const insertLedger = db.prepare(`
    INSERT INTO ai_usage_ledger (id, timestamp, agent_id, model, operation, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd, is_authoritative, period_start, period_end, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLedger.run(
    'usage-init-1', now - 3600000 * 2, 'job-intelligence', 'gemini-2.5-flash', 'JD_ANALYZE',
    1840, 320, 2160, 0.000234, 1, monthStart.getTime(), monthEnd.getTime(),
    JSON.stringify({ company: 'Razorpay', role: 'Senior Backend' })
  );

  insertLedger.run(
    'usage-init-2', now - 3600000 * 5, 'application-agent', 'gemini-2.5-flash', 'QUESTION_ANSWER',
    2420, 680, 3100, 0.000385, 1, monthStart.getTime(), monthEnd.getTime(),
    JSON.stringify({ company: 'Stripe', questionsCount: 4 })
  );

  insertLedger.run(
    'usage-init-3', now - 3600000 * 8, 'email-agent', 'gemini-2.5-flash', 'RECRUITER_REPLY',
    820, 240, 1060, 0.000133, 1, monthStart.getTime(), monthEnd.getTime(),
    JSON.stringify({ recruiter: 'Elena Vance', company: 'Coinbase' })
  );
}

function seedResumesIfEmpty(db) {
  if (isProduction()) {
    return; // Resumes start clean/empty in production
  }
  try {
    if (!fs.existsSync(RESUMES_DIR)) {
      fs.mkdirSync(RESUMES_DIR, { recursive: true });
    }

    const now = Date.now();
    const insertResume = db.prepare(`
      INSERT OR IGNORE INTO resumes (id, title, role_category, filename, original_name, file_path, file_size, mime_type, is_primary, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const samples = [
      {
        id: 'resume-backend-v3',
        title: 'Senior Backend Systems Architect (v3.2)',
        roleCategory: 'Backend Developer',
        filename: 'resume-backend-v3.pdf',
        originalName: 'Balaji_S_Senior_Backend_Engineer.pdf',
        content: '%PDF-1.4\n% Sample verified candidate resume for Senior Backend Systems Architect\nBalaji S. - 6+ Years Distributed Systems, Java, Go, Kafka, PostgreSQL\n%%EOF',
        mimeType: 'application/pdf',
        isPrimary: 1
      },
      {
        id: 'resume-fullstack-v2',
        title: 'Full Stack & Cloud Applications (v2.1)',
        roleCategory: 'Full Stack Developer',
        filename: 'resume-fullstack-v2.pdf',
        originalName: 'Balaji_S_Full_Stack_Node_React.pdf',
        content: '%PDF-1.4\n% Sample verified candidate resume for Full Stack Engineering\nBalaji S. - React, Node.js, Express, Microservices, TypeScript\n%%EOF',
        mimeType: 'application/pdf',
        isPrimary: 0
      },
      {
        id: 'resume-data-ai-v1',
        title: 'AI Systems & Data Pipelines (v1.8)',
        roleCategory: 'Data/AI',
        filename: 'resume-data-ai-v1.pdf',
        originalName: 'Balaji_S_AI_Data_Systems.pdf',
        content: '%PDF-1.4\n% Sample verified candidate resume for AI Systems & Data Engineering\nBalaji S. - Vector Databases, Python, LLM Orchestration, Spark\n%%EOF',
        mimeType: 'application/pdf',
        isPrimary: 0
      }
    ];

    for (const s of samples) {
      const targetPath = path.join(RESUMES_DIR, s.filename);
      if (!fs.existsSync(targetPath)) {
        fs.writeFileSync(targetPath, s.content, 'utf-8');
      }
      const stats = fs.statSync(targetPath);
      insertResume.run(
        s.id, s.title, s.roleCategory, s.filename, s.originalName,
        targetPath, stats.size, s.mimeType, s.isPrimary, now, now
      );
    }
  } catch (err) {
    console.warn('[JobOS] Resume seed note:', err.message);
  }
}

function runSchemaMigrations(db) {
  try {
    // 0. Ensure system_metadata table exists and record metadata
    db.exec(`
      CREATE TABLE IF NOT EXISTS system_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    const now = Date.now();
    const setMeta = db.prepare(`
      INSERT INTO system_metadata (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);

    setMeta.run('schema_version', '2.0.0', now);
    const envName = process.env.NODE_ENV === 'production' ? 'production' : (process.env.NODE_ENV || 'development');
    setMeta.run('environment', envName, now);

    const initCheck = db.prepare("SELECT value FROM system_metadata WHERE key = 'initialized_at'").get();
    if (!initCheck) {
      setMeta.run('initialized_at', new Date().toISOString(), now);
    }

    const jobColumns = db.prepare('PRAGMA table_info(jobs)').all().map(c => c.name);
    if (!jobColumns.includes('fit_breakdown_json')) {
      db.exec("ALTER TABLE jobs ADD COLUMN fit_breakdown_json TEXT;");
    }
    if (!jobColumns.includes('deal_breakers_json')) {
      db.exec("ALTER TABLE jobs ADD COLUMN deal_breakers_json TEXT DEFAULT '[]';");
    }
    if (!jobColumns.includes('priority_tier')) {
      db.exec("ALTER TABLE jobs ADD COLUMN priority_tier TEXT DEFAULT 'GOOD_MATCH';");
    }
    if (!jobColumns.includes('deadline')) {
      db.exec("ALTER TABLE jobs ADD COLUMN deadline TEXT;");
    }
    if (!jobColumns.includes('is_expired')) {
      db.exec("ALTER TABLE jobs ADD COLUMN is_expired INTEGER DEFAULT 0;");
    }

    const appColumns = db.prepare('PRAGMA table_info(applications)').all().map(c => c.name);
    if (!appColumns.includes('resume_version')) {
      db.exec("ALTER TABLE applications ADD COLUMN resume_version INTEGER DEFAULT 1;");
    }
    if (!appColumns.includes('resume_id')) {
      db.exec("ALTER TABLE applications ADD COLUMN resume_id TEXT;");
    }
    if (!appColumns.includes('ats_score')) {
      db.exec("ALTER TABLE applications ADD COLUMN ats_score INTEGER DEFAULT 0;");
    }
    if (!appColumns.includes('follow_up_date')) {
      db.exec("ALTER TABLE applications ADD COLUMN follow_up_date TEXT;");
    }
    if (!appColumns.includes('notes')) {
      db.exec("ALTER TABLE applications ADD COLUMN notes TEXT;");
    }
    if (!appColumns.includes('salary_offered')) {
      db.exec("ALTER TABLE applications ADD COLUMN salary_offered TEXT;");
    }

    const credColumns = db.prepare('PRAGMA table_info(user_ai_credentials)').all().map(c => c.name);
    if (!credColumns.includes('model_config_json')) {
      db.exec("ALTER TABLE user_ai_credentials ADD COLUMN model_config_json TEXT DEFAULT '{}';");
    }
  } catch (e) {
    console.warn('[JobOS] Schema migration note:', e.message);
  }
}

function seedPortalsIfEmpty(db) {
  try {
    const check = db.prepare('SELECT COUNT(*) as count FROM portal_health').get();
    if (check && check.count > 0) return;

    const now = Date.now();
    const insert = db.prepare(`
      INSERT INTO portal_health (portal_id, name, status, last_scraped_at, jobs_retrieved_today, error_count, rate_limit_reset_at, config_json, is_enabled, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultPortals = [
      { id: 'greenhouse', name: 'Greenhouse ATS', status: 'healthy', jobs: 28, config: { timeoutMs: 10000, rateLimitPerMin: 30 } },
      { id: 'lever', name: 'Lever ATS', status: 'healthy', jobs: 19, config: { timeoutMs: 10000, rateLimitPerMin: 30 } },
      { id: 'linkedin', name: 'LinkedIn Jobs', status: 'healthy', jobs: 42, config: { timeoutMs: 12000, rateLimitPerMin: 20 } },
      { id: 'naukri', name: 'Naukri Enterprise', status: 'healthy', jobs: 35, config: { timeoutMs: 10000, rateLimitPerMin: 25 } },
      { id: 'indeed', name: 'Indeed Global', status: 'healthy', jobs: 24, config: { timeoutMs: 10000, rateLimitPerMin: 20 } },
      { id: 'wellfound', name: 'Wellfound (AngelList)', status: 'healthy', jobs: 16, config: { timeoutMs: 10000, rateLimitPerMin: 20 } },
      { id: 'foundit', name: 'Foundit (Monster)', status: 'healthy', jobs: 12, config: { timeoutMs: 10000, rateLimitPerMin: 20 } },
      { id: 'internshala', name: 'Internshala Tech', status: 'healthy', jobs: 8, config: { timeoutMs: 10000, rateLimitPerMin: 25 } },
      { id: 'remoteok', name: 'RemoteOK & Web3', status: 'healthy', jobs: 22, config: { timeoutMs: 10000, rateLimitPerMin: 30 } }
    ];

    const prod = isProduction();
    for (const p of defaultPortals) {
      const jobsToday = prod ? 0 : p.jobs;
      const lastScraped = prod ? null : now - 1800000;
      insert.run(p.id, p.name, p.status, lastScraped, jobsToday, 0, null, JSON.stringify(p.config), 1, now);
    }
  } catch (e) {
    console.warn('[JobOS] Portal health seed note:', e.message);
  }
}

function seedTemplatesIfEmpty(db) {
  try {
    const check = db.prepare('SELECT COUNT(*) as count FROM templates').get();
    if (check && check.count > 0) return;

    const now = Date.now();
    const insert = db.prepare(`
      INSERT INTO templates (id, name, type, format, content, style_rules_json, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultTemplates = [
      {
        id: 'tmpl-resume-modern',
        name: 'Executive Systems Architect (Markdown / ATS-Clean)',
        type: 'resume',
        format: 'markdown',
        content: '# {{FULL_NAME}}\n{{EMAIL}} | {{PHONE}} | {{LOCATION}} | {{LINKEDIN}}\n\n## PROFESSIONAL SUMMARY\n{{SUMMARY}}\n\n## CORE TECHNICAL COMPETENCIES\n{{SKILLS}}\n\n## PROFESSIONAL EXPERIENCE\n{{EXPERIENCE}}\n\n## PROJECTS & ARCHITECTURE\n{{PROJECTS}}\n\n## EDUCATION & CERTIFICATIONS\n{{EDUCATION}}',
        styleRules: { font: 'JetBrains Mono', margins: '0.75in', maxPages: 2 },
        isDefault: 1
      },
      {
        id: 'tmpl-resume-latex',
        name: 'Deedy Academic & Research (LaTeX / LuaLaTeX)',
        type: 'resume',
        format: 'latex',
        content: '\\documentclass[letterpaper]{article}\n\\usepackage{geometry}\n\\geometry{margin=0.75in}\n\\begin{document}\n\\section*{{{FULL_NAME}}}\n{{SUMMARY}}\n\\section*{Experience}\n{{EXPERIENCE}}\n\\section*{Technical Skills}\n{{SKILLS}}\n\\end{document}',
        styleRules: { compiler: 'lualatex', class: 'article', maxPages: 2 },
        isDefault: 0
      },
      {
        id: 'tmpl-cl-forward',
        name: 'Forward-Looking Strategic Cover Letter (Standard)',
        type: 'cover_letter',
        format: 'markdown',
        content: 'Dear {{HIRING_MANAGER_NAME}} & the {{COMPANY}} Team,\n\nI am writing to express my strong interest in the {{ROLE}} opportunity at {{COMPANY}}. With over 6 years architecting high-throughput distributed systems and payment rails, I have closely tracked {{COMPANY}}\'s technical trajectory.\n\nIn my previous work at Cashfree Payments, I designed ledger settlement engines managing 10,000 TPS with 99.999% uptime. Applying this to {{COMPANY}}\'s core infrastructure will allow your team to immediately accelerate roadmap delivery without technical debt.\n\nI look forward to discussing how my experience with {{KEY_SKILLS}} aligns with your team goals.\n\nSincerely,\n{{FULL_NAME}}',
        styleRules: { maxWords: 350, tone: 'professional-technical' },
        isDefault: 1
      }
    ];

    for (const t of defaultTemplates) {
      insert.run(t.id, t.name, t.type, t.format, t.content, JSON.stringify(t.styleRules), t.isDefault, now, now);
    }
  } catch (e) {
    console.warn('[JobOS] Templates seed note:', e.message);
  }
}

function seedSearchProfilesIfEmpty(db) {
  if (isProduction()) {
    return; // Search profiles start clean/empty in production
  }
  try {
    const check = db.prepare('SELECT COUNT(*) as count FROM search_profiles').get();
    if (check && check.count > 0) return;

    const now = Date.now();
    const insert = db.prepare(`
      INSERT INTO search_profiles (id, name, is_active, keywords_json, titles_json, locations_json, salary_min, min_match_score, portals_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultProfiles = [
      {
        id: 'sp-senior-backend',
        name: 'Senior Distributed Systems — India & Remote',
        isActive: 1,
        keywords: ['Java', 'Spring Boot', 'Kafka', 'Distributed Systems', 'PostgreSQL', 'Redis', 'High Throughput'],
        titles: ['Senior Backend Engineer', 'Staff Engineer', 'Distributed Systems Architect', 'Principal Backend Engineer'],
        locations: ['India (Remote)', 'Bangalore', 'Hyderabad', 'Hybrid (1-2 days)'],
        salaryMin: 4000000,
        minMatchScore: 82,
        portals: ['greenhouse', 'lever', 'linkedin', 'naukri', 'wellfound']
      },
      {
        id: 'sp-fullstack-cloud',
        name: 'Lead Full Stack & Cloud Architect — Global Remote',
        isActive: 0,
        keywords: ['Node.js', 'React', 'TypeScript', 'AWS', 'Kubernetes', 'Microservices', 'GraphQL'],
        titles: ['Lead Full Stack Engineer', 'Staff Cloud Architect', 'Senior Full Stack Developer'],
        locations: ['Remote (Worldwide)', 'Remote (APAC)', 'Bangalore'],
        salaryMin: 4500000,
        minMatchScore: 80,
        portals: ['linkedin', 'remoteok', 'indeed', 'wellfound']
      }
    ];

    for (const p of defaultProfiles) {
      insert.run(
        p.id, p.name, p.isActive,
        JSON.stringify(p.keywords), JSON.stringify(p.titles), JSON.stringify(p.locations),
        p.salaryMin, p.minMatchScore, JSON.stringify(p.portals), now, now
      );
    }
  } catch (e) {
    console.warn('[JobOS] Search profiles seed note:', e.message);
  }
}

function seedEmailSignalsIfEmpty(db) {
  if (isProduction()) {
    return; // Email signals start clean/empty in production
  }
  try {
    const check = db.prepare('SELECT COUNT(*) as count FROM email_signals').get();
    if (check && check.count > 0) return;

    const now = Date.now();
    const insert = db.prepare(`
      INSERT INTO email_signals (id, application_id, company, sender, subject, date, detected_signal, confidence, proposed_status, status, raw_snippet, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultSignals = [
      {
        id: 'sig-datadog-invite',
        appId: 'app-datadog',
        company: 'Datadog',
        sender: 'sarah.miller@datadog.com',
        subject: 'Interview Invitation: Senior Systems Engineer with Datadog',
        date: 'Today at 10:14 AM',
        signal: 'interview_invitation',
        confidence: 98,
        proposedStatus: 'Technical Round 1 (Live Coding)',
        status: 'pending_approval',
        snippet: 'Hi Balaji, thanks for your patience. The engineering team was very impressed by your distributed systems background and we would like to schedule a 60-min technical round.'
      },
      {
        id: 'sig-stripe-confirm',
        appId: 'app-stripe',
        company: 'Stripe',
        sender: 'talent-ops@stripe.com',
        subject: 'Application Received: Staff Platform Engineer',
        date: 'Yesterday at 4:32 PM',
        signal: 'application_confirmation',
        confidence: 99,
        proposedStatus: 'Application Viewed / Screening',
        status: 'approved',
        snippet: 'We have received your application for Staff Platform Engineer. Our team is actively reviewing your qualifications.'
      }
    ];

    for (const s of defaultSignals) {
      insert.run(
        s.id, s.appId, s.company, s.sender, s.subject, s.date,
        s.signal, s.confidence, s.proposedStatus, s.status, s.snippet, now
      );
    }
  } catch (e) {
    console.warn('[JobOS] Email signals seed note:', e.message);
  }
}


