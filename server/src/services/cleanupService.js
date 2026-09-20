import { db } from '../db/database.js';
import { storageService } from './storage/storageService.js';

export const cleanupService = {
  /**
   * Run cleanup for all expired or burned shares
   */
  async runCleanup() {
    const startTime = Date.now();
    try {
      const now = new Date().toISOString();

      // Find expired active shares
      const expiredRes = await db.query(`
        SELECT id, share_token, share_type 
        FROM shares 
        WHERE status = 'expired' 
           OR status = 'burned' 
           OR expires_at <= $1
      `, [now]);

      if (!expiredRes.rows || expiredRes.rows.length === 0) {
        return { success: true, cleanedCount: 0, durationMs: Date.now() - startTime };
      }

      console.log(`[Cleanup] Found ${expiredRes.rows.length} expired/burned shares to clean up.`);

      for (const share of expiredRes.rows) {
        if (share.share_type === 'files') {
          const filesRes = await db.query(`
            SELECT storage_key FROM shared_files WHERE share_id = $1
          `, [share.id]);

          if (filesRes.rows && filesRes.rows.length > 0) {
            const keys = filesRes.rows.map((f) => f.storage_key);
            await storageService.deleteFiles(keys).catch((e) => {
              console.warn(`[Cleanup] Storage deletion warning for share ${share.id}:`, e.message);
            });
          }
        }

        // Delete share record (cascades to shared_files)
        await db.query(`DELETE FROM shares WHERE id = $1`, [share.id]);
      }

      const durationMs = Date.now() - startTime;
      console.log(`[Cleanup] Successfully purged ${expiredRes.rows.length} shares in ${durationMs}ms.`);
      return { success: true, cleanedCount: expiredRes.rows.length, durationMs };
    } catch (err) {
      console.error('[Cleanup] Error during automated cleanup:', err.message);
      return { success: false, error: err.message, durationMs: Date.now() - startTime };
    }
  }
};
