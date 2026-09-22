import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ShareCodeDisplay } from '../components/ShareCodeDisplay.jsx';
import { QrCodeDisplay } from '../components/QrCodeDisplay.jsx';
import { formatCountdown } from '../utils/formatters.js';
import { api } from '../services/api.js';
import { toast } from '../utils/toast.js';
import {
  Clock,
  Trash2,
  Plus,
  Check,
  Loader2,
} from 'lucide-react';

export function ShareResult() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // The access code and QR are only returned once, at creation time.
  const shareData = location.state?.shareData || null;

  const [timeLeft, setTimeLeft] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live countdown
  useEffect(() => {
    if (!shareData?.expiresAt) return undefined;

    const update = () => {
      setTimeLeft(formatCountdown(shareData.expiresAt));
    };

    update();

    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [shareData?.expiresAt]);

  // Delete share
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await api.deleteShare(token || shareData?.shareToken);

      toast.success('Share deleted.');
      navigate('/');
    } catch {
      toast.error('The share could not be deleted. Please try again.');
      setIsDeleting(false);
    }
  };

  // Opened directly or page reloaded
  if (!shareData || !shareData.otp) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center sm:py-24">
        <h1 className="text-2xl font-bold text-white">
          Your access code isn't available here
        </h1>

        <p className="mt-3 text-sm text-slate-400">
          For your protection, the code and QR are only shown once, right after
          a share is created. You can create a new share at any time.
        </p>

        <Link
          to="/send"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create New Share
        </Link>
      </div>
    );
  }

  const shareUrl =
    shareData.shareUrl ||
    `${window.location.origin}/s/${shareData.shareToken}`;

  const expired = timeLeft === 'Expired';

  return (
    <div className="mx-auto w-full max-w-[850px] px-4 pt-3 pb-4 sm:px-6 sm:pt-3 sm:pb-4">

      {/* =========================
          HEADER
      ========================== */}
      <header className="text-center">
        <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <Check className="h-4 w-4" aria-hidden="true" />
        </span>

        <h1 className="mt-1.5 text-[clamp(1.3rem,3.2vw,1.6rem)] font-bold leading-tight tracking-tight text-white">
          Your share is ready
        </h1>

        <p className="mt-0.5 text-sm text-slate-400">
          Share the access code or scan the QR code to receive it.
        </p>
      </header>

      {/* =========================
          ACCESS CODE + QR
      ========================== */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">

        {/* ACCESS CODE CARD */}
        <section
          className="
            flex min-h-[400px]
            flex-col
            items-center
            justify-center
            rounded-xl
            border
            border-slate-800
            bg-slate-900/70
            p-4
          "
        >
          <ShareCodeDisplay code={shareData.otp} />

          <p className="mt-4 text-center text-xs text-slate-500">
            The receiver enters it on the Receive page.
          </p>
        </section>

        {/* QR CODE CARD */}
        <section
          className="
            flex min-h-[400px]
            flex-col
            items-center
            justify-center
            rounded-xl
            border
            border-slate-800
            bg-slate-900/70
            p-4
          "
        >
          <QrCodeDisplay
            qrDataUrl={shareData.qrCode}
            shareUrl={shareUrl}
            otp={shareData.otp}
          />
        </section>

      </div>

      {/* =========================
          EXPIRY COUNTDOWN
      ========================== */}
      <p
        className={`mt-3 flex items-center justify-center gap-2 text-sm ${
          expired ? 'text-rose-300' : 'text-slate-300'
        }`}
        role="timer"
      >
        <Clock className="h-4 w-4" aria-hidden="true" />

        {expired ? (
          'This share has expired.'
        ) : (
          <>
            Share expires in{' '}
            <strong className="font-mono font-semibold text-white">
              {timeLeft}
            </strong>
          </>
        )}
      </p>

      {/* =========================
          ACTIONS
      ========================== */}
      <div className="mt-3 border-t border-slate-800 pt-3">

        {confirmingDelete ? (

          /* DELETE CONFIRMATION */
          <div
            role="alertdialog"
            aria-labelledby="delete-title"
            className="mx-auto max-w-md rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-center"
          >
            <p
              id="delete-title"
              className="text-sm font-semibold text-white"
            >
              Delete this share now?
            </p>

            <p className="mt-1 text-sm text-slate-400">
              The code and QR will stop working immediately.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="
                  inline-flex
                  min-h-[44px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-rose-600
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  transition-colors
                  hover:bg-rose-500
                  disabled:pointer-events-none
                  disabled:opacity-50
                "
              >
                {isDeleting ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Deleting…
                  </>
                ) : (
                  'Yes, delete share'
                )}
              </button>

              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isDeleting}
                className="
                  inline-flex
                  min-h-[44px]
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-800
                  px-5
                  text-sm
                  font-semibold
                  text-slate-100
                  transition-colors
                  hover:bg-slate-700
                  disabled:pointer-events-none
                  disabled:opacity-50
                "
              >
                Keep share
              </button>

            </div>
          </div>

        ) : (

          /* NORMAL ACTIONS */
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">

            <Link
              to="/send"
              className="
                inline-flex
                min-h-[44px]
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                text-sm
                font-semibold
                text-white
                transition-colors
                hover:bg-blue-500
              "
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create New Share
            </Link>

            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="
                inline-flex
                min-h-[44px]
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-rose-500/30
                px-5
                text-sm
                font-semibold
                text-rose-300
                transition-colors
                hover:bg-rose-500/10
              "
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete Share
            </button>

          </div>

        )}

      </div>
    </div>
  );
}