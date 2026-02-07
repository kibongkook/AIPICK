'use client';

import { useState } from 'react';
import { cn, getAvatarColor } from '@/lib/utils';

interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * 2단계 폴백 로고 이미지:
 * 1차: 원본 URL (큐레이션 or Google Favicon)
 * 2차: Google Favicon V2 128px (원본 실패 시)
 * 3차: 컬러 아바타 (모두 실패 시)
 */
export default function LogoImage({ src, alt, className, fallbackClassName }: LogoImageProps) {
  const [errorCount, setErrorCount] = useState(0);

  // 3차: 컬러 아바타
  if (errorCount >= 2) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl text-white font-bold',
          fallbackClassName || className,
          getAvatarColor(alt)
        )}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  // Google Favicon V2 폴백 URL 생성
  const getFallbackUrl = () => {
    // 원본에서 도메인 추출 시도
    try {
      // Google Favicon URL에서 domain 파라미터 추출
      const googleMatch = src.match(/domain=([^&]+)/);
      if (googleMatch) return `https://www.google.com/s2/favicons?domain=${googleMatch[1]}&sz=64`;
      // 일반 URL에서 도메인 추출
      const url = new URL(src);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
    } catch {
      return null;
    }
  };

  const currentSrc = errorCount === 0 ? src : (getFallbackUrl() || src);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrorCount((c) => c + 1)}
    />
  );
}
