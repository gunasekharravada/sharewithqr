import React, { useState, useEffect } from 'react';
import { toast } from '../utils/toast.js';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return toast.subscribe((newToasts) => {
      setToasts([...newToasts]);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 ${
            t.type === 'success'
              ? 'bg-slate-800/95 border-emerald-500/50 text-emerald-200'
              : t.type === 'error'
              ? 'bg-slate-800/95 border-rose-500/50 text-rose-200'
              : 'bg-slate-800/95 border-blue-500/50 text-blue-200'
          } backdrop-blur-md`}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1 text-sm font-medium text-slate-100 leading-snug">
            {t.message}
          </div>
        </div>
      ))}
    </div>
  );
}
