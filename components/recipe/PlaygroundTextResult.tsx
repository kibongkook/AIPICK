'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

interface PlaygroundTextResultProps {
  text: string;
  isStreaming?: boolean;
  onRetry?: () => void;
  onUseNext?: (text: string) => void;
  hasNextStep?: boolean;
}

export default function PlaygroundTextResult({
  text,
  isStreaming = false,
  onRetry,
  onUseNext,
  hasNextStep = false,
}: PlaygroundTextResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-100/60 border-b border-emerald-200">
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-xs font-medium text-emerald-700">
            {isStreaming ? '생성 중...' : '생성 완료'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onRetry && !isStreaming && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-white/60 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              다시
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-white/60 transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
      </div>

      {/* 결과 텍스트 */}
      <div className="p-3 max-h-64 overflow-y-auto">
        <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
          {text}
          {isStreaming && <span className="inline-block w-1 h-3 bg-primary animate-pulse ml-0.5 align-middle" />}
        </pre>
      </div>

      {/* 다음 단계에서 사용 */}
      {!isStreaming && hasNextStep && onUseNext && (
        <div className="px-3 pb-3">
          <button
            onClick={() => onUseNext(text)}
            className="w-full mt-2 text-xs text-primary border border-primary/30 rounded-lg py-2 hover:bg-primary/5 transition-colors font-medium"
          >
            다음 단계에서 사용하기 →
          </button>
        </div>
      )}
    </div>
  );
}
