'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CommunityWriteFormV2 from '@/components/community/v2/CommunityWriteFormV2';
import type { CommunityPost, MediaAttachment } from '@/types';

const STORAGE_KEY = 'aipick_community_v2';

export default function CommunityWritePage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    content: string;
    media?: MediaAttachment[];
    tags?: string[];
  }) => {
    try {
      const res = await fetch('/api/community/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.content,
          media: data.media,
          manual_tags: data.tags,
        }),
      });

      if (res.ok) {
        const { post } = await res.json();
        router.push(`/community/${post.id}`);
        return true;
      } else if (res.status === 503) {
        // Supabase not configured - localStorage 폴백 + 클라이언트 사이드 태그 추출
        const { extractTags } = await import('@/lib/community/tag-extractor');
        const autoTitle = data.content.slice(0, 100);
        const extractedTags = await extractTags(autoTitle, data.content, { minConfidence: 0.5 });

        // 태그를 CommunityTag 형태로 변환
        const tags = [
          ...extractedTags.map(tag => ({
            id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            tag_type: tag.type,
            tag_value: tag.value,
            tag_display: tag.display,
            tag_normalized: tag.value.toLowerCase(),
            tag_color: null,
            tag_icon: null,
            usage_count: 1,
            related_tool_id: null,
            related_category_slug: tag.related_category_slug || null,
            created_at: new Date().toISOString(),
          })),
          ...(data.tags || []).map(tagValue => ({
            id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            tag_type: 'KEYWORD' as const,
            tag_value: tagValue,
            tag_display: tagValue,
            tag_normalized: tagValue.toLowerCase(),
            tag_color: null,
            tag_icon: null,
            usage_count: 1,
            related_tool_id: null,
            related_category_slug: null,
            created_at: new Date().toISOString(),
          }))
        ];

        const post: CommunityPost = {
          id: `cp-v2-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          user_id: 'local-user',
          user_name: '로컬 사용자',
          target_type: 'general',
          target_id: 'general',
          post_type: 'discussion',
          title: autoTitle,
          content: data.content,
          media: data.media || [],
          tags, // 태그 포함
          rating: null,
          feature_ratings: null,
          parent_id: null,
          like_count: 0,
          comment_count: 0,
          bookmark_count: 0,
          view_count: 0,
          popularity_score: 0,
          quality_score: 0,
          is_reported: false,
          is_pinned: false,
          is_hidden: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // localStorage에 저장
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        existing.unshift(post);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

        alert('✅ 글이 로컬에 저장되었습니다 (개발 모드)');
        router.push('/community');
        return true;
      } else {
        const error = await res.json();
        alert(error.error || '글 작성에 실패했습니다');
        return false;
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('글 작성 중 오류가 발생했습니다');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          커뮤니티로 돌아가기
        </Link>

        <CommunityWriteFormV2 onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
