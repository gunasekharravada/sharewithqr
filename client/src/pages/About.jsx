import React from 'react';
import { Sparkles, Shield, Clock, Lock, Zap, RefreshCw } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About TempShare
        </h1>
        <p className="text-base text-slate-400 max-w-xl mx-auto">
          A modern, temporary online bridge designed for secure and ephemeral transfers without persistent digital footprints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            The Core Mission
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Most file sharing platforms force user accounts, subscribe you to newsletters, and store your documents indefinitely. TempShare is engineered around a singular philosophy: <strong>Share Now. Gone When You're Done.</strong>
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Automatic Expiration
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Every piece of data uploaded to TempShare has a strict time-to-live. Once that window elapses or access limits are reached, the data is completely expunged from disks and databases.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            Security & Defense
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            We use cryptographically random 6-digit access codes, strict server-side rate limits, and zero public file directories to keep your temporary data protected.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-400" />
            No Account Friction
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            No emails, no passwords to remember, and no signups. Seamless sharing between smartphones, tablets, laptops, and desktop computers in seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
