import React from 'react';
import { ShieldCheck, Lock, Trash2, EyeOff } from 'lucide-react';

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Honest, transparent, and privacy-first. How TempShare handles your temporary data.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-amber-400" />
            1. Temporary Storage & Deletion
          </h2>
          <p>
            All files and text uploaded to TempShare are treated strictly as ephemeral data. Every share expires 10 minutes after it is created. When a share expires, our automated background worker deletes the underlying storage files and marks the metadata as inaccessible.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-blue-400" />
            2. No User Accounts & No Tracking Cookies
          </h2>
          <p>
            TempShare does not require an account, email address, phone number, or login credentials to send or receive shares. We do not use marketing trackers, invasive advertising cookies, or third-party behavioral analytics.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            3. Cryptography & Access Protections
          </h2>
          <p>
            Access codes (OTPs) and optional PINs are hashed using cryptographic hashing algorithms (SHA-256 and bcrypt). Unhashed plaintext PINs or OTPs are never stored in databases. Files are stored outside public web roots with randomized, collision-resistant storage keys.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            4. Minimal Anonymous Operational Logs
          </h2>
          <p>
            To prevent brute-force attacks and service abuse, we maintain rate-limiting tables with salted, one-way hashed IP representations. Raw personal IP addresses are never exposed or sold to third parties.
          </p>
        </section>

      </div>
    </div>
  );
}
