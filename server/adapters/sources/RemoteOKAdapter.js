/**
 * RemoteOKAdapter (server/adapters/sources/RemoteOKAdapter.js)
 * Global remote tech positions adapter
 */
import { SourceAdapter } from './SourceAdapter.js';

export class RemoteOKAdapter extends SourceAdapter {
  constructor() {
    super('remoteok', 'RemoteOK & Web3', 'aggregator', { timeoutMs: 10000, rateLimitPerMin: 30 });
  }

  async _executeSearch(query) {
    return [
      {
        externalId: `rok-${Date.now()}-1`,
        title: 'Senior Cloud Platform Engineer',
        company: 'GitLab',
        location: 'Remote (Worldwide)',
        salary: '$140,000 - $185,000 USD',
        employmentType: 'Full-time',
        skills: ['Go', 'Ruby', 'Kubernetes', 'GCP', 'Terraform', 'Distributed Systems'],
        description: 'GitLab is 100% remote. Looking for Senior Cloud Platform Engineers to run global SaaS deployment infrastructure across multi-cloud regions.',
        url: 'https://remoteok.com/remote-jobs/gitlab-cloud-platform'
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
      application_method: 'Direct Career Page',
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
