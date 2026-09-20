import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { config } from '../../config/env.js';

class LocalStorage {
  constructor() {
    this.uploadDir = config.uploadDir;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getFilePath(storageKey) {
    const safeKey = path.basename(storageKey);
    return path.join(this.uploadDir, safeKey);
  }

  async uploadBuffer(storageKey, buffer) {
    const fullPath = this.getFilePath(storageKey);
    await fs.promises.writeFile(fullPath, buffer);
  }

  async fileExists(storageKey) {
    const fullPath = this.getFilePath(storageKey);
    return fs.existsSync(fullPath);
  }

  getFileStream(storageKey) {
    const fullPath = this.getFilePath(storageKey);
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found in local storage');
    }
    return fs.createReadStream(fullPath);
  }

  async getPresignedUploadUrl(storageKey) {
    // In local dev, returns local API endpoint
    return `${config.appUrl}/api/shares/upload-direct/${encodeURIComponent(storageKey)}`;
  }

  async getPresignedDownloadUrl(storageKey, originalFilename) {
    // In local dev fallback, return null so server streams it directly
    return null;
  }

  async deleteFile(storageKey) {
    try {
      const fullPath = this.getFilePath(storageKey);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (err) {
      console.error(`[Storage:Local] Failed to delete file ${storageKey}:`, err.message);
    }
  }

  async deleteFiles(storageKeys) {
    if (!Array.isArray(storageKeys)) return;
    await Promise.all(storageKeys.map((k) => this.deleteFile(k)));
  }

  createZipStream(files) {
    const archive = archiver('zip', {
      zlib: { level: 6 }
    });

    for (const file of files) {
      const fullPath = this.getFilePath(file.storage_key);
      if (fs.existsSync(fullPath)) {
        const entryName = file.relative_path || file.original_filename;
        archive.file(fullPath, { name: entryName });
      }
    }

    archive.finalize();
    return archive;
  }
}

export const localStorage = new LocalStorage();
