import React, { useRef, useState } from 'react';
import { UploadCloud, FolderUp, X } from 'lucide-react';
import { formatBytes } from '../utils/formatters.js';
import { toast } from '../utils/toast.js';
import { MAX_FILE_SIZE_MB } from '../utils/constants.js';
import { FileTypeIcon } from './FileTypeIcon.jsx';

export function FileUploader({ files, setFiles, maxFileSizeMb = MAX_FILE_SIZE_MB }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFilesAdded = (incomingFiles) => {
    const allIncoming = Array.from(incomingFiles);

    // Each file is checked against the per-file size limit
    const maxBytes = maxFileSizeMb * 1024 * 1024;
    const tooLarge = allIncoming.filter((f) => f.size > maxBytes);
    const accepted = allIncoming.filter((f) => f.size <= maxBytes);

    if (tooLarge.length > 0) {
      toast.error({
        title: 'File too large',
        message:
          tooLarge.length === 1
            ? `"${tooLarge[0].name}" is larger than the ${maxFileSizeMb} MB limit. Please choose a smaller file.`
            : `${tooLarge.length} files are larger than the ${maxFileSizeMb} MB limit and were not added.`
      });
    }

    if (accepted.length === 0) return;

    const formatted = accepted.map((file) => ({
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

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-colors duration-150 sm:p-6 [@media(min-height:860px)]:sm:p-10 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-700 bg-slate-950/40 hover:border-slate-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          aria-label="Choose files"
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
          aria-label="Choose a folder"
          onChange={(e) => {
            if (e.target.files) handleFilesAdded(e.target.files);
            e.target.value = '';
          }}
        />

        <div className="flex flex-col items-center gap-3">
          <span className="hidden h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-blue-400 sm:flex [@media(max-height:760px)]:!hidden">
            <UploadCloud className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-100">Drop files here</p>
            <p className="text-sm text-slate-400">
              Any file type · up to {maxFileSizeMb} MB per file
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="btn btn-primary"
            >
              Select Files
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                folderInputRef.current?.click();
              }}
              className="btn btn-secondary"
            >
              <FolderUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Upload Folder
            </button>
          </div>
        </div>
      </div>

      {/* Selected files */}
      {files.length > 0 && (
        <div className="fade-up rounded-2xl border border-slate-800 bg-slate-950/40 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <p className="text-sm font-medium text-slate-200">
              {files.length} {files.length === 1 ? 'file' : 'files'} · {formatBytes(totalBytes)}
            </p>
            <button
              type="button"
              onClick={() => setFiles([])}
              className="-my-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-rose-300"
            >
              Remove all
            </button>
          </div>

          <ul className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-1">
            {files.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900 py-1.5 pl-3 pr-1.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileTypeIcon filename={item.name} mimeType={item.type} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {item.relativePath !== item.name ? item.relativePath : item.name}
                    </p>
                    <p className="text-xs text-slate-400">{formatBytes(item.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
