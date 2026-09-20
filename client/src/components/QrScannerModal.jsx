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
      return;
    }

    const html5QrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        handleSuccess(decodedText);
      },
      (errorMessage) => {
        // scan error ignored
      }
    ).then(() => {
      setIsScanning(true);
    }).catch((err) => {
      console.warn('Camera access error:', err);
      setError('Camera permission denied or camera not available. You can upload an image with a QR code below.');
    });

    return () => {
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
      setError('Could not detect a valid QR code in the selected image.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Scan TempShare QR</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-black aspect-square flex items-center justify-center border border-slate-800">
            <div id="qr-reader" className="w-full h-full" />
          </div>
        )}

        <div id="qr-reader-file-dummy" className="hidden" />

        <div className="pt-2 flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Image className="w-4 h-4 text-slate-400" />
            Scan QR from Photo / Screenshot
          </button>
        </div>
      </div>
    </div>
  );
}
