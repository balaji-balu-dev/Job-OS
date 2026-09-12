/**
 * Search Profiles & Templates Unit Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { SearchProfileRepository } from '../../db/repositories/SearchProfileRepository.js';
import { TemplateRepository } from '../../db/repositories/TemplateRepository.js';

test('SearchProfileRepository: Supports multi-profile management and active switching', () => {
  const profile = SearchProfileRepository.create({
    name: 'Lead AI Engineer — Bangalore',
    isActive: false,
    keywords: ['Python', 'PyTorch', 'LLMs'],
    salaryMin: 5000000
  });

  assert.ok(profile.id);
  assert.equal(profile.name, 'Lead AI Engineer — Bangalore');
  assert.equal(profile.isActive, false);

  // Activate it
  const activated = SearchProfileRepository.setActive(profile.id);
  assert.equal(activated.isActive, true);

  // Clean up
  SearchProfileRepository.delete(profile.id);
});

test('TemplateRepository: Manages custom templates with duplication and default flags', () => {
  const tmpl = TemplateRepository.create({
    name: 'Test Cover Letter',
    type: 'cover_letter',
    format: 'markdown',
    content: 'Dear {{COMPANY}} Team, I am interested in {{ROLE}}.',
    isDefault: false
  });

  assert.ok(tmpl.id);
  assert.equal(tmpl.type, 'cover_letter');

  const dup = TemplateRepository.duplicate(tmpl.id);
  assert.ok(dup.name.includes('(Copy)'));

  // Clean up
  TemplateRepository.delete(tmpl.id);
  TemplateRepository.delete(dup.id);
});
