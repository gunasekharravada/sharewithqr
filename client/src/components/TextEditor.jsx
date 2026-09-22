import React, { useRef } from 'react';
import { Copy, Download, Check, Trash2, Code2, AlignLeft } from 'lucide-react';
import { getTextStats } from '../utils/formatters.js';
import { toast } from '../utils/toast.js';

export function TextEditor({ text, setText, maxChars = 100000 }) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = React.useState(false);
  const [isMonospace, setIsMonospace] = React.useState(false);

  const stats = getTextStats(text);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!text) return;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `tempshare_text_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Text downloaded as .txt');
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="space-y-3">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMonospace(!isMonospace)}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isMonospace
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            {isMonospace ? <Code2 className="w-3.5 h-3.5" /> : <AlignLeft className="w-3.5 h-3.5" />}
            {isMonospace ? 'Monospace / Code' : 'Normal Font'}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={!text}
            className="px-3 py-2.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-40"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            className="inline-flex items-center gap-1 px-3 py-2.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            Copy
          </button>
          <button
            type="button"
            onClick={handleDownloadTxt}
            disabled={!text}
            className="inline-flex items-center gap-1 px-3 py-2.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Download TXT
          </button>
          {text && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2.5 sm:p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Clear text"
              aria-label="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Box */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          aria-label="Text to share"
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= maxChars) {
              setText(e.target.value);
            }
          }}
          placeholder="Type or paste the text you want to share…"
          className={`w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-colors resize-y h-[clamp(7rem,26vh,18rem)] ${
            isMonospace ? 'font-mono text-sm leading-relaxed' : 'font-sans text-sm leading-relaxed'
          }`}
        />
      </div>

      {/* Stats counter bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <span><strong>{stats.words.toLocaleString()}</strong> words</span>
          <span>•</span>
          <span><strong>{stats.lines.toLocaleString()}</strong> lines</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <span className={stats.chars >= maxChars ? 'text-rose-400 font-bold' : 'text-slate-300'}>
            {stats.chars.toLocaleString()}
          </span>
          <span>/</span>
          <span>{maxChars.toLocaleString()} characters</span>
        </div>
      </div>
    </div>
  );
}
