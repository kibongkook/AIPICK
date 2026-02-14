'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { LoginPrompt } from '@/components/auth/AuthGuard';
import MediaUploader from '@/components/community/MediaUploader';
import { saveLocalProvocation } from '@/lib/provocation/localStorage';
import {
  MIN_PROVOCATION_DESCRIPTION_LENGTH,
  MAX_PROVOCATION_DESCRIPTION_LENGTH,
} from '@/lib/constants';
import type { MediaAttachment } from '@/types';

interface ProvocationFormProps {
  onSuccess?: (provocationId: string) => void;
  compact?: boolean;
}

export default function ProvocationForm({ onSuccess, compact = false }: ProvocationFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return <LoginPrompt message="도발하려면 로그인이 필요합니다." />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || submitting) return;

    setSubmitting(true);

    try {
      // 첫 줄을 제목으로, 전체를 설명으로 사용
      const lines = content.trim().split('\n');
      const title = lines[0].substring(0, 100);
      const description = content.trim();

      let provocation;

      // API 시도
      try {
        const res = await fetch('/api/provocation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            category: 'feature', // 기본 카테고리
            description,
            images: media.map(m => m.url).filter(Boolean),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          provocation = data.provocation;
        } else {
          const errorData = await res.json();
          // Supabase not configured 에러면 로컬스토리지로 fallback
          if (errorData.error === 'Supabase not configured') {
            throw new Error('FALLBACK_TO_LOCAL');
          }
          throw new Error(errorData.error || 'Failed to submit');
        }
      } catch (apiError: any) {
        if (apiError.message === 'FALLBACK_TO_LOCAL') {
          // 로컬스토리지에 저장
          const userName = (user as any)?.user_metadata?.name ||
                          (user as any)?.email?.split('@')[0] ||
                          'Anonymous';

          provocation = saveLocalProvocation({
            user_id: user?.id || 'demo-user',
            user_name: userName,
            title,
            category: 'feature',
            description,
            expected_effect: null,
            reference_url: null,
            images: media.map(m => m.url).filter(Boolean),
          });

          console.log('Saved to localStorage (demo mode):', provocation.id);
        } else {
          throw apiError;
        }
      }

      // 성공 처리
      setContent('');
      setMedia([]);

      if (onSuccess) {
        onSuccess(provocation.id);
      } else {
        router.push('/provocation'); // 로컬 저장은 상세 페이지 없으므로 목록으로
        router.refresh();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '제출 중 오류가 발생했습니다';
      alert(errorMessage);
      console.error('Provocation submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`rounded-xl border border-border bg-white ${compact ? 'p-4' : 'p-6'}`}>
      {/* 본문 입력 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={compact ? '이런 기능이 있으면 좋겠다! 자유롭게 도발해보세요.' : '무슨 생각을 하고 계신가요?'}
        required
        minLength={MIN_PROVOCATION_DESCRIPTION_LENGTH}
        maxLength={MAX_PROVOCATION_DESCRIPTION_LENGTH}
        rows={compact ? 3 : 6}
        className={`w-full px-4 py-3 border border-border rounded-lg text-sm focus:border-primary focus:outline-none resize-none ${compact ? 'mb-2' : 'mb-3'}`}
      />

      {/* 하단: 글자수 + 미디어 + 버튼 한 줄 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">{content.length}/{MAX_PROVOCATION_DESCRIPTION_LENGTH}</p>
          {!compact && (
            <MediaUploader
              media={media}
              onAdd={(attachment) => setMedia([...media, attachment])}
              onRemove={(index) => setMedia(media.filter((_, i) => i !== index))}
            />
          )}
        </div>
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? '등록 중...' : '도발하기'}
        </button>
      </div>

      {/* 미디어 업로더 (compact가 아닐 때 위에 표시) */}
      {compact && media.length > 0 && (
        <div className="mt-2">
          <MediaUploader
            media={media}
            onAdd={(attachment) => setMedia([...media, attachment])}
            onRemove={(index) => setMedia(media.filter((_, i) => i !== index))}
          />
        </div>
      )}
    </form>
  );
}
