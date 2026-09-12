/**
 * Crypto Vault & PII Redactor (server/vault/crypto-vault.js)
 * Local-first AES-256-GCM secret encryption and telemetry PII sanitization
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KEY_FILE = path.resolve(__dirname, '../../data/.vault_key');

function getMasterKey() {
  if (process.env.JOBOS_VAULT_KEY) {
    return Buffer.from(process.env.JOBOS_VAULT_KEY, 'hex');
  }
  if (fs.existsSync(KEY_FILE)) {
    return Buffer.from(fs.readFileSync(KEY_FILE, 'utf-8'), 'hex');
  }
  // Generate and persist local key
  const newKey = crypto.randomBytes(32);
  const dataDir = path.dirname(KEY_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(KEY_FILE, newKey.toString('hex'), { mode: 0o600 });
  return newKey;
}

export class CryptoVault {
  static encrypt(plainText) {
    const key = getMasterKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: authTag
    };
  }

  static decrypt({ encrypted, iv, tag }) {
    const key = getMasterKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Redacts sensitive candidate PII from logs and safe activity streams
   */
  static sanitizeForLogs(text) {
    if (typeof text !== 'string') return text;
    return text
      .replace(/([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/g, '***@***.***')
      .replace(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{5}[-.\s]?\d{5})/g, '***-***-****')
      .replace(/bearer\s+[a-zA-Z0-9\-\._~\+\/]+=*/gi, 'Bearer [REDACTED]')
      .replace(/GATE-\d{4}/g, 'GATE-****');
  }
}
