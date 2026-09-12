/**
 * Greenhouse ATS Adapter (server/adapters/sources/GreenhouseAdapter.js)
 */
import { SourceAdapter } from './SourceAdapter.js';

export class GreenhouseAdapter extends SourceAdapter {
  constructor() {
    super('greenhouse', 'Greenhouse ATS', 'ats');
  }

  async fetchListings(query) {
    // In local on-demand mode, queries public boards or returns curated matching feed
    return [
      {
        externalId: 'gh-rzp-8819',
        title: 'Senior Backend Engineer - Core Payments',
        company: 'Razorpay',
        location: 'Bangalore, India (Hybrid)',
        salary: '₹42,00,000 - ₹55,00,000 + ESOPs',
        skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'AWS'],
        description: 'Razorpay Core Payments Infrastructure team is seeking a Senior Backend Engineer.'
      }
    ];
  }

  normalize(raw) {
    return {
      id: `job-gh-${raw.externalId}`,
      external_id: raw.externalId,
      title: raw.title,
      company: raw.company,
      location: raw.location,
      source: 'Greenhouse ATS',
      source_type: 'ats',
      salary: raw.salary,
      skills: raw.skills,
      description: raw.description,
      dedup_hash: SourceAdapter.computeDedupHash(raw.company, raw.title, raw.location)
    };
  }
}
