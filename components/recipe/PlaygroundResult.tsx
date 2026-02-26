'use client';

import PlaygroundTextResult from './PlaygroundTextResult';
import PlaygroundImageResult from './PlaygroundImageResult';
import type { ExecutionType } from '@/types';

interface PlaygroundResultProps {
  type: ExecutionType;
  text?: string;
  imageDataUrl?: string;
  imageMimeType?: string;
  isStreaming?: boolean;
  onRetry?: () => void;
  onUseNext?: (value: string) => void;
  hasNextStep?: boolean;
}

export default function PlaygroundResult({
  type,
  text,
  imageDataUrl,
  imageMimeType,
  isStreaming,
  onRetry,
  onUseNext,
  hasNextStep,
}: PlaygroundResultProps) {
  if (type === 'image' && imageDataUrl) {
    return (
      <PlaygroundImageResult
        dataUrl={imageDataUrl}
        mimeType={imageMimeType}
        onRetry={onRetry}
        onUseNext={onUseNext}
        hasNextStep={hasNextStep}
      />
    );
  }

  if ((type === 'text' || type === 'code') && text !== undefined) {
    return (
      <PlaygroundTextResult
        text={text}
        isStreaming={isStreaming}
        onRetry={onRetry}
        onUseNext={onUseNext}
        hasNextStep={hasNextStep}
      />
    );
  }

  return null;
}
