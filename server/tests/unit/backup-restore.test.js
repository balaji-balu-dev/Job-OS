/**
 * Backup Service & Integrity Check Unit Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { BackupService } from '../../core/BackupService.js';

test('BackupService: Passes PRAGMA integrity and foreign key checks', () => {
  const check = BackupService.runIntegrityCheck();

  assert.equal(check.healthy, true);
  assert.equal(check.integrity, 'ok');
  assert.equal(check.foreignKeyViolations, 0);
});

test('BackupService: Creates verified WAL backup and exports encrypted archive', () => {
  const backup = BackupService.createBackup();

  assert.ok(backup.filename.startsWith('jobos_backup_'));
  assert.ok(backup.sizeBytes > 0);
  assert.equal(backup.integrity, 'ok');

  const encrypted = BackupService.exportEncryptedArchive('test-passphrase');
  assert.ok(encrypted);
  const parsed = JSON.parse(encrypted);
  assert.ok(parsed.iv);
  assert.ok(parsed.tag);
  assert.ok(parsed.data);
});
