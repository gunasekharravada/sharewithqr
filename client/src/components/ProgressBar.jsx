import React from 'react';
import { formatBytes } from '../utils/formatters.js';
import { UploadCloud, Clock, Zap } from 'lucide-react';

export function ProgressBar({ progress }) {
  if (!progress) return null;

  const { loaded, total, percent, speedBytesPerSec, secondsRemaining } = progress;

  return (
    <div className="bg-slate-800/90 border border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-3 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-blue-400 animate-bounce" />
          <span className="text-sm font-semibold text-slate-200">
            Uploading Share...
          </span>
        </div>
        <span className="text-sm font-mono font-bold text-blue-400">
          {percent}%
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700/60">
        <div
          className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-200 ease-out relative"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>

      {/* Sub metrics */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1 font-mono">
        <div>
          {formatBytes(loaded)} / {formatBytes(total)}
        </div>
        <div className="flex items-center gap-4">
          {speedBytesPerSec > 0 && (
            <span className="flex items-center gap-1 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {formatBytes(speedBytesPerSec)}/s
            </span>
          )}
          {secondsRemaining > 0 && (
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {secondsRemaining}s left
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
