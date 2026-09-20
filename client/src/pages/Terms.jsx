import React from 'react';
import { Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

export function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Please read these terms carefully before utilizing TempShare temporary online sharing services.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            1. Acceptable Use
          </h2>
          <p>
            TempShare is provided for legitimate temporary data transit (documents, media, study materials, code, and text snippets). Users agree not to upload malware, unauthorized copyrighted material, malicious payloads, illegal material, or execute denial-of-service attempts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            2. Ephemeral Service Guarantee
          </h2>
          <p>
            TempShare is explicitly designed for short-term temporary sharing and is not a permanent cloud backup solution. All files and records will be deleted upon expiration or access limit depletion without the possibility of recovery. TempShare is not liable for data loss resulting from automated expiration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            3. Rate Limiting & Abuse Prevention
          </h2>
          <p>
            We reserve the right to throttle, rate-limit, or restrict IP addresses or clients exhibiting abusive patterns, bot traffic, automated scanning, or excessive brute-force attempts on share codes.
          </p>
        </section>

      </div>
    </div>
  );
}
