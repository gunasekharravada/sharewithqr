import { MAX_FILE_SIZE_MB } from './constants.js';

/**
 * Turns any error (API error codes, server messages, network failures) into a
 * friendly { title, message } pair. Raw backend/technical details are never
 * shown to the user.
 */
export function getFriendlyError(err) {
  const raw = String(err?.message || '');
  const code = err?.code;
  const status = err?.status;

  if (code === 'STORAGE_LIMIT_REACHED') {
    return {
      title: 'Storage temporarily unavailable',
      message: "We're unable to store this file right now. Please try again later."
    };
  }

  if (code === 'FILE_TOO_LARGE') {
    return {
      title: 'File too large',
      message: `Maximum file size is ${MAX_FILE_SIZE_MB} MB.`
    };
  }

  const isNetwork =
    code === 'NETWORK_ERROR' ||
    err instanceof TypeError ||
    /failed to fetch|networkerror|network error|load failed/i.test(raw);
  if (isNetwork) {
    return {
      title: 'Something went wrong',
      message: 'Check your connection and try again.'
    };
  }

  if (/incorrect or does not exist|invalid otp/i.test(raw)) {
    return {
      title: 'Invalid access code',
      message: 'Please check the code and try again.'
    };
  }

  if (/expired|not found/i.test(raw)) {
    return {
      title: 'This share has expired',
      message: 'The share is no longer available.'
    };
  }

  if (/maximum access limit/i.test(raw)) {
    return {
      title: 'Access limit reached',
      message: 'This share has already been opened the maximum number of times.'
    };
  }

  if (/too many failed attempts/i.test(raw)) {
    return {
      title: 'Too many attempts',
      message: 'This share has been temporarily locked.'
    };
  }

  if (status === 429 || /too many (requests|verification)|upload limit reached/i.test(raw)) {
    return {
      title: 'Please slow down',
      message: 'Too many attempts in a short time. Please wait a few minutes and try again.'
    };
  }

  if (/no longer (available|active|supported)|burn/i.test(raw)) {
    return {
      title: 'Share unavailable',
      message: 'The share is no longer available.'
    };
  }

  // Our own validation messages (4xx) are safe and useful to show as-is.
  if (status && status >= 400 && status < 500 && raw) {
    return { title: 'Please check your input', message: raw };
  }

  return {
    title: 'Something went wrong',
    message: 'Please try again in a moment.'
  };
}
