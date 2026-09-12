/**
 * Reviewer Pipeline & ATS Verification Unit Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { IndependentReviewer } from '../../core/IndependentReviewer.js';
import { ATSVerifier } from '../../core/ATSVerifier.js';

test('IndependentReviewer: Tailors resume and passes independent auditor review', async () => {
  const mockJob = {
    title: 'Senior Backend Engineer',
    company: 'Razorpay',
    description: 'High throughput Java Kafka payment rails.'
  };

  const mockResume = {
    id: 'res-test-1',
    title: 'Senior Backend Resume',
    content: 'Balaji S. - Senior Backend Systems Architect with experience in Java, Kafka, PostgreSQL.'
  };

  const result = await IndependentReviewer.tailorAndReview({ job: mockJob, resume: mockResume });

  assert.equal(result.version, 3); // Reviewed
  assert.ok(result.tailoredResumeText.includes('Balaji S.'));
  assert.ok(result.reviewerReport.accuracyScore >= 90);
  assert.equal(result.reviewerReport.zeroFabricationConfirmed, true);
  assert.ok(result.diffSummary.length > 0);
});

test('ATSVerifier: Accurately validates headers, contact info, and keyword density', () => {
  const sampleResume = `# Balaji S.
balaji@example.com | +91-9876543210 | Bangalore, India

## PROFESSIONAL SUMMARY
Senior Backend Engineer with 6+ years experience.

## CORE SKILLS
Java, Spring Boot, Kafka, PostgreSQL, Redis, Docker, Kubernetes

## EXPERIENCE
Senior Engineer at Cashfree Payments. Built 10k TPS settlement rails.

## EDUCATION
B.Tech in Computer Science
`;

  const report = ATSVerifier.verifyATS(sampleResume, { skills: ['Java', 'Kafka', 'PostgreSQL'] });

  assert.ok(report.overallScore >= 85);
  assert.equal(report.checks.textExtraction, 'PASS');
  assert.equal(report.checks.contactDetails, 'PASS');
  assert.equal(report.checks.sectionDetection, 'PASS');
  assert.equal(report.checks.formatting, 'PASS');
  assert.equal(report.readiness, '🟢 EXCELLENT');
});
