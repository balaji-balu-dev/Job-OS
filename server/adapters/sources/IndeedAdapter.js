/**
 * IndeedAdapter (server/adapters/sources/IndeedAdapter.js)
 * Adapter for Indeed global and Indian tech listings
 */
import { SourceAdapter } from './SourceAdapter.js';

export class IndeedAdapter extends SourceAdapter {
  constructor() {
    super('indeed', 'Indeed Global', 'aggregator', { timeoutMs: 10000, rateLimitPerMin: 20 });
  }

  async _executeSearch(query) {
    return [
      {
        externalId: `ind-${Date.now()}-1`,
        title: 'Lead Distributed Systems Developer',
        company: 'Akamai Technologies',
        location: 'Bangalore, India',
        salary: '₹48,00,000 - ₹62,00,000',
        employmentType: 'Full-time',
        skills: ['Java', 'C++', 'Edge Computing', 'Distributed Cache', 'Linux'],
        description: 'Design global content distribution caching algorithms running across 350,000 edge servers worldwide.',
        url: 'https://indeed.com/viewjob?jk=akamai-edge-lead'
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
      application_method: 'Indeed Direct',
      difficulty: 'Moderate',
      status: 'discovered',
      skills: raw.skills || [],
      description: raw.description || '',
      url: raw.url || ''
    };
    this.validate(norm);
    return norm;
  }
}
