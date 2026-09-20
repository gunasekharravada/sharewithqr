import React, { useState } from 'react';
import { Copy, Check, KeyRound } from 'lucide-react';
import { toast } from '../utils/toast.js';

export function ShareCodeDisplay({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('6-Digit OTP copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const digits = (code || '000000').split('');

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          6-Digit Share Code
        </span>
      </div>

      {/* Digits Display */}
      <div className="flex items-center gap-2 sm:gap-3">
        {digits.map((digit, idx) => (
          <div
            key={idx}
            className="w-11 h-14 sm:w-14 sm:h-18 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-blue-500/40 shadow-xl shadow-blue-500/10 flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono select-all hover:border-blue-400 transition-colors"
          >
            {digit}
          </div>
        ))}
      </div>

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all active:scale-95"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Code Copied!' : 'Copy 6-Digit Code'}
      </button>
    </div>
  );
}
