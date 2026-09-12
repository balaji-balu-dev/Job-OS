/**
 * Unit Test: Multi-Role Resume Management (server/tests/unit/resumes.test.js)
 */
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { ResumeRepository } from '../../db/repositories/ResumeRepository.js';
import { RESUMES_DIR } from '../../db/database.js';

test('Resumes: Lists initial seeded multi-role resumes', () => {
  const all = ResumeRepository.getAll();
  assert.ok(Array.isArray(all));
  assert.ok(all.length >= 3);

  const roles = all.map(r => r.roleCategory);
  assert.ok(roles.includes('Backend Developer'));
  assert.ok(roles.includes('Full Stack Developer'));
  assert.ok(roles.includes('Data/AI'));
});

test('Resumes: Creates, retrieves, and updates primary status', () => {
  const testId = `resume-unit-test-${Date.now()}`;
  const testFile = path.join(RESUMES_DIR, `${testId}.pdf`);
  fs.writeFileSync(testFile, '%PDF-1.4 Unit test resume file');

  const created = ResumeRepository.create({
    id: testId,
    title: 'Senior Frontend Engineer (v4.0)',
    roleCategory: 'Frontend Developer',
    filename: `${testId}.pdf`,
    originalName: 'Balaji_Frontend.pdf',
    filePath: testFile,
    fileSize: 42,
    mimeType: 'application/pdf',
    isPrimary: false
  });

  assert.ok(created);
  assert.strictEqual(created.title, 'Senior Frontend Engineer (v4.0)');
  assert.strictEqual(created.roleCategory, 'Frontend Developer');
  assert.strictEqual(created.isPrimary, false);

  // Set as primary
  const primary = ResumeRepository.setPrimary(testId);
  assert.strictEqual(primary.isPrimary, true);

  // Verify only one resume is marked primary
  const currentPrimary = ResumeRepository.getPrimary();
  assert.strictEqual(currentPrimary.id, testId);

  // Delete test resume
  const deleted = ResumeRepository.delete(testId);
  assert.strictEqual(deleted, true);
  assert.strictEqual(fs.existsSync(testFile), false);
  assert.strictEqual(ResumeRepository.getById(testId), null);
});

test('Resumes: Supports maintaining multiple resumes simultaneously for different roles', () => {
  const all = ResumeRepository.getAll();
  const byRoleBackend = ResumeRepository.getByRole('Backend Developer');
  const byRoleFullStack = ResumeRepository.getByRole('Full Stack Developer');
  const byRoleDataAI = ResumeRepository.getByRole('Data/AI');

  assert.ok(byRoleBackend.length >= 1);
  assert.ok(byRoleFullStack.length >= 1);
  assert.ok(byRoleDataAI.length >= 1);
});
