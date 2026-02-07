'use client';

import { useRef, useState, useCallback } from 'react';
import { ImagePlus, Film, X, Loader2 } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  MAX_MEDIA_ATTACHMENTS,
  MAX_MEDIA_FILE_SIZE_MB,
  MAX_VIDEO_FILE_SIZE_MB,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from '@/lib/constants';
import type { MediaAttachment } from '@/types';

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const ACCEPT_STRING = ALLOWED_TYPES.join(',');

interface MediaUploaderProps {
  media: MediaAttachment[];
  onAdd: (attachment: MediaAttachment) => void;
  onRemove: (index: number) => void;
}

export default function MediaUploader({ media, onAdd, onRemove }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const isFull = media.length >= MAX_MEDIA_ATTACHMENTS;

  const processFile = useCallback(async (file: File) => {
    setError(null);

    // 타입 검증
    if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
      setError('지원하지 않는 파일 형식입니다');
      return;
    }

    // 크기 검증
    const isVideo = file.type.startsWith('video/');
    const maxMB = isVideo ? MAX_VIDEO_FILE_SIZE_MB : MAX_MEDIA_FILE_SIZE_MB;
    if (file.size > maxMB * 1024 * 1024) {
      setError(`파일 크기가 ${maxMB}MB를 초과합니다`);
      return;
    }

    setUploading(true);

    try {
      if (isSupabaseConfigured()) {
        // Supabase Storage 업로드
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/community/media', { method: 'POST', body: formData });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || '업로드 실패');
          return;
        }
        const { media: attachment } = await res.json();
        onAdd(attachment);
      } else {
        // Demo 모드: FileReader로 data URL 변환
        const dataUrl = await readFileAsDataUrl(file);
        onAdd({
          url: dataUrl,
          type: isVideo ? 'video' : 'image',
          size: file.size,
          filename: file.name,
        });
      }
    } catch {
      setError('파일 업로드 중 오류가 발생했습니다');
    } finally {
      setUploading(false);
    }
  }, [onAdd]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length && media.length + i < MAX_MEDIA_ATTACHMENTS; i++) {
      processFile(files[i]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length && media.length + i < MAX_MEDIA_ATTACHMENTS; i++) {
      processFile(files[i]);
    }
  };

  return (
    <div className="space-y-2">
      {/* 업로드 미리보기 */}
      {media.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {media.map((m, i) => (
            <div key={i} className="relative group">
              {m.type === 'image' ? (
                <img src={m.url} alt={m.filename || ''} className="h-16 w-16 rounded-lg object-cover border border-border" />
              ) : (
                <div className="h-16 w-16 rounded-lg border border-border bg-gray-900 flex items-center justify-center">
                  <Film className="h-6 w-6 text-white" />
                </div>
              )}
              <button
                onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 버튼/영역 */}
      {!isFull && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex items-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 text-xs transition-colors cursor-pointer ${
            dragOver ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          <span>{uploading ? '업로드 중...' : `사진/영상 첨부 (최대 ${MAX_MEDIA_ATTACHMENTS}개)`}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_STRING}
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
