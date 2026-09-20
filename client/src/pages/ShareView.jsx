import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, File, FileText, Image, Video, Music, Archive, Code, Copy, Check, Clock, Flame, AlertCircle, Sparkles, FolderArchive, ArrowLeft } from 'lucide-react';
import { formatBytes, formatTimeRemaining, getTextStats } from '../utils/formatters.js';
import { api } from '../services/api.js';
import { toast } from '../utils/toast.js';

export function ShareView() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(null);
  const [error, setError] = useState('');

  const [timeLeft, setTimeLeft] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  const fetchShareContent = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await api.getShare(token);
      setShareData(data);
    } catch (err) {
      setError(err.message || 'Share not found or has expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchShareContent();
    }
  }, [token]);

  // Live countdown timer
  useEffect(() => {
    if (!shareData?.expiresAt) return;

    const updateTimer = () => {
      const remaining = formatTimeRemaining(shareData.expiresAt);
      setTimeLeft(remaining);
      if (remaining === 'Expired') {
        setError('This temporary share has expired.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [shareData?.expiresAt]);

  const handleCopyText = () => {
    if (!shareData?.textContent) return;
    navigator.clipboard.writeText(shareData.textContent);
    setCopiedText(true);
    toast.success('Text copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!shareData?.textContent) return;
    const element = document.createElement('a');
    const file = new Blob([shareData.textContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `tempshare_${token.substring(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Text downloaded.');
  };

  const getFileIcon = (filename, mimeType = '') => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-purple-400 shrink-0" />;
    }
    if (['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(ext) || mimeType.startsWith('video/')) {
      return <Video className="w-5 h-5 text-rose-400 shrink-0" />;
    }
    if (['mp3', 'wav', 'aac', 'm4a', 'ogg'].includes(ext) || mimeType.startsWith('audio/')) {
      return <Music className="w-5 h-5 text-amber-400 shrink-0" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Archive className="w-5 h-5 text-emerald-400 shrink-0" />;
    }
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'json', 'xml', 'sql'].includes(ext)) {
      return <Code className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
      return <FileText className="w-5 h-5 text-blue-400 shrink-0" />;
    }
    return <File className="w-5 h-5 text-slate-400 shrink-0" />;
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-blue-500 mx-auto animate-spin" />
        <p className="text-base text-slate-300 font-medium">Retrieving temporary share...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Share Unavailable</h2>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to TempShare
        </Link>
      </div>
    );
  }

  const textStats = shareData?.shareType === 'text' ? getTextStats(shareData.textContent) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      
      {/* Top Banner & Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">
              Shared by TempShare
            </h1>
            <p className="text-xs text-slate-400">
              {shareData?.shareType === 'files'
                ? `${shareData.fileCount} ${shareData.fileCount === 1 ? 'file' : 'files'} • ${formatBytes(shareData.totalSize)}`
                : 'Temporary Text Share'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Expires in: {timeLeft || 'Active'}</span>
          </div>
        </div>
      </div>

      {/* Burn After Reading Notification */}
      {shareData?.isBurnedNow && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3">
          <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Burn after reading triggered:</strong> This share has been marked as accessed and is now permanently deleted from temporary storage.
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {shareData?.shareType === 'files' ? (
        /* FILES SHARING VIEW */
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Attached Files</h2>
              <p className="text-xs text-slate-400">
                Click download to save files to your device.
              </p>
            </div>

            {shareData.fileCount > 1 && (
              <a
                href={api.getDownloadAllUrl(token)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <FolderArchive className="w-4 h-4" />
                Download All as ZIP
              </a>
            )}
          </div>

          {/* Files List */}
          <div className="space-y-3">
            {shareData.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  {getFileIcon(file.original_filename, file.mime_type)}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {file.relative_path || file.original_filename}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatBytes(file.file_size)}
                    </p>
                  </div>
                </div>

                <a
                  href={api.getDownloadUrl(token, file.id)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TEXT SHARING VIEW */
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Shared Text Content</h2>
              <p className="text-xs text-slate-400">
                {textStats?.words.toLocaleString()} words • {textStats?.chars.toLocaleString()} characters
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-95"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedText ? 'Copied' : 'Copy Text'}
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download .txt
              </button>
            </div>
          </div>

          {/* Text Area display */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-sm leading-relaxed text-slate-200 whitespace-pre-wrap break-words max-h-[500px] overflow-y-auto select-all">
            {shareData?.textContent}
          </div>
        </div>
      )}

      {/* Action to create another share */}
      <div className="text-center pt-4">
        <Link
          to="/send"
          className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors"
        >
          Need to send something else? Create a temporary share →
        </Link>
      </div>

    </div>
  );
}
