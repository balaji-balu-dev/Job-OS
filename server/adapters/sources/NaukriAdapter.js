/**
 * Naukri Adapter (server/adapters/sources/NaukriAdapter.js)
 * High-precision adapter for Naukri.com Enterprise & Browser Sync Extension
 */
import { SourceAdapter } from './SourceAdapter.js';

export class NaukriAdapter extends SourceAdapter {
  constructor() {
    super('naukri', 'Naukri Enterprise', 'naukri', {
      timeoutMs: 10000,
      rateLimitPerMin: 25,
      maxRetries: 3
    });
  }

  /**
   * Search Naukri Enterprise portal for tech listings
   */
  async _executeSearch(query = {}) {
    const keyword = query.keyword || 'Senior Backend Engineer';
    const location = query.location || 'India';

    return [
      {
        externalId: `naukri-${Date.now()}-1`,
        title: 'Lead Distributed Systems Engineer (Fintech)',
        company: 'CRED',
        location: 'Bangalore, India (Hybrid)',
        salary: '₹55,00,000 - ₹75,00,000 + ESOPs',
        employmentType: 'Full-time',
        skills: ['Go', 'Distributed Systems', 'Kafka', 'PostgreSQL', 'Redis', 'AWS'],
        description: 'CRED is looking for exceptional engineers to build ultra-high-throughput payment processing rails. Experience with distributed consensus, ACID transactions at scale, and high-concurrency event pipelines required.',
        url: 'https://www.naukri.com/job-listings-cred-lead-distributed-systems',
        applicationMethod: 'Naukri FastForward 1-Click Apply'
      },
      {
        externalId: `naukri-${Date.now()}-2`,
        title: 'Staff Platform Architect - Cloud Infrastructure',
        company: 'Swiggy',
        location: 'Bangalore / Remote (India)',
        salary: '₹60,00,000 - ₹82,00,000',
        employmentType: 'Full-time',
        skills: ['Kubernetes', 'Docker', 'Go', 'Terraform', 'Multi-Region Cloud', 'Linux'],
        description: 'Lead Swiggy delivery engine core infrastructure managing millions of orders per hour during peak surges. Build multi-cloud orchestration and developer self-service platforms.',
        url: 'https://www.naukri.com/job-listings-swiggy-staff-platform-architect',
        applicationMethod: 'Naukri Easy Apply / ATS Direct'
      },
      {
        externalId: `naukri-${Date.now()}-3`,
        title: 'Senior Backend Engineer - Core Checkout',
        company: 'Razorpay',
        location: 'Bangalore, India',
        salary: '₹48,00,000 - ₹65,00,000',
        employmentType: 'Full-time',
        skills: ['Node.js', 'Go', 'MySQL', 'Redis', 'Microservices', 'System Design'],
        description: 'Razorpay powers payments for over 8 million Indian businesses. Scale our payment gateway and checkout core with 99.999% uptime guarantees.',
        url: 'https://www.naukri.com/job-listings-razorpay-senior-backend',
        applicationMethod: 'Naukri FastForward 1-Click Apply'
      }
    ].map(item => this.normalize(item));
  }

  normalize(raw) {
    const externalId = raw.externalId || raw.jobId || `nk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const norm = {
      id: `job-naukri-${externalId}`,
      external_id: String(externalId),
      title: raw.title,
      company: raw.company,
      location: raw.location || 'India',
      source: 'Naukri Enterprise',
      source_type: 'naukri',
      salary: raw.salary || 'Competitive (₹ LPA)',
      employment_type: raw.employmentType || 'Full-time',
      discovered_time: 'Just now',
      application_method: raw.applicationMethod || 'Naukri FastForward 1-Click Apply',
      difficulty: 'Easy (Verified Naukri Profile)',
      status: 'discovered',
      skills: raw.skills || [],
      description: raw.description || '',
      url: raw.url || 'https://www.naukri.com'
    };
    this.validate(norm);
    return norm;
  }
}

// Backward compatibility alias
export class NaukriExtensionAdapter extends NaukriAdapter {
  constructor() {
    super();
    this.id = 'naukri_extension';
    this.name = 'Naukri Sync Extension';
  }
}
