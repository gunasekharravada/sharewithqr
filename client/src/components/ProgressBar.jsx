import React from 'react';
import { formatBytes } from '../utils/formatters.js';

export function ProgressBar({ progress }) {
  if (!progress) return null;

  const { loaded, total, percent, speedBytesPerSec, secondsRemaining } = progress;
  const value = Math.min(100, Math.max(0, percent));

  return (
    <div className="card space-y-3 p-4" aria-live="polite">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-200">Uploading…</span>
        <span className="font-mono font-semibold text-blue-300">{value}%</span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-label="Upload progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div
          className="h-full rounded-full bg-blue-500 transition-[width] duration-200 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-xs text-slate-400">
        <span>{formatBytes(loaded)} / {formatBytes(total)}</span>
        <span className="flex items-center gap-3">
          {speedBytesPerSec > 0 && <span>{formatBytes(speedBytesPerSec)}/s</span>}
          {secondsRemaining > 0 && <span>{secondsRemaining}s left</span>}
        </span>
      </div>
    </div>
  );
}
