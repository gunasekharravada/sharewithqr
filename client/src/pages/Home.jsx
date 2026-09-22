import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  FileText,
  Image,
  FileType,
  StickyNote,
  Files,
  UserX,
  MonitorSmartphone,
  Timer
} from 'lucide-react';

// Keep in sync with the server's MAX_FILE_SIZE_MB (Supabase Free plan: 50 MB per file)
const MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 50;

const CATEGORIES = [
  { label: 'Documents', icon: FileText },
  { label: 'Images', icon: Image },
  { label: 'PDFs', icon: FileType },
  { label: 'Text', icon: FileText },
  { label: 'Notes', icon: StickyNote },
  { label: 'Other files', icon: Files }
];

const BENEFITS = [
  { title: 'No Signup', text: 'Start sharing instantly without creating an account.', icon: UserX },
  { title: 'No App', text: 'Works directly in your browser.', icon: MonitorSmartphone },
  { title: 'Temporary', text: 'Shares automatically expire after the selected time.', icon: Timer }
];

const STEPS = [
  { n: '01', title: 'Create', text: 'Choose what you want to share and set how long it should remain available.' },
  { n: '02', title: 'Share', text: 'Get an access code and a QR code.' },
  { n: '03', title: 'Receive', text: 'The recipient uses the OTP or scans the QR code to access the share.' }
];

const CHARACTERISTICS = [
  'No account required',
  'OTP + QR access',
  'Temporary expiration',
  'Private cloud storage',
  `File size protection (${MAX_FILE_SIZE_MB} MB per file)`,
  'Access limits',
  'Automatic cleanup'
];

export function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-20 lg:pt-28">
        {/* Trust badge */}
        <div className="mx-auto inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-center text-[11px] font-semibold uppercase leading-snug tracking-wider text-blue-400 sm:text-xs">
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>No Signup • No App • Disappears Automatically</span>
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-[clamp(2.25rem,7vw,4.25rem)] font-bold leading-[1.05] tracking-tight text-white">
          Share Anything. <span className="text-blue-400">Temporarily.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Send text and files with a simple OTP or QR code. No account. No app. No clutter.
          Just share it and let it disappear when it expires.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link to="/send" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-7 text-base font-semibold transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 bg-blue-600 text-white hover:bg-blue-500">
            Start Sharing
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link to="/receive" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-7 text-base font-semibold transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700">
            Receive a Share
          </Link>
        </div>

        {/* Quick facts */}
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400 sm:text-sm">
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            {MAX_FILE_SIZE_MB} MB Max Per File
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            6-Digit OTP &amp; QR Code
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            Auto-Expiring Storage
          </li>
        </ul>
      </section>

      {/* WHAT YOU CAN SHARE */}
      <section className="border-t border-slate-800/80">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-tight text-white">
            Share What You Need. Nothing More.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Send files or text when you need to move something quickly without creating another
            account or keeping it around forever.
          </p>

          <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
            {CATEGORIES.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-200"
              >
                <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-500">Up to {MAX_FILE_SIZE_MB} MB per file.</p>
        </div>
      </section>

      {/* NO SIGNUP / NO APP / TEMPORARY */}
      <section className="border-t border-slate-800/80 bg-slate-900/30">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 md:py-14">
          {BENEFITS.map(({ title, text, icon: Icon }) => (
            <div key={title} className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-blue-400">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-slate-800/80">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-center text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-tight text-white">
            How It Works
          </h2>

          <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((step) => (
              <li key={step.n} className="text-center md:text-left">
                <span className="font-mono text-sm font-semibold text-blue-400">{step.n}</span>
                <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-400">{step.text}</p>
              </li>
            ))}
          </ol>

          <p className="mt-10 text-center text-sm text-slate-500">
            When the share expires, it is no longer available.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-800/80 bg-slate-900/30">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-tight text-white">
            Ready to Send Something?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Create a temporary share in seconds. No signup. No app. Just send it.
          </p>
          <Link to="/send" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-7 text-base font-semibold transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 bg-blue-600 text-white hover:bg-blue-500 mt-8">
            Start Sharing
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* PRODUCT CREDENTIALS */}
      <section className="border-t border-slate-800/80">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-tight text-white">
              Built for Simple, Temporary Sharing
            </h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              TempShare is designed around one simple idea: sharing should not require creating an
              account or leaving files online indefinitely. Create a temporary share, give someone
              access through an OTP or QR code, and let the share expire when its time is up.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CHARACTERISTICS.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
