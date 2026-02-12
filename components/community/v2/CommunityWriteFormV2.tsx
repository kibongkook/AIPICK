'use client';

import { useState, useRef } from 'react';
import { Send, Hash, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { LoginPrompt } from '@/components/auth/AuthGuard';
import MarkdownToolbar from './MarkdownToolbar';
import MediaUploader from '../MediaUploader';
import type { MediaAttachment, CommunityPostType } from '@/types';

interface CommunityWriteFormV2Props {
  onSubmit: (data: {
    content: string;
    media?: MediaAttachment[];
    tags?: string[];
    post_type?: CommunityPostType;
  }) => Promise<boolean>;
  initialPostType?: CommunityPostType;
}

export default function CommunityWriteFormV2({ onSubmit, initialPostType }: CommunityWriteFormV2Props) {
  const { user } = useAuth();
  const [postType, setPostType] = useState<CommunityPostType>(initialPostType || 'discussion');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return <LoginPrompt message="글을 작성하려면 로그인이 필요합니다." />;
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setTagInput('');
      return;
    }

    setTags([...tags, trimmed]);
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || submitting) return;

    setSubmitting(true);
    const success = await onSubmit({
      content: content.trim(),
      media: media.length > 0 ? media : undefined,
      tags: tags.length > 0 ? tags : undefined,
      post_type: postType,
    });

    if (success) {
      setContent('');
      setMedia([]);
      setTags([]);
      setTagInput('');
      setPostType('discussion'); // 제출 후 기본값으로 리셋
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-6">
      {/* 글 타입 선택 */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setPostType('discussion')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            postType === 'discussion'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          일반
        </button>
        <button
          type="button"
          onClick={() => setPostType('rating')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            postType === 'rating'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          리뷰
        </button>
        <button
          type="button"
          onClick={() => setPostType('question')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            postType === 'question'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          질문
        </button>
      </div>

      {/* 마크다운 툴바 */}
      <div className="mb-2">
        <MarkdownToolbar
          textareaRef={contentRef}
          onImageClick={() => {
            // MediaUploader로 스크롤 또는 포커스
            contentRef.current?.blur();
          }}
        />
      </div>

      {/* 본문 입력 */}
      <textarea
        ref={contentRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="무슨 생각을 하고 계신가요?"
        required
        minLength={1}
        maxLength={10000}
        rows={6}
        className="w-full px-4 py-3 border border-border rounded-lg text-base focus:border-primary focus:outline-none resize-none mb-3"
      />
      <p className="text-xs text-gray-400 mb-4">{content.length}/10000</p>

      {/* 태그 영역 - 최대 10줄까지 wrap */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 min-h-[32px] max-h-[320px] overflow-y-auto p-2 border border-border rounded-lg">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
          >
            #{tag}
            <button
              type="button"
              onClick={() => setTags(tags.filter((_, i) => i !== index))}
              className="hover:text-purple-900"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}

        {/* 인라인 태그 입력 */}
        <div className="inline-flex items-center gap-1 flex-1 min-w-0">
          <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <input
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            placeholder="태그 입력"
            style={{ width: tagInput ? `${Math.max(96, tagInput.length * 8)}px` : '96px' }}
            className="px-1 py-0.5 text-xs border-0 focus:outline-none placeholder:text-gray-300"
          />
        </div>
      </div>

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
