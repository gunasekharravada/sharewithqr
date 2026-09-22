import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { copyText } from '../utils/clipboard.js';
import { toast } from '../utils/toast.js';

export function QrCodeDisplay({ qrDataUrl, shareUrl, otp }) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    const ok = await copyText(shareUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      toast.error("Couldn't copy the link. Please try again.");
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `tempshare_qr_${otp || 'code'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scan to Receive</p>

      {/* White quiet zone keeps the code readable and uncropped on any screen */}
      <div className="mx-auto mt-2.5 aspect-square w-full max-w-[12rem] rounded-xl border-2 border-slate-700/60 bg-white p-2 shadow-xl shadow-purple-500/10 sm:max-w-[13rem]">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR code that opens this share"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
            QR code unavailable
          </div>
        )}
      </div>

      <p className="mt-2 text-sm text-slate-400">Scan this code to open the share.</p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
        >
          {copiedLink ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copiedLink ? 'Link copied' : 'Copy link'}
        </button>
        <button
          type="button"
          onClick={handleDownloadQr}
          disabled={!qrDataUrl}
          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:pointer-events-none disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download QR
        </button>
      </div>
    </div>
  );
}
