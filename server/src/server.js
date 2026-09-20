import app from './app.js';
import { config } from './config/env.js';
import { runMigrations } from './db/migrations.js';
import { startCleanupJob } from './jobs/cleanupJob.js';

async function bootstrap() {
  try {
    // Run database migrations
    await runMigrations();

    // Start background cleanup scheduler in local development mode
    if (config.nodeEnv !== 'production') {
      startCleanupJob();
    }

    app.listen(config.port, () => {
      console.log(`========================================`);
      console.log(`  TempShare Backend Server is running!`);
      console.log(`  Port: ${config.port}`);
      console.log(`  Environment: ${config.nodeEnv}`);
      console.log(`  Storage Driver: ${config.storageDriver.toUpperCase()}`);
      console.log(`  Max File Size: ${config.maxFileSizeMb} MB`);
      console.log(`========================================`);
    });
  } catch (err) {
    console.error('Failed to start TempShare server:', err);
    process.exit(1);
  }
}

bootstrap();
