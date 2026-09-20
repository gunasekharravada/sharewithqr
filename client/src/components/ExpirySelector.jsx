import React from 'react';
import { Clock, Users } from 'lucide-react';

// Shares always expire 10 minutes after creation. The backend enforces this
// (the client cannot choose a duration); the value below is display-only.
const SHARE_EXPIRY_MINUTES = 10;

export function ExpirySelector({
  maxAccesses,
  setMaxAccesses
}) {
  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-5 space-y-6">
      
      {/* 1. Fixed expiration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-semibold text-slate-200">
            Expires After
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="py-2 px-3 rounded-xl text-xs font-medium border bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20">
            {SHARE_EXPIRY_MINUTES} Minutes
          </span>
          <p className="text-xs text-slate-400">
            Every share is deleted automatically {SHARE_EXPIRY_MINUTES} minutes after it is created.
          </p>
        </div>
      </div>

      {/* 2. Access Limits */}
      <div className="space-y-2 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <label className="text-xs font-semibold text-slate-300">
            Access Limit
          </label>
        </div>
        <select
          value={maxAccesses}
          onChange={(e) => setMaxAccesses(parseInt(e.target.value, 10))}
          className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="0">Unlimited accesses</option>
          <option value="1">1 access only</option>
          <option value="2">2 accesses</option>
          <option value="5">5 accesses</option>
          <option value="10">10 accesses</option>
        </select>
        <p className="text-xs text-slate-500 italic pt-1">
          Shares are accessible directly with the 6-digit OTP or QR link.
        </p>
      </div>

    </div>
  );
}
