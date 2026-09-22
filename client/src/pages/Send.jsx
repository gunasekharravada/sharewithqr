import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader.jsx';
import { TextEditor } from '../components/TextEditor.jsx';
import { ExpirySelector } from '../components/ExpirySelector.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { api } from '../services/api.js';
import { toast } from '../utils/toast.js';
import { getFriendlyError } from '../utils/errors.js';
import { DEFAULT_EXPIRY_MINUTES } from '../utils/constants.js';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';

export function SendPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'text'
  const [files, setFiles] = useState([]);
  const [text, setText] = useState('');

  // Options (the backend only accepts 5 or 10 minutes; default 10)
  const [expiryMinutes, setExpiryMinutes] = useState(DEFAULT_EXPIRY_MINUTES);
  const [maxAccesses, setMaxAccesses] = useState(0);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const submitLock = useRef(false); // blocks duplicate submissions instantly

  const handleCreateShare = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;
    setValidationMessage('');

    if (activeTab === 'files') {
      if (files.length === 0) {
        setValidationMessage('Please select or drop at least one file to share.');
        return;
      }
    } else if (!text.trim()) {
      setValidationMessage('Please enter or paste the text you want to share.');
      return;
    }

    submitLock.current = true;
    setIsUploading(true);

    try {
      let result;
      let summary;

      if (activeTab === 'text') {
        result = await api.createTextShare({ text, maxAccesses, expiryMinutes });
        summary = { kind: 'text', preview: text.trim().slice(0, 240), chars: text.length };
      } else {
        const rawFiles = files.map((f) => f.file);
        const paths = files.map((f) => f.relativePath);

        result = await api.createFilesShare({
          files: rawFiles,
          paths,
          maxAccesses,
          expiryMinutes,
          onProgress: (prog) => setUploadProgress(prog)
        });
        summary = {
          kind: 'files',
          files: files.map((f) => ({ name: f.relativePath || f.name, size: f.size })),
          totalSize: files.reduce((sum, f) => sum + f.size, 0)
        };
      }

      // Go straight to the Share Ready screen
      navigate(`/share/${result.shareToken}`, { state: { shareData: { ...result, summary } } });
    } catch (err) {
      console.error('Share creation error:', err);
      toast.error(getFriendlyError(err));
      submitLock.current = false;
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const tabClass = (tab) =>
    `flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
      activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-5 pb-0 sm:px-6 sm:pt-7 [@media(min-height:900px)]:sm:pt-12 [@media(min-height:900px)]:sm:pb-6">
      {/* Header */}
      <div className="mb-4 text-center sm:mb-5 [@media(min-height:900px)]:sm:mb-8">
        <h1 className="text-[clamp(1.5rem,4.5vw,2.25rem)] font-bold leading-tight tracking-tight text-white">
          What do you want to share?
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-400">
          Add files or text. You'll get an access code and a QR code.
        </p>
      </div>

      <form onSubmit={handleCreateShare} noValidate className="space-y-3 sm:space-y-4">
        {/* Content */}
        <div className="card space-y-3 p-3 sm:p-4">
          <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1" role="tablist" aria-label="What to share">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'files'}
              onClick={() => { setActiveTab('files'); setValidationMessage(''); }}
              className={tabClass('files')}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Files
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'text'}
              onClick={() => { setActiveTab('text'); setValidationMessage(''); }}
              className={tabClass('text')}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Text
            </button>
          </div>

          {activeTab === 'files' ? (
            <FileUploader files={files} setFiles={setFiles} />
          ) : (
            <TextEditor text={text} setText={setText} />
          )}
        </div>

        {/* Expires In + Access Limit */}
        <ExpirySelector
          expiryMinutes={expiryMinutes}
          setExpiryMinutes={setExpiryMinutes}
          maxAccesses={maxAccesses}
          setMaxAccesses={setMaxAccesses}
        />

        {validationMessage && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{validationMessage}</span>
          </div>
        )}

        {isUploading && uploadProgress && <ProgressBar progress={uploadProgress} />}

        {/* Always visible at the bottom of the screen, so Create Share never
            ends up below the fold on phones or short laptop screens */}
        <div className="sticky bottom-0 z-10 -mx-4 bg-gradient-to-t from-slate-950 from-75% to-transparent px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4 sm:mx-0 sm:px-0">
          <button
            type="submit"
            disabled={isUploading}
            aria-busy={isUploading}
            className="btn btn-primary btn-lg w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Creating Share…
              </>
            ) : (
              'Create Share'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
