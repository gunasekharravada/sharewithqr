import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pg from 'pg';
import { config } from '../config/env.js';
import { runMigrations } from './migrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateSqliteToPostgres() {
  console.log('====================================================');
  console.log('  TEMPSHARE: SQLite to PostgreSQL Migration Utility');
  console.log('====================================================\n');

  if (!config.databaseUrl) {
    console.error('❌ Error: DATABASE_URL is not configured in .env');
    console.error('Please configure DATABASE_URL=postgresql://user:pass@host:5432/dbname before migrating.');
    process.exit(1);
  }

  const dbPath = path.resolve(__dirname, '../../data/tempshare.db');
  if (!fs.existsSync(dbPath)) {
    console.log(`ℹ️ No SQLite database found at: ${dbPath}`);
    console.log('Nothing to migrate. Initializing fresh PostgreSQL schema...');
    await runMigrations();
    console.log('✓ PostgreSQL schema initialized successfully.');
    process.exit(0);
  }

  console.log(`[1/4] Connecting to SQLite database at: ${dbPath}`);
  const sqlite = new sqlite3.Database(dbPath);

  console.log(`[2/4] Connecting to PostgreSQL at: ${config.databaseUrl.replace(/:[^:@]+@/, ':***@')}`);
  const pgPool = new pg.Pool({
    connectionString: config.databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  const client = await pgPool.connect();

  try {
    console.log('[3/4] Ensuring PostgreSQL tables are created...');
    await runMigrations();

    // Read SQLite shares
    const getShares = () => new Promise((resolve, reject) => {
      sqlite.all('SELECT * FROM shares', [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });

    const getFiles = () => new Promise((resolve, reject) => {
      sqlite.all('SELECT * FROM shared_files', [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });

    const getLogs = () => new Promise((resolve, reject) => {
      sqlite.all('SELECT * FROM access_logs', [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });

    const shares = await getShares();
    const files = await getFiles();
    const logs = await getLogs();

    console.log(`Found ${shares.length} shares, ${files.length} files, ${logs.length} access logs in SQLite.\n`);
    console.log('[4/4] Transferring records to PostgreSQL in a transaction...');

    await client.query('BEGIN');

    const shareIdMap = new Map(); // sqlite share id -> pg share id

    for (const s of shares) {
      const res = await client.query(`
        INSERT INTO shares (
          share_token, otp_hash, pin_hash, share_type, text_content,
          expires_at, burn_after_read, max_accesses, access_count, failed_attempts,
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (share_token) DO UPDATE SET updated_at = EXCLUDED.updated_at
        RETURNING id;
      `, [
        s.share_token,
        s.otp_hash,
        s.pin_hash,
        s.share_type,
        s.text_content,
        s.expires_at,
        Boolean(s.burn_after_read),
        s.max_accesses || 0,
        s.access_count || 0,
        s.failed_attempts || 0,
        s.status || 'active',
        s.created_at || new Date().toISOString(),
        s.updated_at || new Date().toISOString()
      ]);

      shareIdMap.set(s.id, res.rows[0].id);
    }

    for (const f of files) {
      const pgShareId = shareIdMap.get(f.share_id);
      if (pgShareId) {
        await client.query(`
          INSERT INTO shared_files (
            share_id, original_filename, storage_key, mime_type, file_size, relative_path, checksum, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `, [
          pgShareId,
          f.original_filename,
          f.storage_key,
          f.mime_type,
          f.file_size,
          f.relative_path,
          f.checksum || null,
          f.created_at || new Date().toISOString()
        ]);
      }
    }

    for (const l of logs) {
      const pgShareId = l.share_id ? shareIdMap.get(l.share_id) : null;
      await client.query(`
        INSERT INTO access_logs (
          share_id, access_time, success, action, user_agent_hash, ip_hash
        ) VALUES ($1, $2, $3, $4, $5, $6);
      `, [
        pgShareId,
        l.access_time || new Date().toISOString(),
        Boolean(l.success),
        l.action || 'access',
        l.user_agent_hash || null,
        l.ip_hash || null
      ]);
    }

    await client.query('COMMIT');
    console.log('\n====================================================');
    console.log(`✓ MIGRATION COMPLETE!`);
    console.log(`  Shares transferred: ${shares.length}`);
    console.log(`  Files transferred:  ${files.length}`);
    console.log(`  Logs transferred:   ${logs.length}`);
    console.log(`  Original SQLite database preserved at: ${dbPath}`);
    console.log('====================================================\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed and rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    sqlite.close();
    await pgPool.end();
    process.exit(0);
  }
}

migrateSqliteToPostgres();
