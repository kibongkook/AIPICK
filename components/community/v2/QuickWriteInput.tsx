'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Hash } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import type { MediaAttachment } from '@/types';

const PLACEHOLDER_MESSAGES = [
  'AI 세상에 오신 소감을 공유해주세요',
  '여러분의 후기가 궁금합니다',
  '안녕하세요? 인사 하시죠',
  '오늘 어떤 AI를 사용하셨나요?',
  '여러분의 AI 활용 팁을 공유해주세요',
  '이 AI 도구를 추천합니다!',
  '궁금한 점이 있으신가요?',
  '자유롭게 의견을 나눠보세요',
];

interface QuickWriteInputProps {
  onSubmit: (data: {
    content: string;
    media?: MediaAttachment[];
    tags?: string[];
    post_type?: 'discussion' | 'question' | 'review';
  }) => Promise<boolean>;
}

export default function QuickWriteInput({ onSubmit }: QuickWriteInputProps) {
  const { user } = useAuth();
  const [postType, setPostType] = useState<'discussion' | 'question' | 'review'>('discussion');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // 랜덤 placeholder 설정
  useEffect(() => {
    setPlaceholder(PLACEHOLDER_MESSAGES[Math.floor(Math.random() * PLACEHOLDER_MESSAGES.length)]);
  }, []);

  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">로그인하고 커뮤니티에 참여하세요</p>
        <a
          href="/auth/login"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
        >
          로그인
        </a>
      </div>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (media.length >= 5) {
          alert('최대 5개까지 첨부할 수 있습니다.');
          break;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/community/media', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const { url } = await res.json();
          const newAttachment: MediaAttachment = {
            type: file.type.startsWith('video/') ? 'video' : 'image',
            url,
          };
          setMedia(prev => [...prev, newAttachment]);
        } else {
          alert('파일 업로드에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
      // 백스페이스로 마지막 태그 제거
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
      // 새로운 랜덤 placeholder
      setPlaceholder(PLACEHOLDER_MESSAGES[Math.floor(Math.random() * PLACEHOLDER_MESSAGES.length)]);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-4 mb-6">
      {/* 글 타입 선택 */}
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setPostType('discussion')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            postType === 'discussion'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          일반
        </button>
        <button
          type="button"
          onClick={() => setPostType('review')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            postType === 'review'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          리뷰
        </button>
        <button
          type="button"
          onClick={() => setPostType('question')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            postType === 'question'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          질문
        </button>
      </div>

      {/* 본문 입력 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        required
        minLength={1}
        maxLength={10000}
        rows={3}
        className="w-full px-0 py-0 border-0 text-base focus:outline-none resize-none mb-2 placeholder:text-gray-400"
      />

      {/* 첨부된 미디어 미리보기 */}
      {media.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {media.map((attachment, index) => (
            <div key={index} className="relative group">
              {attachment.type === 'image' ? (
                <img
                  src={attachment.url}
                  alt="첨부 이미지"
                  className="h-16 w-16 object-cover rounded-lg border border-border"
                />
              ) : (
                <video
                  src={attachment.url}
                  className="h-16 w-16 object-cover rounded-lg border border-border"
                />
              )}
              <button
                type="button"
                onClick={() => setMedia(media.filter((_, i) => i !== index))}
                className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 태그 영역 - 최대 10줄까지 wrap */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5 max-h-[280px] overflow-y-auto">
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
        <div className="inline-flex items-center gap-1">
          <Hash className="h-3 w-3 text-gray-400" />
          <input
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            placeholder="태그 입력"
            className="w-20 px-1 py-0.5 text-xs border-0 focus:outline-none placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* 하단 액션 */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        {/* 첨부 버튼 */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || media.length >= 5}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="파일 첨부"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <span className="text-xs text-gray-400">{content.length}/10000</span>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? '등록 중...' : '등록'}
        </button>
      </div>
    </form>
  );
}
