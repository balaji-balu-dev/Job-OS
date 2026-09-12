/**
 * User AI Credentials Repository (server/db/repositories/AICredentialRepository.js)
 * Secure local storage of user-provided API keys with AES-256-GCM encryption at rest
 */
import { getDb } from '../database.js';
import { CryptoVault } from '../../vault/crypto-vault.js';

export class AICredentialRepository {
  /**
   * Generates a masked string for safe display (e.g. AIza••••••••••••34aZ)
   */
  static maskKey(rawKey) {
    if (!rawKey || typeof rawKey !== 'string') return '';
    const clean = rawKey.trim();
    if (clean.length <= 8) return '••••••••';
    const prefix = clean.slice(0, 4);
    const suffix = clean.slice(-4);
    const maskedLength = Math.max(8, Math.min(20, clean.length - 8));
    return `${prefix}${'•'.repeat(maskedLength)}${suffix}`;
  }

  /**
   * Retrieves active credential with decrypted key for authorized provider calls ONLY.
   * NEVER pass decrypted key to frontend or logs.
   */
  static getActiveCredential() {
    const db = getDb();
    const row = db.prepare('SELECT * FROM user_ai_credentials WHERE is_active = 1 LIMIT 1').get();
    if (!row) return null;

    try {
      const decryptedKey = CryptoVault.decrypt({
        encrypted: row.encrypted_key,
        iv: row.iv,
        tag: row.tag
      });

      return {
        id: row.id,
        provider: row.provider,
        apiKey: decryptedKey,
        maskedKey: row.masked_key,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (err) {
      console.error('[JobOS Security] Failed to decrypt user AI credential:', err.message);
      return null;
    }
  }

  /**
   * Retrieves safe metadata for frontend UI without exposing plaintext or ciphertext.
   */
  static getMasked() {
    const db = getDb();
    const row = db.prepare('SELECT * FROM user_ai_credentials WHERE is_active = 1 LIMIT 1').get();
    if (!row) {
      return {
        hasUserKey: false,
        provider: null,
        maskedKey: null,
        isActive: false
      };
    }

    return {
      hasUserKey: true,
      provider: row.provider,
      maskedKey: row.masked_key,
      isActive: Boolean(row.is_active),
      updatedAt: row.updated_at
    };
  }

  /**
   * Encrypts and stores user API key.
   */
  static saveCredential({ provider = 'gemini', apiKey }) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 6) {
      throw new Error('Invalid API key: key must be a valid non-empty string');
    }

    const cleanKey = apiKey.trim();
    const masked = this.maskKey(cleanKey);
    const encrypted = CryptoVault.encrypt(cleanKey);
    const now = Date.now();
    const id = `cred-${provider}-${now}`;

    const db = getDb();
    // Deactivate previous credentials
    db.prepare('UPDATE user_ai_credentials SET is_active = 0').run();

    db.prepare(`
      INSERT INTO user_ai_credentials (id, provider, encrypted_key, iv, tag, masked_key, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(id, provider, encrypted.encrypted, encrypted.iv, encrypted.tag, masked, now, now);

    return this.getMasked();
  }

  /**
   * Deletes/deactivates user credentials to fall back to system defaults.
   */
  static deleteCredential() {
    const db = getDb();
    db.prepare('DELETE FROM user_ai_credentials').run();
    return { hasUserKey: false, provider: null, maskedKey: null, isActive: false };
  }
}
