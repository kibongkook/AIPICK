'use client';

import { ExternalLink } from 'lucide-react';

interface MobileStickyBarProps {
  toolName: string;
  toolUrl: string;
}

export default function MobileStickyBar({ toolName, toolUrl }: MobileStickyBarProps) {
  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-sm p-3 md:hidden">
      <a
        href={toolUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        {toolName} 바로가기
      </a>
    </div>
  );
}
