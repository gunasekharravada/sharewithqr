const API_HOST = import.meta.env.VITE_API_URL || '';
const BASE_URL = `${API_HOST}/api`;

const STORAGE_FULL_MESSAGE =
  'Storage is temporarily full. New uploads are unavailable right now. Please try again later.';

// Turns a failed API response into an Error, recognising the structured codes
// (STORAGE_LIMIT_REACHED, FILE_TOO_LARGE) so the UI shows a friendly message.
function buildApiError(data, fallback) {
  const message =
    data?.code === 'STORAGE_LIMIT_REACHED'
      ? STORAGE_FULL_MESSAGE
      : data?.message || data?.error || fallback;
  const err = new Error(message);
  if (data?.code) err.code = data.code;
  return err;
}

export const api = {
  /**
   * Create a text share
   */
  async createTextShare({ text, maxAccesses }) {
    const res = await fetch(`${BASE_URL}/shares/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, maxAccesses })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create text share');
    }
    return data.data;
  },

  /**
   * Upload multiple files / folder with progress tracking
   */
  createFilesShare({ files, paths, maxAccesses, onProgress }) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      if (paths && paths.length > 0) {
        formData.append('paths', JSON.stringify(paths));
      }

      formData.append('maxAccesses', maxAccesses || 0);

      let startTime = Date.now();
      let lastLoaded = 0;
      let lastTime = startTime;

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const now = Date.now();
          const percent = Math.round((e.loaded / e.total) * 100);
          
          // Calculate instant upload speed
          const timeDiff = (now - lastTime) / 1000;
          let speedBytesPerSec = 0;
          if (timeDiff > 0.3) {
            speedBytesPerSec = (e.loaded - lastLoaded) / timeDiff;
            lastLoaded = e.loaded;
            lastTime = now;
          }

          const remainingBytes = e.total - e.loaded;
          const secondsRemaining = speedBytesPerSec > 0 ? Math.round(remainingBytes / speedBytesPerSec) : 0;

          onProgress({
            loaded: e.loaded,
            total: e.total,
            percent,
            speedBytesPerSec,
            secondsRemaining
          });
        }
      });

      xhr.addEventListener('load', () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data.success) {
            resolve(data.data);
          } else {
            reject(buildApiError(data, 'Upload failed'));
          }
        } catch (err) {
          reject(new Error('Invalid response from server'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload. Please check your connection.'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled.'));
      });

      xhr.open('POST', `${BASE_URL}/shares/files`);
      xhr.send(formData);
    });
  },

  /**
   * Verify 6-digit OTP
   */
  async verifyOtp(otp) {
    const res = await fetch(`${BASE_URL}/shares/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Verification failed');
    }
    return data.data;
  },

  /**
   * Get share content/details by token
   */
  async getShare(token) {
    const url = new URL(`${window.location.origin}${BASE_URL}/shares/${token}`);

    const res = await fetch(url.toString());

    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.error || 'Failed to retrieve share');
      err.status = res.status;
      throw err;
    }
    return data.data;
  },

  /**
   * Direct download link for a single file
   */
  getDownloadUrl(token, fileId) {
    return `${BASE_URL}/shares/${token}/files/${fileId}/download`;
  },

  /**
   * Direct download link for all files as ZIP
   */
  getDownloadAllUrl(token) {
    return `${BASE_URL}/shares/${token}/download-all`;
  },

  /**
   * Delete / Revoke a share
   */
  async deleteShare(token) {
    const res = await fetch(`${BASE_URL}/shares/${token}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  },

  /**
   * Fetch system stats
   */
  async getStats() {
    try {
      const res = await fetch(`${BASE_URL}/stats`);
      const data = await res.json();
      return data.stats || { activeShares: 0, totalFilesShared: 0 };
    } catch {
      return { activeShares: 0, totalFilesShared: 0 };
    }
  }
};
