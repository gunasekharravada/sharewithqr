import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyText } from '../utils/clipboard.js';
import { toast } from '../utils/toast.js';

export function ShareCodeDisplay({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Couldn't copy the code. Select the digits and copy them manually.");
    }
  };

  const digits = (code || '').split('');

  return (
    <div className="w-full text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Access Code</p>

      <div
        className="mx-auto mt-3 grid w-full max-w-[20rem] select-all grid-cols-6 gap-1.5 sm:gap-2"
        aria-label={`Access code ${digits.join(' ')}`}
        role="group"
      >
        {digits.map((digit, idx) => (
          <div
            key={idx}
            aria-hidden="true"
            className="flex aspect-[4/5] items-center justify-center rounded-lg border-2 border-blue-500/40 bg-gradient-to-b from-slate-800 to-slate-900 font-mono text-[clamp(1.2rem,5vw,1.65rem)] font-extrabold text-blue-400"
          >
            {digit}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-700 sm:w-auto"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy Code'}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? 'Code copied to clipboard' : ''}</span>
    </div>
  );
}
