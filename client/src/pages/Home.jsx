import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Download, ShieldCheck, Zap, Clock, QrCode, FolderUp, FileText, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';

export function Home() {
  const [stats, setStats] = useState({ activeShares: 0, totalFilesShared: 0 });

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-24 py-8 sm:py-16">
      
      {/* 1. Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          No Signup • No App • Disappears Automatically
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
          Share Anything. <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Temporarily.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Files, documents, source code, and text snippets. Share securely via a 6-digit code or QR, and let it disappear when you’re done.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/send"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Send className="w-5 h-5" />
            Start Sharing Now
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/receive"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5 text-blue-400" />
            Receive a Share
          </Link>
        </div>

        {/* Value props badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 50 MB Max Per File</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 6-Digit OTP & QR Code</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto-Expiring Storage</span>
        </div>
      </section>

      {/* 2. How It Works (3 Steps) */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How TempShare Works
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            A frictionless temporary bridge between any two devices online.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-100">Upload or Paste</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Drop files, folders, or paste text up to 100k characters. Every share expires automatically after 10 minutes.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-100">Get OTP & QR</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instantly receive a unique, unguessable 6-digit code and a scannable QR code. No signup required.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-100">Disappears Forever</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Receiver downloads or reads the content. Once expired, files and records are purged completely.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for Speed and Security
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Everything you need for safe temporary transfers without lingering data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
            <QrCode className="w-6 h-6 text-purple-400" />
            <h4 className="text-base font-bold text-slate-100">Scannable QR Access</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan directly from phone cameras or laptops for zero-typing transfers between devices.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
            <FolderUp className="w-6 h-6 text-cyan-400" />
            <h4 className="text-base font-bold text-slate-100">Multi-File & Folder Trees</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload multiple files and preserve project directory hierarchies with one single share code.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
            <Clock className="w-6 h-6 text-blue-400" />
            <h4 className="text-base font-bold text-slate-100">Automated Background Purge</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              A background cleanup daemon purges storage objects continuously every minute.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h4 className="text-base font-bold text-slate-100">Rate-Limited & Secure</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crypto-random OTPs with lockout protection against brute-force guessing attempts.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-blue-500/30 p-8 sm:p-12 text-center space-y-6 backdrop-blur-xl">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to send something securely?
          </h3>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            No signup. No personal data collected. Simply drag, share, and let it expire.
          </p>
          <div className="pt-2">
            <Link
              to="/send"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/30 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              Create a Temporary Share
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
