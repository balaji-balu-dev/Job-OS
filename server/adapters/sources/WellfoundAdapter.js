/**
 * WellfoundAdapter (server/adapters/sources/WellfoundAdapter.js)
 * High-growth startup and Series A/B engineering listings
 */
import { SourceAdapter } from './SourceAdapter.js';

export class WellfoundAdapter extends SourceAdapter {
  constructor() {
    super('wellfound', 'Wellfound (AngelList)', 'portal', { timeoutMs: 10000, rateLimitPerMin: 20 });
  }

  async _executeSearch(query) {
    return [
      {
        externalId: `wf-${Date.now()}-1`,
        title: 'Founding Infrastructure Engineer',
        company: 'HyperScale AI',
        location: 'Remote (Worldwide)',
        salary: '₹50,00,000 - ₹75,00,000 + 1.2% Equity',
        employmentType: 'Full-time',
        skills: ['Python', 'Rust', 'Kubernetes', 'Ray', 'CUDA', 'AWS'],
        description: 'Join a fast-moving AI infrastructure company as Founding Engineer. Build distributed training clusters and model deployment pipelines.',
        url: 'https://wellfound.com/jobs/hyperscale-founding-infra'
      }
    ].map(item => this.normalize(item));
  }

  normalize(raw) {
    const norm = {
      id: `job-${this.id}-${raw.externalId}`,
      external_id: raw.externalId,
      title: raw.title,
      company: raw.company,
      location: raw.location,
      source: this.name,
      source_type: this.sourceType,
      salary: raw.salary,
      employment_type: raw.employmentType || 'Full-time',
      discovered_time: 'Just now',
      application_method: 'Wellfound 1-Click',
      difficulty: 'Easy',
      status: 'discovered',
      skills: raw.skills || [],
      description: raw.description || '',
      url: raw.url || ''
    };
    this.validate(norm);
    return norm;
  }
}
