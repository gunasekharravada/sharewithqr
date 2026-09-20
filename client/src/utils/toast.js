let listeners = [];
let toasts = [];

export const toast = {
  subscribe(fn) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },

  show(message, type = 'info', duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type };
    toasts = [...toasts, newToast];
    listeners.forEach(fn => fn(toasts));

    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      listeners.forEach(fn => fn(toasts));
    }, duration);
  },

  success(message, duration) {
    this.show(message, 'success', duration);
  },

  error(message, duration) {
    this.show(message, 'error', duration);
  },

  info(message, duration) {
    this.show(message, 'info', duration);
  }
};
