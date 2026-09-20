import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export function Faq() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'What is TempShare and how does it work?',
      a: 'TempShare is an online-only temporary sharing service. You upload files (up to 50 MB each) or paste text, and receive a secure 6-digit code or QR code. The receiver enters that code or scans the QR to download the files or view the text. Every share expires after 10 minutes, and then everything is permanently erased.'
    },
    {
      q: 'Do I need an account to send or receive?',
      a: 'No! TempShare requires zero accounts, registrations, emails, or passwords for standard temporary sharing.'
    },
    {
      q: 'What is the maximum file size I can share?',
      a: 'Each file can be up to 50 MB. You can share single files, multiple files, or entire folder structures.'
    },
    {
      q: 'What happens when a share expires?',
      a: 'Shares expire 10 minutes after they are created. The 6-digit OTP and QR link become immediately invalid, and our background cleanup job deletes the uploaded files from storage and cleans the records.'
    },
    {
      q: 'Can I upload whole folders or code projects?',
      a: 'Yes! TempShare supports folder uploads where browser permissions allow, preserving directory hierarchy so receivers can view and download individual files or download the entire tree as a single ZIP archive.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 mb-2">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Common questions about temporary transfers, security, and storage on TempShare.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-100 hover:text-blue-400 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
