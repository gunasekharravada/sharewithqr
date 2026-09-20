import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Camera, KeyRound, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { QrScannerModal } from '../components/QrScannerModal.jsx';
import { api } from '../services/api.js';
import { toast } from '../utils/toast.js';

export function ReceivePage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleDigitChange = (index, value) => {
    // Handle paste of whole 6-digit code
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
    }
  };

  const fullOtp = digits.join('');

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit share code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const result = await api.verifyOtp(fullOtp);
      toast.success('Share found! Loading content...');
      navigate(`/s/${result.shareToken}`);
    } catch (err) {
      setErrorMessage(err.message || 'The code you entered is invalid or expired.');
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (decodedText) => {
    setScannerOpen(false);
    // Parse URL to check if it matches /s/:token
    try {
      if (decodedText.includes('/s/')) {
        const parts = decodedText.split('/s/');
        const token = parts[1]?.split('?')[0]?.split('/')[0];
        if (token) {
          navigate(`/s/${token}`);
          return;
        }
      }
      
      // If it is just a 6-digit OTP in the QR
      const clean = decodedText.replace(/\D/g, '');
      if (clean.length === 6) {
        const newDigits = clean.split('');
        setDigits(newDigits);
        api.verifyOtp(clean).then((res) => {
          navigate(`/s/${res.shareToken}`);
        }).catch((err) => {
          setErrorMessage(err.message || 'Invalid code from QR.');
        });
        return;
      }

      toast.error('Scanned QR code does not appear to be a valid TempShare link.');
    } catch (err) {
      toast.error('Could not process scanned QR code.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
          <Download className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Receive a Temporary Share
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Enter the 6-digit code or scan the QR code to access the files or text.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-3 text-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Enter 6-Digit Code
            </label>

            {/* 6-Digit Inputs */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  autoFocus={idx === 0}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold font-mono text-white bg-slate-950 border-2 border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl outline-none transition-all"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={fullOtp.length !== 6 || loading}
            className="w-full py-4 rounded-2xl text-base font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                Accessing Share...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Receive Content
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            )}
          </button>
        </form>

        {/* QR Code Scanner Option */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold uppercase text-slate-500">OR</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors flex items-center justify-center gap-2.5"
        >
          <Camera className="w-4 h-4 text-purple-400" />
          Scan QR Code with Camera
        </button>
      </div>

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

    </div>
  );
}
