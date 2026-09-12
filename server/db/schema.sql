-- ============================================================================
-- JobOS Relational Schema (SQLite with WAL Mode)
-- High-concurrency autonomous job-search command center schema
-- ============================================================================

PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;

-- 1. Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  breed TEXT NOT NULL,
  role TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'idle', -- idle, working, searching, thinking, waiting, success, error, attention
  color TEXT NOT NULL,
  current_task TEXT,
  progress INTEGER DEFAULT 0,
  queue_count INTEGER DEFAULT 0,
  uptime TEXT DEFAULT '1d 0h',
  tokens_spent INTEGER DEFAULT 0,
  cluster_efficiency REAL DEFAULT 99.4,
  last_activity TEXT DEFAULT 'Just now',
  details_json TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL
);

-- 2. Candidate Profile Vault (Structured 16 Sections)
CREATE TABLE IF NOT EXISTS candidate_profile (
  section_key TEXT PRIMARY KEY,
  content_json TEXT NOT NULL,
  provenance TEXT NOT NULL DEFAULT 'USER_VERIFIED', -- USER_VERIFIED, DERIVED, UNKNOWN
  updated_at INTEGER NOT NULL
);

-- 3. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  source TEXT NOT NULL,
  source_type TEXT NOT NULL, -- ats, career_page, search, naukri
  match_score INTEGER NOT NULL DEFAULT 80,
  salary TEXT,
  employment_type TEXT DEFAULT 'Full-time',
  discovered_time TEXT DEFAULT 'Recently',
  application_method TEXT DEFAULT 'Direct ATS Integration',
  difficulty TEXT DEFAULT 'Moderate',
  status TEXT NOT NULL DEFAULT 'discovered', -- discovered, shortlisted, approved, preparing, ready_to_submit, submitted, screening, interview, offer, rejected, withdrawn
  dedup_hash TEXT NOT NULL UNIQUE,
  match_reasons_json TEXT DEFAULT '[]',
  concerns_json TEXT DEFAULT '[]',
  skills_json TEXT DEFAULT '[]',
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_match_score ON jobs(match_score DESC);

-- 4. Applications Table (Under Human Gate)
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFTING', -- DRAFTING, READY_FOR_REVIEW, GATE_HALTED, SUBMITTING, SUBMITTED, FAILED
  verification_score TEXT DEFAULT '0%',
  verification_hash TEXT,
  lock_token TEXT,
  lock_expires_at INTEGER,
  preflight_checks_json TEXT DEFAULT '[]',
  answers_json TEXT DEFAULT '[]',
  submitted_at INTEGER,
  receipt_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_apps_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);

-- 5. Missions Table
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  schedule TEXT NOT NULL,
  titles_json TEXT NOT NULL DEFAULT '[]',
  locations_json TEXT NOT NULL DEFAULT '[]',
  skills_json TEXT NOT NULL DEFAULT '[]',
  min_match_score INTEGER DEFAULT 80,
  applications_submitted INTEGER DEFAULT 0,
  interviews_generated INTEGER DEFAULT 0,
  last_run TEXT DEFAULT 'Never',
  created_at INTEGER NOT NULL
);

-- 6. Tasks Table (Orchestration Ledger)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  correlation_id TEXT NOT NULL,
  type TEXT NOT NULL,
  agent_id TEXT NOT NULL REFERENCES agents(id),
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED, PAUSED_BLOCKED
  priority INTEGER DEFAULT 5,
  payload_json TEXT NOT NULL DEFAULT '{}',
  result_json TEXT,
  error_json TEXT,
  checkpoint_json TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 0,
  dependencies_json TEXT DEFAULT '[]',
  created_at INTEGER NOT NULL,
  started_at INTEGER,
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id);

-- 7. Events Table (Append-Only Safe Audit Log)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  type TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- JOB, APPLICATION, AGENT, SYSTEM
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata_json TEXT DEFAULT '{}',
  log_level TEXT DEFAULT 'INFO' -- INFO, WARN, ERROR, GATE
);

CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_agent ON events(agent_id);

-- 8. Attention Items (Human Gate Dock)
CREATE TABLE IF NOT EXISTS attention_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  agent TEXT NOT NULL,
  time_elapsed TEXT DEFAULT 'Just now',
  action_label TEXT NOT NULL,
  target_view TEXT NOT NULL,
  target_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, SNOOZED, DISMISSED
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attention_status ON attention_items(status);

-- 9. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  stage TEXT NOT NULL,
  datetime TEXT NOT NULL,
  interviewer TEXT,
  format TEXT DEFAULT 'Video Conference',
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
  briefing_json TEXT DEFAULT '{}',
  created_at INTEGER NOT NULL
);

-- 10. Safeguard Config Table
CREATE TABLE IF NOT EXISTS safeguard_config (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 11. AI Usage Ledger Table (Persistent Token Tracking)
CREATE TABLE IF NOT EXISTS ai_usage_ledger (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  agent_id TEXT NOT NULL,
  model TEXT NOT NULL,
  operation TEXT NOT NULL, -- JD_ANALYZE, QUESTION_ANSWER, RECRUITER_REPLY, EMBEDDING, TEST
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd REAL NOT NULL DEFAULT 0.0,
  is_authoritative INTEGER NOT NULL DEFAULT 1, -- 1 if from API usageMetadata, 0 if estimated
  period_start INTEGER NOT NULL,
  period_end INTEGER NOT NULL,
  metadata_json TEXT DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON ai_usage_ledger(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_period ON ai_usage_ledger(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_agent ON ai_usage_ledger(agent_id);

-- 12. AI Usage & Limit Protection Configuration Table
CREATE TABLE IF NOT EXISTS ai_usage_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  is_manually_paused INTEGER NOT NULL DEFAULT 0, -- 1 if user paused
  is_auto_paused INTEGER NOT NULL DEFAULT 0, -- 1 if limit reached
  pause_reason TEXT, -- 'MANUAL', 'LIMIT_REACHED', 'PROVIDER_ERROR', null
  paused_at INTEGER,
  token_limit INTEGER NOT NULL DEFAULT 100000, -- e.g. 100k tokens
  cost_limit_usd REAL DEFAULT 5.00, -- optional monetary limit
  warning_threshold_pct REAL NOT NULL DEFAULT 80.0, -- e.g. 80%
  hard_stop_threshold_pct REAL NOT NULL DEFAULT 100.0, -- 100%
  period_type TEXT NOT NULL DEFAULT 'MONTHLY', -- DAILY, WEEKLY, MONTHLY
  period_start INTEGER NOT NULL,
  period_end INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 13. Resumes Table (Multi-Role Local-First Management)
CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  role_category TEXT NOT NULL, -- 'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data/AI'
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resumes_role ON resumes(role_category);
CREATE INDEX IF NOT EXISTS idx_resumes_primary ON resumes(is_primary);

-- 14. User-Provided AI Credentials Table (AES-256-GCM Encrypted at Rest)
CREATE TABLE IF NOT EXISTS user_ai_credentials (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL, -- 'gemini', 'openai', etc.
  encrypted_key TEXT NOT NULL,
  iv TEXT NOT NULL,
  tag TEXT NOT NULL,
  masked_key TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_creds_active ON user_ai_credentials(is_active);

-- 15. Saved Search Profiles Table
CREATE TABLE IF NOT EXISTS search_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  keywords_json TEXT NOT NULL DEFAULT '[]',
  titles_json TEXT NOT NULL DEFAULT '[]',
  locations_json TEXT NOT NULL DEFAULT '[]',
  salary_min INTEGER DEFAULT 0,
  min_match_score INTEGER DEFAULT 80,
  portals_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_search_profiles_active ON search_profiles(is_active);

-- 16. Job Portal Health & Configuration Table
CREATE TABLE IF NOT EXISTS portal_health (
  portal_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy', -- healthy, degraded, rate_limited, offline
  last_scraped_at INTEGER,
  jobs_retrieved_today INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  rate_limit_reset_at INTEGER,
  config_json TEXT NOT NULL DEFAULT '{}',
  is_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL
);

-- 17. Custom Resume & Cover Letter Templates Table
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- resume, cover_letter
  format TEXT NOT NULL DEFAULT 'markdown', -- latex, typst, markdown, text
  content TEXT NOT NULL,
  style_rules_json TEXT NOT NULL DEFAULT '{}',
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);

-- 18. Inbound Recruiter & Application Email Signals Table
CREATE TABLE IF NOT EXISTS email_signals (
  id TEXT PRIMARY KEY,
  application_id TEXT,
  company TEXT NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  date TEXT NOT NULL,
  detected_signal TEXT NOT NULL, -- application_confirmation, recruiter_contact, interview_invitation, interview_reschedule, rejection, offer, assessment_request
  confidence INTEGER NOT NULL DEFAULT 90,
  proposed_status TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_approval', -- pending_approval, approved, rejected
  raw_snippet TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_signals_status ON email_signals(status);

-- 19. Interview Preparation Packs Table
CREATE TABLE IF NOT EXISTS interview_preps (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'initial',
  content_json TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interview_preps_job ON interview_preps(job_id);

-- 20. Application Evidence & Document Versioning Table
CREATE TABLE IF NOT EXISTS application_evidence (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1, -- 1=Base, 2=Tailored, 3=Reviewed, 4=Submitted
  original_jd TEXT NOT NULL,
  job_url TEXT,
  base_resume_id TEXT,
  tailored_resume_text TEXT,
  tailored_resume_diff TEXT,
  cover_letter_text TEXT,
  ats_report_json TEXT NOT NULL DEFAULT '{}',
  reviewer_report_json TEXT NOT NULL DEFAULT '{}',
  submission_token TEXT,
  receipt_json TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_evidence_app ON application_evidence(application_id);

-- 21. System Metadata & Versioning Table
CREATE TABLE IF NOT EXISTS system_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);


