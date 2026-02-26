'use client';

import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';

interface PlaygroundImageResultProps {
  dataUrl: string;
  mimeType?: string;
  onRetry?: () => void;
  onUseNext?: (dataUrl: string) => void;
  hasNextStep?: boolean;
}

export default function PlaygroundImageResult({
  dataUrl,
  mimeType = 'image/png',
  onRetry,
  onUseNext,
  hasNextStep = false,
}: PlaygroundImageResultProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleDownload = () => {
    const ext = mimeType.split('/')[1] || 'png';
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `aipick-generated.${ext}`;
    link.click();
  };

  return (
    <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50/50 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 bg-purple-100/60 border-b border-purple-200">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          <span className="text-xs font-medium text-purple-700">이미지 생성 완료</span>
        </div>
        <div className="flex items-center gap-1">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-white/60 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              다시
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-white/60 transition-colors"
          >
            <Download className="h-3 w-3" />
            다운로드
          </button>
        </div>
      </div>

      {/* 이미지 */}
      <div className="p-3 flex justify-center">
        {!isLoaded && (
          <div className="w-full h-48 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
            <span className="text-xs text-gray-400">이미지 로딩 중...</span>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt="AI 생성 이미지"
          className={`max-h-64 w-auto rounded-lg shadow-sm ${isLoaded ? 'block' : 'hidden'}`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* 다음 단계에서 사용 */}
      {hasNextStep && onUseNext && (
        <div className="px-3 pb-3">
          <button
            onClick={() => onUseNext(dataUrl)}
            className="w-full mt-2 text-xs text-primary border border-primary/30 rounded-lg py-2 hover:bg-primary/5 transition-colors font-medium"
          >
            다음 단계에서 사용하기 →
          </button>
        </div>
      )}
    </div>
  );
}
