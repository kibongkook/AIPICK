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
}

export default function ProvocationForm({ onSuccess }: ProvocationFormProps) {
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
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-6">
      {/* 본문 입력 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="무슨 생각을 하고 계신가요?"
        required
        minLength={MIN_PROVOCATION_DESCRIPTION_LENGTH}
        maxLength={MAX_PROVOCATION_DESCRIPTION_LENGTH}
        rows={6}
        className="w-full px-4 py-3 border border-border rounded-lg text-base focus:border-primary focus:outline-none resize-none mb-3"
      />
      <p className="text-xs text-gray-400 mb-4">{content.length}/{MAX_PROVOCATION_DESCRIPTION_LENGTH}</p>

      {/* 미디어 업로더 */}
      <div className="mb-4">
        <MediaUploader
          media={media}
          onAdd={(attachment) => setMedia([...media, attachment])}
          onRemove={(index) => setMedia(media.filter((_, i) => i !== index))}
        />
      </div>

      {/* 하단 액션 */}
      <div className="flex items-center justify-end">
        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
          {submitting ? '등록 중...' : '등록'}
        </button>
      </div>
    </form>
  );
}
