import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPostgres = Boolean(config.databaseUrl && config.databaseUrl.trim().length > 0);

let pgPool = null;
let sqliteDb = null;

if (isPostgres) {
pgPool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

  pgPool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle PostgreSQL client', err);
  });

  console.log('[DB] Configured for PostgreSQL (Connection Pool initialized)');
} else {
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'tempshare.db');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('[DB] SQLite connection error:', err);
    } else {
      console.log('[DB] Connected to SQLite database at:', dbPath);
    }
  });
  sqliteDb.run('PRAGMA foreign_keys = ON;');
  sqliteDb.run('PRAGMA journal_mode = WAL;');
}

export const db = {
  isPostgres,
  pgPool,
  sqliteDb,
  
  /**
   * Execute parameterized query
   */
  async query(sql, params = []) {
    if (isPostgres) {
      const res = await pgPool.query(sql, params);
      return { rows: res.rows || [], rowCount: res.rowCount };
    } else {
      // Convert PostgreSQL style parameters $1, $2 to SQLite style ?
      const sqliteSql = sql.replace(/\$(\d+)/g, '?');
      
      return new Promise((resolve, reject) => {
        const trimmed = sqliteSql.trim().toUpperCase();
        if (trimmed.startsWith('SELECT') || trimmed.includes('RETURNING')) {
          sqliteDb.all(sqliteSql, params, (err, rows) => {
            if (err) return reject(err);
            resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
          });
        } else {
          sqliteDb.run(sqliteSql, params, function (err) {
            if (err) return reject(err);
            resolve({
              rows: [{ id: this.lastID }],
              rowCount: this.changes,
              lastID: this.lastID
            });
          });
        }
      });
    }
  },

  /**
   * Execute a block within a database transaction
   */
  async transaction(callback) {
    if (isPostgres) {
      const client = await pgPool.connect();
      try {
        await client.query('BEGIN');
        const customDb = {
          isPostgres: true,
          query: (sql, params) => client.query(sql, params)
        };
        const result = await callback(customDb);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // SQLite serialized transaction
      return new Promise((resolve, reject) => {
        sqliteDb.serialize(async () => {
          try {
            await this.query('BEGIN TRANSACTION');
            const result = await callback(this);
            await this.query('COMMIT');
            resolve(result);
          } catch (err) {
            await this.query('ROLLBACK').catch(() => {});
            reject(err);
          }
        });
      });
    }
  }
};
