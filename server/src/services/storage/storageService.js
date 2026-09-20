import path from 'path';
import crypto from 'crypto';

import { config } from '../../config/env.js';
import { r2Storage } from './r2Storage.js';
import { localStorage } from './localStorage.js';
import { supabaseStorage } from './supabaseStorage.js';

class UnifiedStorageService {
  constructor() {
    if (config.storageDriver === 'supabase') {
      this.driver = supabaseStorage;
      this.driverName = 'supabase';
    } else if (config.storageDriver === 'r2') {
      this.driver = r2Storage;
      this.driverName = 'r2';
    } else {
      this.driver = localStorage;
      this.driverName = 'local';
    }

    console.log(
      `[Storage] Active driver: ${this.driverName.toUpperCase()}`
    );
  }

  /**
   * Generates a unique, collision-resistant storage key.
   * Format:
   * shares/<share_token>/<timestamp>_<randomId>.<ext>
   */
  generateStorageKey(originalFilename, shareToken = 'common') {
    const ext = path.extname(originalFilename || '');

    const randomHex = crypto
      .randomBytes(8)
      .toString('hex');

    const safeShareToken = (shareToken || 'common')
      .replace(/[^a-zA-Z0-9_-]/g, '');

    return `shares/${safeShareToken}/${Date.now()}_${randomHex}${ext}`;
  }

  async uploadBuffer(storageKey, buffer, mimeType) {
    return await this.driver.uploadBuffer(
      storageKey,
      buffer,
      mimeType
    );
  }

  async fileExists(storageKey) {
    return await this.driver.fileExists(storageKey);
  }

  async getFileStream(storageKey) {
    return await this.driver.getFileStream(storageKey);
  }

  async getPresignedUploadUrl(
    storageKey,
    mimeType,
    expiresInSeconds = 3600
  ) {
    return await this.driver.getPresignedUploadUrl(
      storageKey,
      mimeType,
      expiresInSeconds
    );
  }

  async getPresignedDownloadUrl(
    storageKey,
    originalFilename,
    expiresInSeconds = 900
  ) {
    return await this.driver.getPresignedDownloadUrl(
      storageKey,
      originalFilename,
      expiresInSeconds
    );
  }

  async deleteFile(storageKey) {
    return await this.driver.deleteFile(storageKey);
  }

  async deleteFiles(storageKeys) {
    return await this.driver.deleteFiles(storageKeys);
  }

  createZipStream(files) {
    return this.driver.createZipStream(files);
  }
}

export const storageService =
  new UnifiedStorageService();