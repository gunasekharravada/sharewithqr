import React from 'react';
import { File, FileText, Image, Video, Music, Archive, Code } from 'lucide-react';

const EXT = {
  image: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
  video: ['mp4', 'mov', 'mkv', 'avi', 'webm'],
  audio: ['mp3', 'wav', 'aac', 'm4a', 'ogg'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
  code: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'json', 'xml', 'sql'],
  doc: ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx']
};

// One neutral icon colour keeps file lists calm and consistent.
export function FileTypeIcon({ filename = '', mimeType = '', className = 'h-5 w-5 shrink-0 text-slate-400' }) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const props = { className, 'aria-hidden': true };

  if (EXT.image.includes(ext) || mimeType.startsWith('image/')) return <Image {...props} />;
  if (EXT.video.includes(ext) || mimeType.startsWith('video/')) return <Video {...props} />;
  if (EXT.audio.includes(ext) || mimeType.startsWith('audio/')) return <Music {...props} />;
  if (EXT.archive.includes(ext)) return <Archive {...props} />;
  if (EXT.code.includes(ext)) return <Code {...props} />;
  if (EXT.doc.includes(ext)) return <FileText {...props} />;
  return <File {...props} />;
}
