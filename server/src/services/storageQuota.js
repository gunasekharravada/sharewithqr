/**
 * Storage safe-limit protection + per-file size check.
 *
 * Usage is computed from the existing shared_files.file_size metadata
 * (no separate accounting table). A share's file rows are inserted as a
 * "reservation" inside the same locked transaction that checks capacity,
 * BEFORE any bytes are sent to storage, so concurrent uploads cannot each
 * pass the check against the same free space.
 *
 * - PostgreSQL: transaction-level advisory lock (works across multiple
 *   Vercel/serverless instances; released automatically on COMMIT/ROLLBACK).
 * - SQLite (local dev fallback): single process, so calls are serialized
 *   with an in-process queue.
 *
 * Dependencies are injected so the logic can be unit-tested without a
 * real database (see test/storageQuota.test.js).
 */

const MB = 1024 * 1024;

// Arbitrary constant key for pg_advisory_xact_lock (same value for every
// instance so they all contend for the same lock).
const STORAGE_LOCK_KEY = 727401;

const DEFAULT_LIMIT_MB = 1024;
const DEFAULT_SAFE_LIMIT_MB = 900;

export const STORAGE_FULL_MESSAGE =
  'Storage is temporarily full. New uploads are unavailable right now. Please try again later.';

function publicError(code, message, statusCode) {
  const err = new Error(message);
  err.publicCode = code;
  err.statusCode = statusCode;
  return err;
}

export function createStorageQuota({ db, config }) {
  let sqliteQueue = Promise.resolve();

  const positiveOr = (value, fallback) =>
    Number.isFinite(value) && value > 0 ? value : fallback;

  function maxFileBytes() {
    return positiveOr(config.maxFileSizeMb, 50) * MB;
  }

  // Effective threshold: the safe limit, but never above the hard limit.
  // Invalid/missing values fall back to defaults instead of disabling the check.
  function safeLimitBytes() {
    const limitMb = positiveOr(config.storageLimitMb, DEFAULT_LIMIT_MB);
    const safeMb = positiveOr(config.storageSafeLimitMb, DEFAULT_SAFE_LIMIT_MB);
    return Math.min(safeMb, limitMb) * MB;
  }

  /**
   * Throws FILE_TOO_LARGE if any single file exceeds the maximum size.
   */
  function assertFileSizes(sizesInBytes) {
    const max = maxFileBytes();
    for (const size of sizesInBytes) {
      if (size > max) {
        throw publicError(
          'FILE_TOO_LARGE',
          `The selected file is larger than the maximum allowed size of ${max / MB} MB.`,
          413
        );
      }
    }
  }

  async function currentUsageBytes(tx) {
    const res = await tx.query(
      'SELECT COALESCE(SUM(file_size), 0) AS total FROM shared_files'
    );
    return Number(res.rows?.[0]?.total || 0);
  }

  /**
   * Runs `work(tx)` inside a transaction that first takes the storage lock
   * and verifies that (current usage + newBytes) fits under the safe limit.
   * `work` should insert the share + shared_files rows (the reservation) and
   * return quickly; do not perform network I/O inside it.
   *
   * Throws STORAGE_LIMIT_REACHED (nothing is inserted) if it would not fit.
   */
  function withCapacity(newBytes, work) {
    const run = () =>
      db.transaction(async (tx) => {
        if (db.isPostgres) {
          await tx.query(`SELECT pg_advisory_xact_lock(${STORAGE_LOCK_KEY})`);
        }

        const used = await currentUsageBytes(tx);
        if (used + newBytes > safeLimitBytes()) {
          throw publicError('STORAGE_LIMIT_REACHED', STORAGE_FULL_MESSAGE, 503);
        }

        return work(tx);
      });

    if (db.isPostgres) {
      return run();
    }

    const result = sqliteQueue.then(run);
    sqliteQueue = result.catch(() => {});
    return result;
  }

  return { assertFileSizes, withCapacity, currentUsageBytes };
}
