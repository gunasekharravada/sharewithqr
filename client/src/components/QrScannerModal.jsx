import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Image, AlertCircle } from 'lucide-react';

export function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return undefined;
    }

    setError('');
    setIsScanning(false);
    const html5QrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 220, height: 220 } };

    html5QrCode.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        handleSuccess(decodedText);
      },
      () => {
        // scan errors (no code in frame yet) are ignored
      }
    ).then(() => {
      setIsScanning(true);
    }).catch((err) => {
      console.warn('Camera access error:', err);
      setError('We could not open your camera. You can allow camera access in your browser, or choose a photo or screenshot of the QR code instead.');
    });

    // Close on Escape
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
      }).catch((e) => console.error(e));
    }
  };

  const handleSuccess = (decodedText) => {
    stopScanner();
    onScanSuccess(decodedText);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-file-dummy');
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      handleSuccess(decodedText);
    } catch (err) {
      setError('We could not find a QR code in that image. Please try a clearer photo or screenshot.');
    }
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/70 p-3 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="pop-in relative my-auto w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="qr-modal-title" className="flex items-center gap-2 text-base font-semibold text-white">
              <Camera className="h-5 w-5 text-blue-400" aria-hidden="true" />
              Scan QR Code
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Your browser will ask to use the camera. It's only used to read the QR code; nothing is recorded or uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close scanner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Camera view: always mounted so the scanner has a target */}
        <div
          className={`overflow-hidden rounded-xl border border-slate-800 bg-black ${
            error && !isScanning ? 'hidden' : 'aspect-square max-h-[55vh] w-full'
          }`}
        >
          <div id="qr-reader" className="h-full w-full" />
        </div>

        <div id="qr-reader-file-dummy" className="hidden" />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Choose an image containing a QR code"
          onChange={handleFileUpload}
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary w-full">
          <Image className="h-4 w-4 text-slate-400" aria-hidden="true" />
          Use a photo or screenshot instead
        </button>
      </div>
    </div>
  );
}
