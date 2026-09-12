/**
 * ==========================================================================
 * JobOS Reactive Data Store (js/store.js)
 * Central state for agents, jobs, applications, candidate profile, and events
 * ==========================================================================
 */

export const store = {
  // 1. Specialized AI Agents
  agents: [
    {
      id: 'orchestrator',
      name: 'Orchestrator',
      nickname: 'Chief',
      breed: 'Golden Retriever',
      role: 'Office Boss & Coordination',
      state: 'working', // idle | working | searching | thinking | waiting | success | error | attention
      color: '#6366f1',
      currentTask: 'Coordinating submission approvals & dispatching Scout to Greenhouse feeds',
      progress: 68,
      queueCount: 4,
      lastActivity: '12s ago',
      details: {
        uptime: '4d 18h',
        processedToday: 42,
        blockedOnUser: 2,
        log: [
          'Assigned Stripe Backend application to Verification Agent',
          'Dispatched Scout to crawl Stripe & Datadog career portals',
          'Awaiting user sign-off on Razorpay application gate'
        ]
      }
    },
    {
      id: 'scout',
      name: 'Scout',
      nickname: 'Tracker',
      breed: 'Beagle',
      role: 'Job Discovery & Crawling',
      state: 'searching',
      color: '#06b6d4',
      currentTask: 'Crawling Ashby & Greenhouse ATS feeds for Senior Backend roles',
      progress: 82,
      queueCount: 14,
      lastActivity: '3s ago',
      details: {
        sourcesActive: ['Greenhouse API', 'Lever', 'Naukri Sync', 'Workday'],
        discoveredToday: 18,
        matchRate: '78%',
        log: [
          'Detected new listing: Staff Systems Engineer @ Cloudflare',
          'Extracted 12 requirement vectors from Razorpay JD',
          'Synced 4 listings from Naukri extension queue'
        ]
      }
    },
    {
      id: 'job-intelligence',
      name: 'Job Intelligence',
      nickname: 'Sage',
      breed: 'Corgi',
      role: 'JD Analysis & Match Scoring',
      state: 'thinking',
      color: '#f59e0b',
      currentTask: 'Vector matching candidate profile against Stripe Staff Platform JD',
      progress: 45,
      queueCount: 3,
      lastActivity: '28s ago',
      details: {
        analyzedToday: 15,
        avgMatchScore: 88,
        riskDetections: 2,
        log: [
          'Flagged missing requirement: 2+ yrs Go experience (Profile has Java/Rust)',
          'Calculated 94% match for Razorpay Senior Backend',
          'Extracted salary band: ₹42L - ₹55L + ESOPs'
        ]
      }
    },
    {
      id: 'application-agent',
      name: 'Application Agent',
      nickname: 'Quill',
      breed: 'Shiba Inu',
      role: 'Form Fill & Tailoring',
      state: 'working',
      color: '#10b981',
      currentTask: 'Drafting behavioral answers for Razorpay application form',
      progress: 90,
      queueCount: 2,
      lastActivity: '1m ago',
      details: {
        preparedToday: 6,
        confidenceAvg: '97.4%',
        zeroHallucinationCheck: 'Passed',
        log: [
          'Derived answer for "Distributed systems challenge" citing Project Chronos',
          'Mapped candidate work authorization (India Citizen) to ATS field',
          'Ready for Verification Agent sign-off'
        ]
      }
    },
    {
      id: 'tracking-agent',
      name: 'Tracking Agent',
      nickname: 'Radar',
      breed: 'Husky',
      role: 'Pipeline, Status & Recruiter Sync',
      state: 'waiting',
      color: '#3b82f6',
      currentTask: 'Monitoring email inbox and ATS portals for interview invites',
      progress: 100,
      queueCount: 0,
      lastActivity: '4m ago',
      details: {
        activeApplications: 24,
        interviewsTracked: 3,
        responsesDetected: 8,
        log: [
          'Parsed interview invite from Datadog recruiter (Sarah Miller)',
          'Moved Datadog application to "Interview" stage',
          'Logged follow-up due in 2 days for Atlassian'
        ]
      }
    },
    {
      id: 'email-agent',
      name: 'Email Agent',
      nickname: 'Courier',
      breed: 'Dachshund',
      role: 'Recruiter Communications',
      state: 'attention',
      color: '#f97316',
      currentTask: 'Awaiting user approval to dispatch recruiter thank-you note',
      progress: 100,
      queueCount: 1,
      lastActivity: '6m ago',
      details: {
        draftsPending: 1,
        emailsSentTotal: 14,
        userApprovedOnly: true,
        log: [
          'Drafted interview confirmation email to Datadog Recruiting Team',
          'Enforced safety gate: Email will NOT send without user click',
          'Held in "Needs Your Attention" dock'
        ]
      }
    },
    {
      id: 'verification-agent',
      name: 'Verification Agent',
      nickname: 'Sentry',
      breed: 'French Bulldog',
      role: 'Pre-Submission Audit & Gatekeeper',
      state: 'working',
      color: '#ec4899',
      currentTask: 'Auditing Razorpay application: verifying 14/14 field citations',
      progress: 95,
      queueCount: 2,
      lastActivity: '45s ago',
      details: {
        verifiedToday: 5,
        hallucinationAttemptsCaught: 0,
        gatePassed: true,
        log: [
          'Confirmed all 14 form answers trace directly to candidate profile',
          'Verified no exaggerated claims or invented facts',
          'Ready to release submission gate lock'
        ]
      }
    }
  ],

  // 2. High-Priority "Needs Your Attention" Items
  attentionItems: [
    {
      id: 'att-1',
      type: 'submission_approval',
      urgency: 'high',
      title: 'Razorpay — Senior Backend Engineer',
      description: 'Application prepared (14/14 fields verified). Verification Agent gave 100% compliance seal. Requires your final sign-off before transmission.',
      agent: 'verification-agent',
      timeElapsed: '12m ago',
      actionLabel: 'Review & Submit Gate',
      targetView: 'submission-gate',
      targetId: 'app-razorpay'
    },
    {
      id: 'att-2',
      type: 'email_approval',
      urgency: 'medium',
      title: 'Datadog — Recruiter Interview Confirmation',
      description: 'Email Agent drafted a personalized confirmation for Technical Screening with Sarah Miller (Lead Recruiter). Never sent automatically.',
      agent: 'email-agent',
      timeElapsed: '24m ago',
      actionLabel: 'Review Draft Email',
      targetView: 'interviews',
      targetId: 'int-datadog'
    },
    {
      id: 'att-3',
      type: 'answer_dispute',
      urgency: 'high',
      title: 'Stripe — Staff Platform Engineer Question',
      description: 'Question asks: "Describe experience with Ruby on Rails internals". Agent flagged "NEEDS REVIEW" because profile only lists Java/Go.',
      agent: 'job-intelligence',
      timeElapsed: '1h ago',
      actionLabel: 'Review Ambiguous Answer',
      targetView: 'app-review',
      targetId: 'app-stripe'
    },
    {
      id: 'att-4',
      type: 'interview_invitation',
      urgency: 'high',
      title: 'Postman — System Design Round Scheduled',
      description: 'Tracking Agent parsed calendar invite for Round 2: Architecture & Scalability on Friday, 3:30 PM IST.',
      agent: 'tracking-agent',
      timeElapsed: '2h ago',
      actionLabel: 'View Briefing & Prep',
      targetView: 'interviews',
      targetId: 'int-postman'
    }
  ],

  // 3. Discovered Jobs
  jobs: [
    {
      id: 'job-razorpay',
      title: 'Senior Backend Engineer - Core Payments',
      company: 'Razorpay',
      location: 'Bangalore, India (Hybrid)',
      source: 'Greenhouse ATS',
      sourceType: 'ats',
      matchScore: 94,
      salary: '₹42,00,000 - ₹55,00,000 + ESOPs',
      employmentType: 'Full-time',
      discoveredTime: '2 hours ago',
      applicationMethod: 'Direct ATS Integration',
      difficulty: 'Moderate (3 custom questions)',
      status: 'ready_to_submit',
      matchReasons: [
        'Matches primary mission: "Senior Backend India"',
        'Extensive 6+ yrs Java / Spring Boot & Distributed Architecture alignment',
        'Demonstrated payment gateway/ledger transaction experience from previous role'
      ],
      concerns: [
        'Hybrid requirement (2 days in Bangalore office)'
      ],
      skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'AWS', 'Redis', 'Microservices'],
      description: `Razorpay is seeking a Senior Backend Engineer to join our Core Payments Infrastructure team. You will architect high-throughput, low-latency financial rails handling over 10,000 transactions per second with 99.999% reliability.

Key Responsibilities:
- Design fault-tolerant transaction processing pipelines.
- Scale relational and event-driven data stores (PostgreSQL, Kafka).
- Collaborate with product and risk teams to prevent fraud.

Requirements:
- 5+ years building distributed backend systems in Java/Go.
- Deep expertise in database concurrency and ACID transactions.
- Strong fundamentals in system design and cloud deployment.`
    },
    {
      id: 'job-stripe',
      title: 'Staff Platform Engineer',
      company: 'Stripe',
      location: 'Remote (India)',
      source: 'Stripe Careers Page',
      sourceType: 'career_page',
      matchScore: 89,
      salary: '₹65,00,000 - ₹82,00,000 + RSUs',
      employmentType: 'Full-time',
      discoveredTime: '5 hours ago',
      applicationMethod: 'Custom Career Portal',
      difficulty: 'High (4 architectural essays)',
      status: 'in_review',
      matchReasons: [
        'Exceptional match for Kubernetes, Cloud infrastructure & developer tooling',
        'Strong background in platform engineering and service mesh architectures'
      ],
      concerns: [
        'Mention of Ruby/Sorbet codebase internals; candidate has Java/Rust/Go experience'
      ],
      skills: ['Go', 'Kubernetes', 'AWS', 'Docker', 'Distributed Tracing', 'Terraform'],
      description: `Stripe build tools and platforms power millions of global businesses. We are looking for a Staff Platform Engineer to elevate developer velocity and infrastructure resiliency across our global fleet.`
    },
    {
      id: 'job-datadog',
      title: 'Senior Software Engineer - Distributed Systems',
      company: 'Datadog',
      location: 'Bangalore / Remote',
      source: 'Search Discovery',
      sourceType: 'search',
      matchScore: 92,
      salary: '₹48,00,000 - ₹62,00,000',
      employmentType: 'Full-time',
      discoveredTime: 'Yesterday',
      applicationMethod: 'Lever ATS',
      difficulty: 'Low',
      status: 'interview',
      matchReasons: [
        'Direct telemetry & observability pipeline background',
        'Kafka partition tuning and time-series database optimizations match exactly'
      ],
      concerns: [],
      skills: ['Go', 'Kafka', 'Cassandra', 'Time Series DB', 'Linux Internals'],
      description: `Join Datadog's ingest pipeline team. We process trillions of data points every day from servers and cloud workloads around the world.`
    },
    {
      id: 'job-postman',
      title: 'Lead Engineer - API Platform',
      company: 'Postman',
      location: 'Bangalore / Remote',
      source: 'Naukri Sync Extension',
      sourceType: 'naukri',
      matchScore: 88,
      salary: '₹50,00,000 - ₹65,00,000',
      employmentType: 'Full-time',
      discoveredTime: '2 days ago',
      applicationMethod: 'Direct Extension Submit',
      difficulty: 'Low',
      status: 'interview',
      matchReasons: [
        'Strong API design principles and Developer Experience focus',
        'Extensive node/microservices ecosystem leadership'
      ],
      concerns: [],
      skills: ['Node.js', 'TypeScript', 'Kubernetes', 'API Gateway', 'GraphQL'],
      description: `Postman is looking for a Lead Engineer to scale the core collaboration engine used by 30 million developers.`
    },
    {
      id: 'job-atlassian',
      title: 'Senior Backend Developer - Jira Cloud',
      company: 'Atlassian',
      location: 'Remote (India)',
      source: 'Workday Portal',
      sourceType: 'workday',
      matchScore: 85,
      salary: '₹45,00,000 - ₹58,00,000',
      employmentType: 'Full-time',
      discoveredTime: '3 days ago',
      applicationMethod: 'Workday Browser Automation',
      difficulty: 'High (Multi-step Workday form)',
      status: 'submitted',
      matchReasons: [
        'Microservices decomposition track record matches Jira Cloud migration initiatives'
      ],
      concerns: ['Slow recruiter response average (14 days)'],
      skills: ['Java', 'Spring Cloud', 'AWS DynamoDB', 'Docker'],
      description: `Help Atlassian scale Jira Cloud to enterprise customers supporting 50,000+ seat organizations.`
    }
  ],

  // 4. Detailed Application in Review & Gate (Razorpay)
  currentApplication: {
    id: 'app-razorpay',
    jobId: 'job-razorpay',
    company: 'Razorpay',
    role: 'Senior Backend Engineer - Core Payments',
    matchScore: 94,
    status: 'Ready for Final Submission Gate',
    verificationScore: '100% (14/14 fields confirmed)',
    preflightChecks: [
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
  },

  // 5. Candidate Profile (16 Structured Sections with Verification Flags)
  candidateProfile: {
    identity: {
      fullName: { value: 'Balaji S.', status: 'USER VERIFIED' },
      preferredName: { value: 'Balaji', status: 'USER VERIFIED' },
      pronouns: { value: 'He/Him', status: 'USER VERIFIED' },
      citizenship: { value: 'Citizen of India', status: 'USER VERIFIED' }
    },
    contact: {
      email: { value: 'balaji.dev@example.com', status: 'USER VERIFIED' },
      phone: { value: '+91 98765 43210', status: 'USER VERIFIED' },
      linkedin: { value: 'https://linkedin.com/in/balaji-dev', status: 'USER VERIFIED' },
      github: { value: 'https://github.com/balaji-dev', status: 'USER VERIFIED' }
    },
    location: {
      currentCity: { value: 'Bangalore, Karnataka, India', status: 'USER VERIFIED' },
      openToRelocation: { value: 'Yes (Hyderabad, Pune, Remote)', status: 'USER VERIFIED' },
      workModelPreference: { value: 'Remote or Hybrid (1-2 days)', status: 'USER VERIFIED' }
    },
    workAuthorization: {
      indiaCitizen: { value: 'Yes', status: 'USER VERIFIED' },
      usVisaStatus: { value: 'None (Requires sponsorship for US roles)', status: 'USER VERIFIED' },
      euVisaStatus: { value: 'None', status: 'USER VERIFIED' }
    },
    employment: [
      {
        company: 'Apex Cloud Systems',
        title: 'Senior Backend Engineer',
        period: '2022 - Present (3 yrs)',
        status: 'USER VERIFIED',
        highlights: 'Architected distributed event-driven payment rails in Java and Go handling 10k RPS.'
      },
      {
        company: 'Veloce Data Labs',
        title: 'Software Engineer II',
        period: '2019 - 2022 (3 yrs)',
        status: 'USER VERIFIED',
        highlights: 'Scaled Redis caching layers and GraphQL federation gateways for microservices.'
      }
    ],
    education: {
      degree: { value: 'Bachelor of Technology in Computer Science', status: 'USER VERIFIED' },
      institution: { value: 'National Institute of Technology', status: 'USER VERIFIED' },
      year: { value: '2019', status: 'USER VERIFIED' }
    },
    skills: {
      languages: { value: 'Java, Go, TypeScript, SQL, Rust (Foundational)', status: 'USER VERIFIED' },
      frameworks: { value: 'Spring Boot, Quarkus, Node.js, Express', status: 'USER VERIFIED' },
      databases: { value: 'PostgreSQL, DynamoDB, Redis, Cassandra', status: 'USER VERIFIED' },
      messaging: { value: 'Apache Kafka, RabbitMQ, AWS SQS', status: 'USER VERIFIED' },
      cloudDevops: { value: 'AWS, Kubernetes, Docker, Terraform, Prometheus', status: 'USER VERIFIED' }
    },
    projects: [
      {
        name: 'Project Chronos (Distributed Ledger)',
        tech: 'Java 21, Kafka, PostgreSQL, Docker',
        impact: 'Zero-data-loss audit transaction engine processing 4M records daily.',
        status: 'USER VERIFIED'
      }
    ],
    certifications: [
      { name: 'AWS Certified Solutions Architect – Associate', status: 'USER VERIFIED', date: '2023' }
    ],
    achievements: [
      { name: 'Engineering Excellence Award 2024 for 99.999% SLA during peak sale', status: 'USER VERIFIED' }
    ],
    salary: {
      currentCTC: { value: '₹36,00,000 Fixed', status: 'USER VERIFIED' },
      expectedCTC: { value: '₹48,00,000 - ₹55,00,000 + Equity', status: 'USER VERIFIED' },
      minimumAcceptable: { value: '₹44,00,000', status: 'USER VERIFIED' }
    },
    noticePeriod: {
      official: { value: '30 Days', status: 'USER VERIFIED' },
      negotiableDays: { value: '15 Days with buyout', status: 'USER VERIFIED' },
      lastWorkingDay: { value: 'Not initiated (Employed)', status: 'USER VERIFIED' }
    },
    preferences: {
      targetRoles: { value: 'Senior Backend Engineer, Staff Platform Engineer, Systems Architect', status: 'USER VERIFIED' },
      companyStages: { value: 'Series B, Series C, Enterprise Tech, High-Growth SaaS', status: 'USER VERIFIED' },
      domainsAvoid: { value: 'Gambling, Aggressive Crypto speculation', status: 'USER VERIFIED' }
    },
    portfolio: {
      personalSite: { value: 'https://balaji-systems.dev', status: 'USER VERIFIED' },
      blogPosts: { value: 'Deep-dive into Kafka Consumer Rebalancing Strategies', status: 'USER VERIFIED' }
    },
    resumeVersions: [
      { version: 'v3.2 - Backend & Distributed Systems (Primary)', size: '142 KB', date: 'Active' },
      { version: 'v3.1 - Platform & Cloud Infrastructure', size: '138 KB', date: 'Secondary' }
    ],
    approvedAnswers: [
      { key: 'distributed_systems_challenge', value: 'Describes Kafka partition storm resolution on Black Friday', status: 'USER VERIFIED' },
      { key: 'willingness_to_relocate', value: 'Willing to relocate to Bangalore or Hyderabad', status: 'USER VERIFIED' }
    ]
  },

  // 6. Application Pipeline Tracker (11 Stages)
  pipelineStages: [
    { id: 'discovered', label: 'Discovered', count: 18 },
    { id: 'shortlisted', label: 'Shortlisted', count: 8 },
    { id: 'approved', label: 'Approved', count: 4 },
    { id: 'preparing', label: 'Preparing', count: 2 },
    { id: 'ready', label: 'Ready', count: 1 },
    { id: 'submitted', label: 'Submitted', count: 14 },
    { id: 'screening', label: 'Screening', count: 5 },
    { id: 'interview', label: 'Interview', count: 3 },
    { id: 'offer', label: 'Offer', count: 1 },
    { id: 'rejected', label: 'Rejected', count: 6 },
    { id: 'withdrawn', label: 'Withdrawn', count: 2 }
  ],

  // 7. Missions (Reusable Job-Search Campaigns)
  missions: [
    {
      id: 'mission-backend-india',
      name: 'Senior Backend India',
      status: 'active',
      schedule: 'Every 2 hours',
      titles: ['Senior Backend Engineer', 'Staff Backend Engineer', 'Backend Developer', 'Principal Engineer'],
      locations: ['India', 'Bangalore', 'Hyderabad', 'Remote'],
      skills: ['Java', 'Spring Boot', 'AWS', 'Kubernetes', 'Kafka', 'Go'],
      minMatchScore: 80,
      applicationsSubmitted: 14,
      interviewsGenerated: 3,
      lastRun: '18 minutes ago'
    },
    {
      id: 'mission-platform-remote',
      name: 'Global Platform & Cloud Remote',
      status: 'active',
      schedule: 'Every 4 hours',
      titles: ['Platform Engineer', 'Site Reliability Engineer', 'Cloud Architect'],
      locations: ['Remote Global', 'Remote APAC', 'Remote India'],
      skills: ['Kubernetes', 'Terraform', 'Go', 'Prometheus', 'AWS'],
      minMatchScore: 85,
      applicationsSubmitted: 6,
      interviewsGenerated: 1,
      lastRun: '1 hour ago'
    }
  ],

  // 8. Upcoming Interviews
  interviews: [
    {
      id: 'int-datadog',
      company: 'Datadog',
      role: 'Senior Software Engineer - Distributed Systems',
      date: 'Tomorrow, 4:00 PM - 4:45 PM IST',
      type: 'Technical Recruiter Screening',
      interviewer: 'Sarah Miller (Senior Technical Recruiter)',
      prepStatus: 'Prepared (Briefing Ready)',
      companyBriefing: 'Datadog processes 10+ trillion events daily. Highly evaluates candidates on concurrency primitives and operational grit under failure.',
      likelyQuestions: [
        'Walk through your experience with Kafka consumer lag and rebalance tuning.',
        'Why are you looking to leave your current role at Apex Cloud Systems?',
        'How do you manage database sharding tradeoffs versus read-replicas?'
      ],
      candidatePrep: [
        'Review Project Chronos architecture metrics: 10,000 RPS, sub-100ms p99.',
        'Highlight experience mentoring 4 engineers on distributed tracing.'
      ],
      questionsToAsk: [
        'What are the primary operational bottlenecks the ingest team is solving this quarter?',
        'How does Datadog balance open-source contributions with proprietary cloud engines?'
      ]
    },
    {
      id: 'int-postman',
      company: 'Postman',
      role: 'Lead Engineer - API Platform',
      date: 'Friday, 3:30 PM - 5:00 PM IST',
      type: 'System Design & Architecture Round',
      interviewer: 'Arjun Rao (Director of Engineering)',
      prepStatus: 'Briefing in progress',
      companyBriefing: 'Postman serves 30M developers. Focus is on distributed caching, API rate-limiting algorithms, and resilient schema registries.',
      likelyQuestions: [
        'Design a globally distributed rate-limiting service handling 1M requests/sec.',
        'Compare Token Bucket versus Leaky Bucket algorithms under spiky traffic.',
        'How do you handle schema versioning without breaking API clients?'
      ],
      candidatePrep: [
        'Brush up on Redis sliding window rate-limiter design.',
        'Prepare clean ASCII/whiteboard diagram for multi-region Redis replication.'
      ],
      questionsToAsk: [
        'How does the team handle backward compatibility with enterprise self-hosted Postman clusters?'
      ]
    }
  ],

  // 9. Chronological Audit Timeline Log
  auditTimeline: [
    {
      id: 'time-1',
      time: '10:45 AM',
      title: 'Verification Agent Passed Razorpay Application',
      agent: 'verification-agent',
      type: 'verification',
      details: 'All 14 fields corroborated against candidate profile. 0 hallucinations detected. Gate lock engaged awaiting human signature.'
    },
    {
      id: 'time-2',
      time: '10:20 AM',
      title: 'Application Agent Finished Drafting Razorpay Answers',
      agent: 'application-agent',
      type: 'application',
      details: 'Drafted responses using verified facts from Project Chronos and Incident Post-Mortem 2024.'
    },
    {
      id: 'time-3',
      time: '09:40 AM',
      title: 'User Approved Razorpay Shortlist',
      agent: 'orchestrator',
      type: 'approval',
      details: 'User tapped "Approve for Application Preparation" on Dashboard.'
    },
    {
      id: 'time-4',
      time: '09:12 AM',
      title: 'Job Intelligence Analyzed Razorpay Core Payments JD',
      agent: 'job-intelligence',
      type: 'intelligence',
      details: 'Calculated 94% match score. Identified strong Java/Spring Boot & Kafka alignment.'
    },
    {
      id: 'time-5',
      time: '08:50 AM',
      title: 'Scout Discovered Listing via Greenhouse Crawler',
      agent: 'scout',
      type: 'scout',
      details: 'Discovered requisition #94821 on Razorpay career board. Pushed to analysis queue.'
    }
  ],

  // 10. Autonomous & Security Settings
  settings: {
    agentControls: {
      autoDiscovery: true,
      autoAnalysis: true,
      autoFill: true,
      browserAutomation: true,
      emailDrafting: true,
      requireHumanApprovalForSubmission: true, // NEVER submit without user click!
      requireHumanApprovalForEmail: true      // NEVER email without user click!
    },
    security: {
      credentialVaultStatus: 'Locked & Encrypted (AES-256 GCM)',
      connectedServices: ['Greenhouse API (Active)', 'Lever Connect (Active)', 'Naukri Sync v2.4 (Active)'],
      browserProfile: 'Isolated Headless Chrome Profile (Anti-Detection)',
      localDataStore: 'C:\\Users\\balaj\\Antigravity Projects\\Job OS\\.agents\\data',
      encryptionStatus: 'Active & Verified'
    }
  },

  // 11. Live AI Token Usage & Protection State
  aiUsage: {
    status: 'ACTIVE',
    tokensUsed: 6320,
    promptTokens: 5080,
    completionTokens: 1240,
    tokenLimit: 100000,
    remainingTokens: 93680,
    usagePercentage: 6.3,
    estimatedCostUsd: 0.000752,
    periodType: 'MONTHLY',
    resetsIn: '18d 23h',
    isManuallyPaused: false,
    isAutoPaused: false,
    warningThresholdPct: 80.0,
    hardStopThresholdPct: 100.0,
    costLimitUsd: 5.00,
    ledger: []
  },

  // 12. Multi-Role Resumes
  resumes: [],

  // 13. User AI Credentials (Masked)
  userAICredentials: null
};

/**
 * Synchronize store with SQLite backend
 */
export async function syncWithBackend() {
  try {
    const [agentsRes, jobsRes, profileRes, attentionRes, aiUsageRes, resumesRes, credsRes, appsRes, tmplsRes, missionsRes] = await Promise.all([
      fetch('/api/agents').then(r => r.json()).catch(() => null),
      fetch('/api/jobs').then(r => r.json()).catch(() => null),
      fetch('/api/profile').then(r => r.json()).catch(() => null),
      fetch('/api/attention').then(r => r.json()).catch(() => null),
      fetch('/api/ai-usage').then(r => r.json()).catch(() => null),
      fetch('/api/resumes').then(r => r.json()).catch(() => null),
      fetch('/api/settings/ai-credentials').then(r => r.json()).catch(() => null),
      fetch('/api/applications').then(r => r.json()).catch(() => null),
      fetch('/api/templates').then(r => r.json()).catch(() => null),
      fetch('/api/missions').then(r => r.json()).catch(() => null)
    ]);

    if (agentsRes?.success && Array.isArray(agentsRes.data)) {
      store.agents = agentsRes.data;
    }
    if (jobsRes?.success && Array.isArray(jobsRes.data)) {
      store.jobs = jobsRes.data;
    }
    if (appsRes?.success && Array.isArray(appsRes.data)) {
      store.applications = appsRes.data;
      store.currentApplication = appsRes.data[0] || null;
    }
    if (tmplsRes?.success && Array.isArray(tmplsRes.data)) {
      store.templates = tmplsRes.data;
    }
    if (missionsRes?.success && Array.isArray(missionsRes.data)) {
      store.missions = missionsRes.data;
    }
    if (profileRes?.success) {
      if (!profileRes.data || Object.keys(profileRes.data).length === 0) {
        store.candidateProfile = {};
      } else {
        for (const [key, section] of Object.entries(profileRes.data)) {
          if (!store.candidateProfile[key]) {
            store.candidateProfile[key] = section.data;
            continue;
          }

          // If array (employment, projects, etc.)
          if (Array.isArray(section.data)) {
            store.candidateProfile[key] = section.data;
          } else if (typeof section.data === 'object' && section.data !== null) {
            // Merge field by field preserving { value, status } where present
            for (const [fKey, fVal] of Object.entries(section.data)) {
              if (store.candidateProfile[key][fKey] && typeof store.candidateProfile[key][fKey] === 'object') {
                if (typeof fVal === 'object' && fVal !== null && fVal.value !== undefined) {
                  store.candidateProfile[key][fKey] = fVal;
                } else {
                  store.candidateProfile[key][fKey].value = fVal;
                }
              } else {
                store.candidateProfile[key][fKey] = { value: fVal, status: section.provenance || 'USER VERIFIED' };
              }
            }
          }
        }
      }
    }
    if (attentionRes?.success && Array.isArray(attentionRes.data)) {
      store.attentionItems = attentionRes.data;
    }
    if (aiUsageRes?.success && aiUsageRes.data) {
      store.aiUsage = aiUsageRes.data;
    }
    if (resumesRes?.success && Array.isArray(resumesRes.data)) {
      store.resumes = resumesRes.data;
    }
    if (credsRes?.success) {
      store.userAICredentials = credsRes.data || null;
    }
    return true;
  } catch (e) {
    console.warn('[JobOS] Backend sync unavailable, using memory store fallback:', e);
    return false;
  }
}
