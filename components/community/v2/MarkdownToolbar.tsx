'use client';

import { RefObject } from 'react';
import {
  Bold, Italic, Link as LinkIcon, Heading2, List, Code,
  Image as ImageIcon, HelpCircle,
} from 'lucide-react';

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onImageClick: () => void;
}

export default function MarkdownToolbar({ textareaRef, onImageClick }: MarkdownToolbarProps) {
  const insertMarkdown = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newText = before + textToInsert + after;
    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);

    textarea.value = newValue;

    // 커서 위치 조정 (선택된 텍스트가 있으면 끝으로, 없으면 placeholder 선택)
    const newCursorPos = selectedText
      ? start + newText.length
      : start + before.length + textToInsert.length;

    textarea.setSelectionRange(
      selectedText ? newCursorPos : start + before.length,
      newCursorPos
    );
    textarea.focus();

    // Change 이벤트 트리거 (React state 업데이트)
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const buttons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertMarkdown('**', '**', '텍스트'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertMarkdown('*', '*', '텍스트'),
    },
    {
      icon: LinkIcon,
      label: 'Link',
      action: () => insertMarkdown('[', '](URL)', '텍스트'),
    },
    {
      icon: Heading2,
      label: 'Heading',
      action: () => insertMarkdown('## ', '', '제목'),
    },
    {
      icon: List,
      label: 'List',
      action: () => insertMarkdown('- ', '', '항목'),
    },
    {
      icon: Code,
      label: 'Code',
      action: () => insertMarkdown('`', '`', '코드'),
    },
    {
      icon: ImageIcon,
      label: 'Image',
      action: onImageClick,
    },
  ];

  return (
    <div className="flex items-center gap-1 flex-wrap p-2 bg-gray-50 border border-gray-200 rounded-lg">
      {buttons.map(({ icon: Icon, label, action }) => (
        <button
          key={label}
          type="button"
          onClick={action}
          className="flex items-center justify-center h-8 w-8 rounded hover:bg-gray-200 transition-colors"
          title={label}
          aria-label={label}
        >
          <Icon className="h-4 w-4 text-gray-600" />
        </button>
      ))}

      <div className="ml-auto relative group">
        <button
          type="button"
          className="flex items-center justify-center h-8 w-8 rounded hover:bg-gray-200 transition-colors"
          aria-label="Markdown 도움말"
        >
          <HelpCircle className="h-4 w-4 text-gray-400" />
        </button>

        {/* 도움말 툴팁 */}
        <div className="absolute right-0 top-10 z-50 hidden group-hover:block w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-xs">
          <div className="font-semibold mb-2">마크다운 문법</div>
          <div className="space-y-1 text-gray-600">
            <div><code className="bg-gray-100 px-1 rounded">**굵게**</code> → <strong>굵게</strong></div>
            <div><code className="bg-gray-100 px-1 rounded">*기울임*</code> → <em>기울임</em></div>
            <div><code className="bg-gray-100 px-1 rounded">[링크](URL)</code> → 링크</div>
            <div><code className="bg-gray-100 px-1 rounded">## 제목</code> → 제목</div>
            <div><code className="bg-gray-100 px-1 rounded">- 항목</code> → 목록</div>
            <div><code className="bg-gray-100 px-1 rounded">`코드`</code> → <code>코드</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
