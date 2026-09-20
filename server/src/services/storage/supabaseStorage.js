import archiver from 'archiver';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/env.js';

class SupabaseStorage {
  constructor() {
    this.bucket = config.supabase.bucketName;

    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      throw new Error(
        'Supabase Storage is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
      );
    }

    this.supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log(
      `[Storage] Supabase Storage initialized (Bucket: ${this.bucket})`
    );
  }

  async uploadBuffer(
    storageKey,
    buffer,
    mimeType = 'application/octet-stream'
  ) {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(storageKey, buffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    return data;
  }

  async fileExists(storageKey) {
    const directory = storageKey.substring(
      0,
      storageKey.lastIndexOf('/')
    );

    const filename = storageKey.substring(
      storageKey.lastIndexOf('/') + 1
    );

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .list(directory, {
        search: filename,
        limit: 1
      });

    if (error) {
      throw new Error(`Supabase file check failed: ${error.message}`);
    }

    return Array.isArray(data) &&
      data.some((file) => file.name === filename);
  }

  async getFileStream(storageKey) {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(storageKey);

    if (error) {
      throw new Error(`Supabase download failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Supabase returned no file data.');
    }

    // Supabase returns a Blob.
    // Convert it to a Node.js readable stream.
    return this.blobToStream(data);
  }

  blobToStream(blob) {
    const reader = blob.stream().getReader();

    return new ReadableStreamAdapter(reader);
  }

  async getPresignedUploadUrl(
    storageKey,
    mimeType = 'application/octet-stream',
    expiresInSeconds = 3600
  ) {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUploadUrl(storageKey);

    if (error) {
      throw new Error(
        `Supabase signed upload URL failed: ${error.message}`
      );
    }

    return data.signedUrl;
  }

  async getPresignedDownloadUrl(
    storageKey,
    originalFilename,
    expiresInSeconds = 900
  ) {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(storageKey, expiresInSeconds, {
        download: originalFilename || true
      });

    if (error) {
      throw new Error(
        `Supabase signed download URL failed: ${error.message}`
      );
    }

    return data.signedUrl;
  }

  async deleteFile(storageKey) {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([storageKey]);

    if (error) {
      console.error(
        `[Storage:Supabase] Failed to delete ${storageKey}:`,
        error.message
      );
    }
  }

  async deleteFiles(storageKeys) {
    if (!Array.isArray(storageKeys) || storageKeys.length === 0) {
      return;
    }

    // Supabase accepts multiple paths in one remove request.
    for (let i = 0; i < storageKeys.length; i += 100) {
      const chunk = storageKeys.slice(i, i + 100);

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove(chunk);

      if (error) {
        console.error(
          '[Storage:Supabase] Batch deletion error:',
          error.message
        );
      }
    }
  }

  async createZipStream(files) {
    const archive = archiver('zip', {
      zlib: { level: 6 }
    });

    (async () => {
      for (const file of files) {
        try {
          const stream = await this.getFileStream(file.storage_key);

          const entryName =
            file.relative_path || file.original_filename;

          archive.append(stream, {
            name: entryName
          });
        } catch (err) {
          console.warn(
            `[Storage:Supabase] Could not append ${file.storage_key}:`,
            err.message
          );
        }
      }

      await archive.finalize();
    })().catch((err) => {
      archive.emit('error', err);
    });

    return archive;
  }
}

/**
 * Converts a Web ReadableStream into something
 * archiver/Node can consume.
 */
class ReadableStreamAdapter {
  constructor(reader) {
    this.reader = reader;
  }

  async *[Symbol.asyncIterator]() {
    try {
      while (true) {
        const { done, value } = await this.reader.read();

        if (done) break;

        yield Buffer.from(value);
      }
    } finally {
      try {
        await this.reader.releaseLock();
      } catch {
        // Ignore release errors.
      }
    }
  }

  pipe(destination) {
    (async () => {
      try {
        for await (const chunk of this) {
          if (!destination.write(chunk)) {
            await new Promise((resolve) =>
              destination.once('drain', resolve)
            );
          }
        }

        destination.end();
      } catch (error) {
        destination.destroy(error);
      }
    })();

    return destination;
  }
}

export const supabaseStorage = new SupabaseStorage();