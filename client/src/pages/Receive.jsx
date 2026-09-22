import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
import { QrScannerModal } from '../components/QrScannerModal.jsx';
import { api } from '../services/api.js';
import { toast } from '../utils/toast.js';
import { getFriendlyError } from '../utils/errors.js';

export function ReceivePage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { title, message }
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleDigitChange = (index, value) => {
    setError(null);

    // Handle paste of a whole 6-digit code
    if (value.length > 1) {
      const clean = value.replace(/\D/g, '').slice(0, 6);
      if (clean.length > 0) {
        const newDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = clean[i] || '';
        }
        setDigits(newDigits);
        const nextIdx = Math.min(clean.length, 5);
        inputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    // Single digit input
    const cleanDigit = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    setDigits(newDigits);

    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const fullOtp = digits.join('');

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    if (fullOtp.length !== 6) {
      setError({ title: 'Enter the full code', message: 'The access code has 6 digits.' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.verifyOtp(fullOtp);
      navigate(`/s/${result.shareToken}`);
    } catch (err) {
      setError(getFriendlyError(err));
      setLoading(false);
    }
  };

  const handleScanSuccess = (decodedText) => {
    setScannerOpen(false);
    // A TempShare link contains /s/:token
    try {
      if (decodedText.includes('/s/')) {
        const parts = decodedText.split('/s/');
        const token = parts[1]?.split('?')[0]?.split('/')[0];
        if (token) {
          navigate(`/s/${token}`);
          return;
        }
      }

      // Or just a 6-digit code
      const clean = decodedText.replace(/\D/g, '');
      if (clean.length === 6) {
        setDigits(clean.split(''));
        setLoading(true);
        api.verifyOtp(clean).then((res) => {
          navigate(`/s/${res.shareToken}`);
        }).catch((err) => {
          setError(getFriendlyError(err));
          setLoading(false);
        });
        return;
      }

      toast.error({ title: 'Not a TempShare code', message: 'That QR code does not open a TempShare share.' });
    } catch {
      toast.error({ title: 'Something went wrong', message: 'We could not read that QR code. Please try again.' });
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 sm:px-6 sm:py-8 [@media(min-height:860px)]:sm:py-16">
      {/* Header */}
      <div className="mb-4 text-center sm:mb-5 [@media(min-height:860px)]:sm:mb-8">
        <h1 className="text-[clamp(1.5rem,4.5vw,2.25rem)] font-bold leading-tight tracking-tight text-white">
          Receive a Share
        </h1>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-400">
          Enter the access code or scan the QR code to open your temporary share.
        </p>
      </div>

      <div className="card space-y-4 p-4 sm:space-y-5 sm:p-6">
        <form onSubmit={handleVerify} noValidate className="space-y-4">
          <div role="group" aria-labelledby="code-label" className="space-y-3">
            <p id="code-label" className="text-center text-xs font-medium uppercase tracking-wider text-slate-400">
              6-digit access code
            </p>

            <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                  maxLength={6}
                  value={digit}
                  autoFocus={idx === 0}
                  aria-label={`Digit ${idx + 1} of 6`}
                  aria-invalid={error ? 'true' : undefined}
                  aria-describedby={error ? 'receive-error' : undefined}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onFocus={(e) => e.target.select()}
                  className={`h-14 w-full min-w-0 rounded-lg border bg-slate-950 text-center font-mono text-2xl font-semibold text-white transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:h-14 sm:rounded-xl sm:text-3xl [@media(min-height:800px)]:sm:h-16 ${
                    error ? 'border-rose-500/60' : 'border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div id="receive-error" role="alert" className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
              <div>
                <p className="font-semibold text-rose-100">{error.title}</p>
                <p className="mt-0.5 text-rose-200/90">{error.message}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={fullOtp.length !== 6 || loading}
            aria-busy={loading}
            className="btn btn-primary btn-lg w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Checking Share…
              </>
            ) : (
              'Receive Share'
            )}
          </button>
        </form>

        {/* OR divider */}
        <div className="flex items-center gap-4" aria-hidden="true">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="btn btn-secondary w-full"
          >
            <Camera className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Scan QR Code
          </button>
          <p className="text-center text-xs text-slate-500">
            Uses your camera only to read the code. Nothing is recorded or uploaded.
          </p>
        </div>
      </div>

      <p className="mt-5 hidden text-center text-sm text-slate-500 [@media(min-height:820px)]:block">
        Your temporary share will open here once the code is checked.
      </p>

      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
