import { db } from './database.js';

export async function runMigrations() {
  console.log('[DB] Running database migrations...');

  if (db.isPostgres) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS shares (
        id SERIAL PRIMARY KEY,
        share_token VARCHAR(64) UNIQUE NOT NULL,
        otp_hash VARCHAR(128) NOT NULL,
        pin_hash VARCHAR(128),
        share_type VARCHAR(20) NOT NULL,
        text_content TEXT,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        burn_after_read BOOLEAN DEFAULT FALSE,
        max_accesses INTEGER DEFAULT 0,
        access_count INTEGER DEFAULT 0,
        failed_attempts INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(share_token);
      CREATE INDEX IF NOT EXISTS idx_shares_otp ON shares(otp_hash);
      CREATE INDEX IF NOT EXISTS idx_shares_status_expires ON shares(status, expires_at);

      CREATE TABLE IF NOT EXISTS shared_files (
        id SERIAL PRIMARY KEY,
        share_id INTEGER NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
        original_filename VARCHAR(255) NOT NULL,
        storage_key VARCHAR(255) NOT NULL,
        mime_type VARCHAR(128) NOT NULL,
        file_size BIGINT NOT NULL,
        relative_path VARCHAR(500),
        checksum VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_shared_files_share ON shared_files(share_id);
      CREATE INDEX IF NOT EXISTS idx_shared_files_storage_key ON shared_files(storage_key);

      CREATE TABLE IF NOT EXISTS access_logs (
        id SERIAL PRIMARY KEY,
        share_id INTEGER REFERENCES shares(id) ON DELETE SET NULL,
        access_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN NOT NULL,
        action VARCHAR(50) NOT NULL,
        user_agent_hash VARCHAR(64),
        ip_hash VARCHAR(64)
      );

      CREATE INDEX IF NOT EXISTS idx_access_logs_share ON access_logs(share_id);
    `);
  } else {
    // SQLite schema
    await db.query(`
      CREATE TABLE IF NOT EXISTS shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        share_token TEXT UNIQUE NOT NULL,
        otp_hash TEXT NOT NULL,
        pin_hash TEXT,
        share_type TEXT NOT NULL,
        text_content TEXT,
        expires_at DATETIME NOT NULL,
        burn_after_read INTEGER DEFAULT 0,
        max_accesses INTEGER DEFAULT 0,
        access_count INTEGER DEFAULT 0,
        failed_attempts INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(share_token);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_shares_otp ON shares(otp_hash);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_shares_status_expires ON shares(status, expires_at);`);

    await db.query(`
      CREATE TABLE IF NOT EXISTS shared_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        share_id INTEGER NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
        original_filename TEXT NOT NULL,
        storage_key TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        relative_path TEXT,
        checksum TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`CREATE INDEX IF NOT EXISTS idx_shared_files_share ON shared_files(share_id);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_shared_files_storage_key ON shared_files(storage_key);`);

    await db.query(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        share_id INTEGER REFERENCES shares(id) ON DELETE SET NULL,
        access_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        success INTEGER NOT NULL,
        action TEXT NOT NULL,
        user_agent_hash TEXT,
        ip_hash TEXT
      );
    `);
  }

  console.log('[DB] Migrations completed successfully.');
}
