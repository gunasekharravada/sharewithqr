import React, { useState } from 'react';
import { QrCode, Copy, Download, Check, MessageSquare, Send, Mail } from 'lucide-react';
import { toast } from '../utils/toast.js';

export function QrCodeDisplay({ qrDataUrl, shareUrl, otp }) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success('Share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `tempshare_qr_${otp || 'code'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR Code downloaded!');
  };

  const encodedUrl = encodeURIComponent(shareUrl || '');
  const shareText = encodeURIComponent(`Here is a temporary share on TempShare (Code: ${otp}): `);

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center gap-2">
        <QrCode className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Scan QR Code
        </span>
      </div>

      {/* QR Code Canvas/Image */}
      <div className="p-3 bg-white rounded-2xl shadow-xl shadow-purple-500/10 border-2 border-slate-700/60">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="TempShare QR Code"
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
          />
        ) : (
          <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
            Generating QR...
          </div>
        )}
      </div>

      {/* Primary Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-95"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          {copiedLink ? 'Link Copied' : 'Copy Link'}
        </button>

        <button
          type="button"
          onClick={handleDownloadQr}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          Download QR
        </button>
      </div>

      {/* Social quick shares */}
      <div className="pt-3 border-t border-slate-800 w-full text-center space-y-2">
        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          Quick Share Via
        </p>
        <div className="flex items-center justify-center gap-2">
          <a
            href={`https://wa.me/?text=${shareText}${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodedUrl}&text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Telegram
          </a>
          <a
            href={`mailto:?subject=Temporary%20TempShare%20File%20&body=${shareText}${encodedUrl}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
