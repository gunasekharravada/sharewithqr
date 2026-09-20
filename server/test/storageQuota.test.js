import assert from 'assert';
import { createStorageQuota } from '../src/services/storageQuota.js';

/**
 * Hermetic tests (no database / network needed):
 *   node test/storageQuota.test.js
 *
 * The fake db mimics the two behaviours the quota logic relies on:
 *  - a transaction that sees committed rows only when it finishes, and
 *  - pg_advisory_xact_lock(): a lock held until the transaction ends.
 */

const MB = 1024 * 1024;
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

function createFakeDb({ isPostgres = true, initialBytes = 0 } = {}) {
  const rows = initialBytes > 0 ? [{ file_size: initialBytes }] : [];
  let lockHeld = false;
  const lockWaiters = [];

  async function acquire() {
    if (!lockHeld) { lockHeld = true; return; }
    await new Promise((resolve) => lockWaiters.push(resolve));
  }
  function release() {
    const next = lockWaiters.shift();
    if (next) next(); else lockHeld = false;
  }

  return {
    isPostgres,
    rows,
    async transaction(work) {
      const pending = []; // inserts become visible only on commit
      let ownsLock = false;
      const tx = {
        async query(sql, params) {
          if (sql.includes('pg_advisory_xact_lock')) {
            await acquire();
            ownsLock = true;
            return { rows: [] };
          }
          if (sql.includes('SUM(file_size)')) {
            const total = rows.reduce((s, r) => s + r.file_size, 0); // snapshot read
            await tick(); // widen the race window before the result is used
            return { rows: [{ total: String(total) }] };
          }
          if (sql.startsWith('INSERT')) {
            pending.push({ file_size: params[0] });
            return { rows: [] };
          }
          throw new Error(`unexpected sql: ${sql}`);
        }
      };
      try {
        const result = await work(tx);
        rows.push(...pending); // COMMIT
        return result;
      } finally {
        if (ownsLock) release(); // lock released on COMMIT/ROLLBACK
      }
    },
    totalBytes: () => rows.reduce((s, r) => s + r.file_size, 0)
  };
}

const config = { maxFileSizeMb: 50, storageLimitMb: 1024, storageSafeLimitMb: 900 };
const reserve = (quota, bytes) =>
  quota.withCapacity(bytes, (tx) => tx.query('INSERT', [bytes]));

let passed = 0;
async function test(name, fn) {
  await fn();
  passed += 1;
  console.log(`✓ ${name}`);
}

await test('Test A: upload below the safe limit succeeds', async () => {
  const db = createFakeDb({ initialBytes: 100 * MB });
  const quota = createStorageQuota({ db, config });
  await reserve(quota, 40 * MB);
  assert.strictEqual(db.totalBytes(), 140 * MB);
});

await test('Test B: file larger than 50 MB -> FILE_TOO_LARGE', async () => {
  const quota = createStorageQuota({ db: createFakeDb(), config });
  quota.assertFileSizes([50 * MB]); // exactly the limit is allowed
  assert.throws(
    () => quota.assertFileSizes([1 * MB, 50 * MB + 1]),
    (err) => err.publicCode === 'FILE_TOO_LARGE' && err.statusCode === 413
  );
});

await test('Test C: usage + upload > 900 MB -> STORAGE_LIMIT_REACHED, nothing stored', async () => {
  const db = createFakeDb({ initialBytes: 870 * MB });
  const quota = createStorageQuota({ db, config });
  await assert.rejects(
    () => reserve(quota, 40 * MB),
    (err) =>
      err.publicCode === 'STORAGE_LIMIT_REACHED' &&
      err.statusCode === 503 &&
      err.message === 'Storage is temporarily full. New uploads are unavailable right now. Please try again later.'
  );
  assert.strictEqual(db.totalBytes(), 870 * MB, 'rejected upload must not reserve space');
  await reserve(quota, 30 * MB); // exactly at the limit is still allowed
  assert.strictEqual(db.totalBytes(), 900 * MB);
});

await test('Test D: space freed by cleanup makes uploads succeed again', async () => {
  const db = createFakeDb({ initialBytes: 890 * MB });
  const quota = createStorageQuota({ db, config });
  await assert.rejects(() => reserve(quota, 40 * MB), (e) => e.publicCode === 'STORAGE_LIMIT_REACHED');
  db.rows.length = 0; // expired shares deleted by cleanupService
  db.rows.push({ file_size: 650 * MB });
  await reserve(quota, 40 * MB);
  assert.strictEqual(db.totalBytes(), 690 * MB);
});

await test('Test E: simultaneous uploads cannot exceed the limit (Postgres advisory lock)', async () => {
  const db = createFakeDb({ isPostgres: true, initialBytes: 850 * MB });
  const quota = createStorageQuota({ db, config });
  const results = await Promise.allSettled(
    Array.from({ length: 10 }, () => reserve(quota, 40 * MB))
  );
  const ok = results.filter((r) => r.status === 'fulfilled').length;
  const rejected = results.filter((r) => r.status === 'rejected' && r.reason.publicCode === 'STORAGE_LIMIT_REACHED').length;
  assert.strictEqual(ok, 1, 'only one 40 MB upload fits into the 50 MB of free space');
  assert.strictEqual(rejected, 9);
  assert(db.totalBytes() <= 900 * MB);
});

await test('Test E2: simultaneous uploads cannot exceed the limit (SQLite in-process queue)', async () => {
  const db = createFakeDb({ isPostgres: false, initialBytes: 850 * MB });
  const quota = createStorageQuota({ db, config });
  const results = await Promise.allSettled(
    Array.from({ length: 10 }, () => reserve(quota, 40 * MB))
  );
  assert.strictEqual(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert(db.totalBytes() <= 900 * MB);
});

await test('Control: without the lock the same race DOES overshoot (proves the test is meaningful)', async () => {
  const db = createFakeDb({ isPostgres: false, initialBytes: 850 * MB });
  const naive = async (bytes) => {
    const used = (await db.transaction((tx) => tx.query('SUM(file_size)'))).rows[0].total;
    if (Number(used) + bytes > 900 * MB) throw new Error('full');
    await db.transaction((tx) => tx.query('INSERT', [bytes]));
  };
  await Promise.allSettled([naive(40 * MB), naive(40 * MB)]);
  assert(db.totalBytes() > 900 * MB, 'naive check-then-insert lets both through');
});

await test('Invalid limit config falls back to defaults instead of disabling the check', async () => {
  const db = createFakeDb({ initialBytes: 899 * MB });
  const quota = createStorageQuota({
    db,
    config: { maxFileSizeMb: NaN, storageLimitMb: NaN, storageSafeLimitMb: NaN }
  });
  await assert.rejects(() => reserve(quota, 5 * MB), (e) => e.publicCode === 'STORAGE_LIMIT_REACHED');
  assert.throws(() => quota.assertFileSizes([51 * MB]), (e) => e.publicCode === 'FILE_TOO_LARGE');
});

await test('Safe limit is never above the hard limit', async () => {
  const db = createFakeDb({ initialBytes: 490 * MB });
  const quota = createStorageQuota({
    db,
    config: { maxFileSizeMb: 50, storageLimitMb: 500, storageSafeLimitMb: 900 }
  });
  await assert.rejects(() => reserve(quota, 20 * MB), (e) => e.publicCode === 'STORAGE_LIMIT_REACHED');
});

console.log(`\n${passed} storage quota tests passed`);
