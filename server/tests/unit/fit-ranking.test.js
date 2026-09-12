/**
 * Fit Ranking & Deal-Breaker Detection Unit Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { FitRankingEngine } from '../../core/FitRankingEngine.js';

test('FitRankingEngine: Computes transparent 6-dimension fit score', () => {
  const mockJob = {
    title: 'Senior Backend Systems Architect',
    company: 'Razorpay',
    location: 'Bangalore, India (Hybrid)',
    skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Redis'],
    description: 'Seeking Senior Backend Systems Architect with 5+ years experience building low-latency payment rails in Java and Kafka.'
  };

  const result = FitRankingEngine.evaluate(mockJob);

  assert.ok(result.overallScore >= 75, `Expected score >= 75, got ${result.overallScore}`);
  assert.equal(result.priorityTier, 'HIGH_PRIORITY');
  assert.ok(result.fitBreakdown.skills >= 70);
  assert.ok(result.fitBreakdown.experience >= 80);
  assert.ok(result.fitBreakdown.location >= 80);
  assert.equal(result.dealBreakers.length, 0);
  assert.ok(result.matchReasons.length > 0);
});

test('FitRankingEngine: Flags explicit deal-breakers for excessive experience gap', () => {
  const impossibleJob = {
    title: 'Distinguished Fellow of Computing',
    company: 'Global Research Labs',
    location: 'Geneva, Switzerland (On-site required)',
    skills: ['Fortran 77', 'COBOL', 'Assembly'],
    description: 'Requires 18+ years experience in deep mainframe and aerospace telemetry. Relocation to Switzerland mandatory.'
  };

  const result = FitRankingEngine.evaluate(impossibleJob);

  assert.ok(result.dealBreakers.length >= 1, 'Expected at least 1 deal-breaker');
  assert.equal(result.priorityTier, 'LOW_MATCH');
  assert.ok(result.recommendation.includes('Deal Breakers Present'));
  assert.ok(result.concerns.length >= 1);
});
