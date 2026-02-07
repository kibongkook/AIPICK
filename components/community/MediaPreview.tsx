'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { MediaAttachment } from '@/types';

interface MediaPreviewProps {
  media: MediaAttachment[];
  compact?: boolean;
}

/** 게시물 내 미디어 갤러리 (이미지 그리드 + 영상 플레이어) */
export default function MediaPreview({ media, compact }: MediaPreviewProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  const images = media.filter((m) => m.type === 'image');
  const videos = media.filter((m) => m.type === 'video');

  return (
    <div className="mt-2 space-y-2">
      {/* 이미지 그리드 */}
      {images.length > 0 && (
        <div className={`grid gap-2 ${gridClass(images.length, compact)}`}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxIdx(i)}
              className="relative overflow-hidden rounded-lg border border-border bg-gray-50 aspect-square"
            >
              <img
                src={img.url}
                alt={img.filename || `이미지 ${i + 1}`}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </button>
          ))}
        </div>
      )}

      {/* 영상 플레이어 */}
      {videos.map((vid, i) => (
        <div key={`v-${i}`} className="rounded-lg overflow-hidden border border-border bg-black">
          <video
            src={vid.url}
            controls
            preload="metadata"
            className={compact ? 'max-h-48 w-full' : 'max-h-80 w-full'}
          />
        </div>
      ))}

      {/* 라이트박스 */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={images[lightboxIdx]?.url}
            alt="확대 보기"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function gridClass(count: number, compact?: boolean): string {
  if (compact) return count === 1 ? 'grid-cols-1' : 'grid-cols-2';
  if (count === 1) return 'grid-cols-1 max-w-sm';
  if (count === 2) return 'grid-cols-2';
  if (count <= 4) return 'grid-cols-2';
  return 'grid-cols-3';
}
