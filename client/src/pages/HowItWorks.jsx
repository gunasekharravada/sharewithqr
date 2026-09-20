import React from 'react';
import { KeyRound, QrCode, Flame, Lock, FolderTree, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How TempShare Works
        </h1>
        <p className="text-base text-slate-400 max-w-xl mx-auto">
          A step-by-step breakdown of our temporary sharing architecture, access methods, and security controls.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Step 1 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              1
            </div>
            <h3 className="text-xl font-bold text-white">Create a Share</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Choose whether to share files (up to 50 MB each) or text snippets (up to 100,000 characters). You can drop multiple files or entire folder directories. Every share expires automatically 10 minutes after it is created, and you can optionally set an access limit.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              2
            </div>
            <h3 className="text-xl font-bold text-white">6-Digit Code & QR Generation</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Our backend generates a non-sequential, cryptographically randomized 6-digit OTP alongside a high-resolution QR code encoding a secure random token. No sensitive internal IDs or file paths are ever exposed in URLs.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
              3
            </div>
            <h3 className="text-xl font-bold text-white">Receiver Access & Verification</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            The receiver opens TempShare on their phone, tablet, or laptop and enters the 6-digit OTP or scans the QR code. Files can be downloaded individually or as a single ZIP archive.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              4
            </div>
            <h3 className="text-xl font-bold text-white">Automatic Purge & Data Erasure</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Once the 10-minute expiration timer runs out, our automated background cleanup job purges the files from disk/storage and deletes the records. Expired codes and links immediately yield a 410 Expired status.
          </p>
        </div>

      </div>

      <div className="text-center pt-4">
        <Link
          to="/send"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
        >
          Try TempShare Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
