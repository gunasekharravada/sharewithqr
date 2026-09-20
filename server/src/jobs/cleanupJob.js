import cron from 'node-cron';
import { cleanupService } from '../services/cleanupService.js';
import { config } from '../config/env.js';

export function startCleanupJob() {
  console.log(`[Job] Initializing background cleanup scheduler with cron: "${config.cleanupCronSchedule}"`);

  // Run immediately on boot
  cleanupService.runCleanup();

  // Schedule regular runs
  cron.schedule(config.cleanupCronSchedule, async () => {
    await cleanupService.runCleanup();
  });
}
