import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ShareCodeDisplay } from '../components/ShareCodeDisplay.jsx';
import { QrCodeDisplay } from '../components/QrCodeDisplay.jsx';
import { formatTimeRemaining } from '../utils/formatters.js';
import { api } from '../services/api.js';
import { toast } from '../utils/toast.js';
import { Clock, ShieldAlert, Trash2, Plus, Sparkles } from 'lucide-react';

export function ShareResult() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [shareData, setShareData] = useState(location.state?.shareData || null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (!shareData && token) {
      // Fallback: fetch share metadata if user reloaded the page
      api.getShare(token).then((data) => {
        setShareData(data);
      }).catch((err) => {
        toast.error('Could not load share details or share has expired.');
      });
    }
  }, [token, shareData]);

  // Live countdown timer
  useEffect(() => {
    if (!shareData?.expiresAt) return;

    const updateTimer = () => {
      const remaining = formatTimeRemaining(shareData.expiresAt);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [shareData?.expiresAt]);

  const handleDeleteNow = async () => {
    if (!window.confirm('Are you sure you want to permanently delete and revoke this share now?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteShare(token || shareData?.shareToken);
      toast.success('Share revoked and deleted permanently.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete share.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!shareData) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Sparkles className="w-8 h-8 text-blue-400 mx-auto animate-spin" />
        <p className="text-slate-300">Loading share details...</p>
      </div>
    );
  }

  const shareUrl = shareData.shareUrl || `${window.location.origin}/s/${shareData.shareToken}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Share Created Successfully! 🎉
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Your Share is Ready
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Give the 6-digit code or share the QR code with anyone to let them access your content.
        </p>
      </div>

      {/* Countdown Timer Badge */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-700/80 text-sm font-mono font-semibold text-blue-300 shadow-md">
          <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>Expires in: <strong className="text-white">{timeLeft || 'Calculating...'}</strong></span>
        </div>
      </div>

      {/* Core Code & QR Sharing Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Left: 6-digit OTP */}
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6 space-y-4">
          <ShareCodeDisplay code={shareData.otp} />
          
          <div className="space-y-1 text-center pt-2">
            <p className="text-xs text-slate-400">
              Receiver can enter this code at:
            </p>
            <p className="text-xs font-mono text-blue-400 font-semibold">
              {window.location.origin}/receive
            </p>
          </div>
        </div>

        {/* Right: QR Code */}
        <div className="flex flex-col items-center justify-center pt-2 md:pt-0">
          <QrCodeDisplay
            qrDataUrl={shareData.qrCode}
            shareUrl={shareUrl}
            otp={shareData.otp}
          />
        </div>
      </div>

      {/* Metadata & Security Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
        {shareData.shareType === 'files' && shareData.fileCount && (
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            {shareData.fileCount} {shareData.fileCount === 1 ? 'file' : 'files'}
          </span>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <Link
          to="/send"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Another Share
        </Link>

        <button
          type="button"
          onClick={handleDeleteNow}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Revoke & Delete Now
        </button>
      </div>

    </div>
  );
}
