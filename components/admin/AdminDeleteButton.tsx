'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface AdminDeleteButtonProps {
  endpoint: string;
  id: string;
  name: string;
}

export default function AdminDeleteButton({ endpoint, id, name }: AdminDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
    setDeleting(false);
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-500 mr-1">삭제?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded px-2 py-0.5 text-xs bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
        >
          {deleting ? '...' : '확인'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded px-2 py-0.5 text-xs bg-gray-200 text-gray-600 hover:bg-gray-300"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
      title={`${name} 삭제`}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
