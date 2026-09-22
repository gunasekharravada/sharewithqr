import React, { useState, useEffect } from 'react';
import { toast } from '../utils/toast.js';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const STYLES = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/40' },
  error: { icon: AlertCircle, color: 'text-rose-400', border: 'border-rose-500/40' },
  info: { icon: Info, color: 'text-blue-400', border: 'border-slate-700' }
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return toast.subscribe((next) => {
      setToasts([...next]);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[24rem] sm:p-0"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const style = STYLES[t.type] || STYLES.info;
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`toast-in pointer-events-auto flex items-start gap-3 rounded-xl border bg-slate-900 p-4 shadow-lg shadow-black/40 ${style.border}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.color}`} aria-hidden="true" />
            <div className="min-w-0 flex-1 text-sm leading-snug">
              {t.title && <p className="font-semibold text-slate-50">{t.title}</p>}
              {t.message && (
                <p className={t.title ? 'mt-0.5 text-slate-300' : 'font-medium text-slate-100'}>{t.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="-m-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
