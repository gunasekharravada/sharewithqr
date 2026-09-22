import React from 'react';
import { Clock, Users } from 'lucide-react';
import { EXPIRY_OPTIONS } from '../utils/constants.js';

export function ExpirySelector({
  expiryMinutes,
  setExpiryMinutes,
  maxAccesses,
  setMaxAccesses
}) {
  return (
    <div className="card p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
        {/* Expires In */}
        <fieldset className="flex min-w-0 items-center justify-between gap-3 sm:block">
          <legend className="float-left flex items-center gap-2 text-sm font-medium text-slate-200 sm:float-none sm:mb-2">
            <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Expires In
          </legend>
          <div className="ml-auto grid w-[58%] grid-cols-2 gap-1 rounded-xl border border-slate-700 bg-slate-950 p-1 sm:ml-0 sm:w-full">
            {EXPIRY_OPTIONS.map((minutes) => (
              <label key={minutes} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="expiry"
                  value={minutes}
                  checked={expiryMinutes === minutes}
                  onChange={() => setExpiryMinutes(minutes)}
                  className="peer sr-only"
                />
                <span className="flex min-h-[40px] items-center justify-center rounded-lg px-2 text-sm font-medium text-slate-300 transition-colors hover:text-white peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400">
                  {minutes}<span className="sm:hidden">&nbsp;min</span><span className="hidden sm:inline">&nbsp;minutes</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Access Limit */}
        <div className="flex min-w-0 items-center justify-between gap-3 sm:block">
          <label htmlFor="access-limit" className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-200 sm:mb-2">
            <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Access Limit
          </label>
          <select
            id="access-limit"
            value={maxAccesses}
            onChange={(e) => setMaxAccesses(parseInt(e.target.value, 10))}
            className="field w-[58%] sm:w-full"
          >
            <option value="0">Unlimited accesses</option>
            <option value="1">1 access</option>
            <option value="2">2 accesses</option>
            <option value="5">5 accesses</option>
            <option value="10">10 accesses</option>
          </select>
        </div>
      </div>

      <p className="mt-3 hidden text-xs text-slate-500 [@media(min-height:760px)]:block">
        The share is removed automatically when time runs out or the access limit is reached.
      </p>
    </div>
  );
}
