/**
 * JobOS Production Server (server.js)
 * Modular monolith with SQLite + WAL, REST API, SSE live telemetry, and static frontend
 */
import 'dotenv/config';
import { createApp } from './server/index.js';
import { closeDb } from './server/db/database.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const app = createApp();

const server = app.listen(PORT, HOST, () => {
  console.log(`[JobOS] Autonomous Command Center running at http://codevampires.local:${PORT} (or http://localhost:${PORT})`);
  console.log(`[JobOS] Storage Engine: SQLite (WAL mode) enabled at data/jobos.db`);
  console.log(`[JobOS] Live Telemetry SSE stream: http://localhost:${PORT}/api/telemetry/stream`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n[JobOS] Received ${signal}. Gracefully closing connections...`);
  server.close(() => {
    closeDb();
    console.log('[JobOS] SQLite closed safely. Shutdown complete.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
