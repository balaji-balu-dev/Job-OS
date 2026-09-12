/**
 * Base Source Adapter (server/adapters/sources/SourceAdapter.js)
 * Standardized extensible interface for job discovery with retry/backoff, timeout safety, and multi-criteria deduplication
 */
import crypto from 'node:crypto';

export class SourceAdapter {
  constructor(id, name, sourceType, config = {}) {
    this.id = id;
    this.name = name;
    this.sourceType = sourceType; // ats, portal, aggregator, search, extension
    this.config = {
      timeoutMs: 10000,
      maxRetries: 3,
      baseBackoffMs: 1000,
      ...config
    };
  }

  /**
   * Main portal search pipeline: Search -> Parse -> Normalize -> Validate -> Deduplicate
   */
  async search(query = {}) {
    return this.withTimeout(
      this.retryWithBackoff(() => this._executeSearch(query)),
      this.config.timeoutMs
    );
  }

  async _executeSearch(query) {
    throw new Error(`_executeSearch not implemented for ${this.name}`);
  }

  normalize(raw) {
    throw new Error(`normalize not implemented for ${this.name}`);
  }

  validate(job) {
    if (!job.title || !job.company) {
      throw new Error(`Validation failed for job from ${this.name}: missing title or company`);
    }
    if (!job.dedup_hash) {
      job.dedup_hash = SourceAdapter.computeDedupHash(job.company, job.title, job.location, job.description);
    }
    return true;
  }

  /**
   * Multi-criteria composite deduplication hash
   */
  static computeDedupHash(company, title, location = '', description = '') {
    const norm = str => (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const descSnippet = (description || '').substring(0, 120).toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `${norm(company)}::${norm(title)}::${norm(location)}::${descSnippet}`;
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Exponential backoff with random jitter
   */
  async retryWithBackoff(fn, retries = this.config.maxRetries) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= retries) throw err;
        const delay = (Math.pow(2, attempt) * this.config.baseBackoffMs) + (Math.random() * 500);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  /**
   * Strict promise timeout
   */
  withTimeout(promise, ms = 10000) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms on adapter ${this.name}`));
      }, ms);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
  }
}
