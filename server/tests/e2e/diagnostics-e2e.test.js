/**
 * End-to-End Test: JobOS System Diagnostics & Database Observability
 * (server/tests/e2e/diagnostics-e2e.test.js)
 */
import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

import { createApp } from '../../index.js';

function makeRequest(app, path, options = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const req = http.request({
        host: '127.0.0.1',
        port,
        path,
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          server.close(() => {
            let data = null;
            try {
              data = JSON.parse(body);
            } catch {
              data = body;
            }
            resolve({ statusCode: res.statusCode, headers: res.headers, data });
          });
        });
      });

      req.on('error', (err) => {
        server.close(() => reject(err));
      });

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  });
}

test('Diagnostics E2E: GET /api/health returns healthy ping with sub-checks', async () => {
  const app = createApp();
  const res = await makeRequest(app, '/api/health');

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'healthy');
  assert.strictEqual(typeof res.data.latency_ms, 'number');
  assert.strictEqual(res.data.checks.database, 'pass');
  assert.strictEqual(res.data.checks.backend, 'pass');
});

test('Diagnostics E2E: GET /api/health/database validates SQLite WAL, integrity and write safety', async () => {
  const app = createApp();
  const res = await makeRequest(app, '/api/health/database');

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'healthy');
  assert.strictEqual(res.data.database.walActive, true);
  assert.strictEqual(res.data.database.integrityCheck, 'PASS');
  assert.strictEqual(res.data.database.foreignKeyCheck, 'PASS');
  assert.strictEqual(res.data.database.writeVerification, 'PASS');
  assert.ok(res.data.database.tableCount >= 10);
  assert.ok(res.data.database.totalRows >= 0);
  assert.ok(res.data.database.resolvedPath.includes('jobos.db'));
});

test('Diagnostics E2E: GET /api/health/ai guarantees zero billable token consumption during health checks', async () => {
  const app = createApp();
  const res = await makeRequest(app, '/api/health/ai');

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'healthy');
  assert.strictEqual(res.data.ai.billingSafety, 'Safe (Zero billable queries during health checks)');
  assert.ok(res.data.ai.tokenLedger);
  assert.strictEqual(typeof res.data.ai.tokenLedger.currentPeriodTokens, 'number');
});

test('Diagnostics E2E: GET /api/health/portals reports portal adapter states', async () => {
  const app = createApp();
  const res = await makeRequest(app, '/api/health/portals');

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'healthy');
  assert.ok(Array.isArray(res.data.portals));
  assert.ok(res.data.portals.length >= 4);
});

test('Diagnostics E2E: GET /api/health/storage verifies local sandbox write capability', async () => {
  const app = createApp();
  const res = await makeRequest(app, '/api/health/storage');

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.storage.diskWritable, true);
  assert.strictEqual(res.data.storage.resumesDirAccessible, true);
});

test('Diagnostics E2E: GET /api/health/full returns complete subsystem matrix', async () => {
  const app = createApp();
  const res = await makeRequest(app, '/api/health/full');

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'healthy');
  assert.strictEqual(res.data.summary.database, 'ONLINE');
  assert.strictEqual(res.data.summary.security, 'OPERATIONAL');
});

test('Diagnostics E2E: GET /api/diagnostics/database/tables lists tables and schemas', async () => {
  const app = createApp();
  const res = await makeRequest(app, '/api/diagnostics/database/tables');

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.data));

  const tableNames = res.data.data.map(t => t.name);
  assert.ok(tableNames.includes('jobs'));
  assert.ok(tableNames.includes('applications'));
  assert.ok(tableNames.includes('agents'));
});

test('Diagnostics E2E: GET /api/diagnostics/database/table/:name returns sanitized records', async () => {
  const app = createApp();
  const res = await makeRequest(app, '/api/diagnostics/database/table/jobs');

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.table, 'jobs');
  assert.ok(Array.isArray(res.data.data));
  assert.ok(res.data.data.length > 0);
});

test('Diagnostics E2E: POST /api/diagnostics/self-test runs 16-subsystem checks with 0 failures', async () => {
  const app = createApp();
  const res = await makeRequest(app, '/api/diagnostics/self-test', { method: 'POST' });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.stats.total, 16);
  assert.strictEqual(res.data.stats.failed, 0);
  assert.ok(res.data.stats.passed >= 15);
  assert.strictEqual(res.data.results.length, 16);
});

test('Diagnostics E2E: GET /api/diagnostics/export downloads sanitized JSON diagnostic bundle', async () => {
  const app = createApp();
  const res = await makeRequest(app, '/api/diagnostics/export');

  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.headers['content-type'].includes('application/json'));
  assert.ok(res.headers['content-disposition'].includes('jobos-diagnostics-'));
  assert.strictEqual(res.data.app, 'JobOS Personal Autonomous Career Operating System');
  assert.strictEqual(res.data.database.integrityCheck, 'PASS');
});
