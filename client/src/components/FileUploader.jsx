import React, { useRef, useState } from 'react';
import { UploadCloud, FolderUp, File, FileText, Image, Video, Music, Archive, Code, X, AlertCircle } from 'lucide-react';
import { formatBytes } from '../utils/formatters.js';

// Per-file limit; keep in sync with the server's MAX_FILE_SIZE_MB (Supabase Free plan: 50 MB).
const DEFAULT_MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 50;

export function FileUploader({ files, setFiles, maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

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

  const handleFilesAdded = (incomingFiles) => {
    const allIncoming = Array.from(incomingFiles);
    
    // Check each file against the per-file size limit
    const maxBytes = maxFileSizeMb * 1024 * 1024;
    const tooLarge = allIncoming.filter((f) => f.size > maxBytes);
    const newFileList = allIncoming.filter((f) => f.size <= maxBytes);

    if (tooLarge.length > 0) {
      alert(
        tooLarge.length === 1
          ? `"${tooLarge[0].name}" is larger than the ${maxFileSizeMb} MB per-file limit and was not added.`
          : `${tooLarge.length} files are larger than the ${maxFileSizeMb} MB per-file limit and were not added.`
      );
    }

    if (newFileList.length === 0) return;

    const formatted = newFileList.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      relativePath: file.webkitRelativePath || file.name,
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`
    }));

    setFiles((prev) => [...prev, ...formatted]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFilesAdded(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFilesAdded(e.target.files);
            e.target.value = '';
          }}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <UploadCloud className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-200">
              Drag & Drop files or folders here
            </p>
            <p className="text-xs text-slate-400">
              Supports Images, Videos, Audio, Documents, Code & Archives up to {maxFileSizeMb} MB per file
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-colors"
            >
              Select Files
            </button>
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              <FolderUp className="w-4 h-4 text-slate-400" />
              Upload Folder
            </button>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">
                {files.length} {files.length === 1 ? 'file' : 'files'} selected
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                Total size: {formatBytes(totalBytes)}
              </span>
            </div>
            <button
              type="button"
              onClick={clearAllFiles}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium"
            >
              Remove All
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {files.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {getFileIcon(item.name, item.type)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {item.relativePath !== item.name ? item.relativePath : item.name}
                    </p>
                    <p className="text-xs text-slate-400">{formatBytes(item.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
