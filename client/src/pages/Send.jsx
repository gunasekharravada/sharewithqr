import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader.jsx';
import { TextEditor } from '../components/TextEditor.jsx';
import { ExpirySelector } from '../components/ExpirySelector.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { api } from '../services/api.js';
import { toast } from '../utils/toast.js';
import { Upload, FileText, Send, Sparkles, AlertCircle } from 'lucide-react';

export function SendPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'text'
  const [files, setFiles] = useState([]);
  const [text, setText] = useState('');
  
  // Access options (shares always expire after a fixed 10 minutes, enforced by the server)
  const [maxAccesses, setMaxAccesses] = useState(0);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateShare = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'files') {
      if (files.length === 0) {
        setErrorMessage('Please select or drop at least one file to share.');
        return;
      }
    } else {
      if (!text.trim()) {
        setErrorMessage('Please enter or paste the text you want to share.');
        return;
      }
    }

    setIsUploading(true);

    try {
      let result;
      if (activeTab === 'text') {
        result = await api.createTextShare({
          text,
          maxAccesses
        });
      } else {
        const rawFiles = files.map((f) => f.file);
        const paths = files.map((f) => f.relativePath);

        result = await api.createFilesShare({
          files: rawFiles,
          paths,
          maxAccesses,
          onProgress: (prog) => {
            setUploadProgress(prog);
          }
        });
      }

      toast.success('Temporary share created successfully!');
      // Navigate to share result page
      navigate(`/share/${result.shareToken}`, { state: { shareData: result } });
    } catch (err) {
      console.error('Share creation error:', err);
      setErrorMessage(err.message || 'Failed to create share. Please try again.');
      toast.error(err.message || 'Failed to create share.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Create a Temporary Share
        </h1>
        <p className="text-sm text-slate-400">
          Upload files or paste text. Get a 6-digit code and QR code in seconds.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => { setActiveTab('files'); setErrorMessage(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'files'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Upload className="w-4 h-4" />
          Share Files & Folders
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('text'); setErrorMessage(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'text'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Share Text
        </button>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Area */}
      <form onSubmit={handleCreateShare} className="space-y-6">
        
        {/* Content Box */}
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 space-y-4">
          {activeTab === 'files' ? (
            <FileUploader files={files} setFiles={setFiles} />
          ) : (
            <TextEditor text={text} setText={setText} />
          )}
        </div>

        {/* Expiry & Access Options */}
        <ExpirySelector
          maxAccesses={maxAccesses}
          setMaxAccesses={setMaxAccesses}
        />

        {/* Live Upload Progress */}
        {isUploading && uploadProgress && (
          <ProgressBar progress={uploadProgress} />
        )}

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              Creating Temporary Share...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Create Temporary Share
            </span>
          )}
        </button>
      </form>

    </div>
  );
}
