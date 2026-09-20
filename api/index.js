import app from '../server/src/app.js';
import { runMigrations } from '../server/src/db/migrations.js';

let isMigrated = false;

export default async function handler(req, res) {
  // Ensure database tables are created on cold start
  if (!isMigrated) {
    try {
      await runMigrations();
      isMigrated = true;
    } catch (err) {
      console.error('[Vercel] Cold-start database migration warning:', err.message);
    }
  }

  // Forward request to Express app
  return app(req, res);
}
