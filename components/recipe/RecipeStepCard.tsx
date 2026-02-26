'use client';

import Link from 'next/link';
import { Lightbulb, ArrowRight, Copy } from 'lucide-react';
import { DEFAULT_ALT_TOOLS, EXECUTABLE_TOOLS } from '@/lib/constants';
import RecipePlayground from './RecipePlayground';
import type { ExecutionStatusLocal } from './RecipePlayground';
import type { RecipeStep, RecipeStepV2 } from '@/types';

type AnyStep = RecipeStep | RecipeStepV2;

const NAME_MAP: Record<string, string> = {
  'chatgpt': 'ChatGPT',
  'claude': 'Claude',
  'gemini': 'Gemini',
  'perplexity': 'Perplexity',
  'mistral': 'Mistral',
  'deepseek': 'DeepSeek',
  'grok': 'Grok',
  'meta-ai': 'Meta AI',
  'copilot': 'Copilot',
  'poe': 'Poe',
  'midjourney': 'Midjourney',
  'dall-e-3': 'DALL·E 3',
  'leonardo-ai': 'Leonardo AI',
  'ideogram': 'Ideogram',
  'stable-diffusion': 'Stable Diffusion',
  'flux': 'Flux',
  'runway-ml': 'Runway',
  'kling-ai': 'Kling',
  'pika': 'Pika',
  'invideo-ai': 'InVideo AI',
  'fliki': 'Fliki',
  'elevenlabs': 'ElevenLabs',
  'typecast': 'Typecast',
  'suno-ai': 'Suno',
  'udio': 'Udio',
  'canva-ai': 'Canva AI',
  'beautiful-ai': 'Beautiful.ai',
  'slidesai': 'SlidesAI',
  'gamma': 'Gamma',
  'jasper': 'Jasper',
  'copy-ai': 'Copy.ai',
  'grammarly': 'Grammarly',
  'quillbot': 'QuillBot',
  'wordtune': 'Wordtune',
  'heygen': 'HeyGen',
  'synthesia': 'Synthesia',
  'd-id': 'D-ID',
  'remove-bg': 'Remove.bg',
  'clipdrop': 'ClipDrop',
  'photoroom': 'Photoroom',
  'google-notebooklm': 'NotebookLM',
  'capcut': 'CapCut',
  'vrew': 'Vrew',
  'descript': 'Descript',
  'make': 'Make',
  'zapier-ai': 'Zapier',
  'you-com': 'You.com',
  'wrtn': '뤼튼',
};

interface RecipeStepCardProps {
  step: AnyStep;
  isLast: boolean;
  recipeSlug?: string;
  recipeCategory?: string;
  previousResult?: string;
  onResult?: (result: string) => void;
  hasNextStep?: boolean;
  onUseNext?: (value: string) => void;
  parentExecStatus?: ExecutionStatusLocal;
  onDecrement?: () => void;
}

export default function RecipeStepCard({
  step,
  isLast,
  recipeSlug,
  recipeCategory,
  previousResult,
  onResult,
  hasNextStep = false,
  onUseNext,
  parentExecStatus,
  onDecrement,
}: RecipeStepCardProps) {
  // alt_tools: 스텝에 정의된 것 우선, 없으면 DEFAULT_ALT_TOOLS에서 조회
  const altToolSlugs =
    ('alt_tools' in step && step.alt_tools && step.alt_tools.length > 0)
      ? step.alt_tools
      : DEFAULT_ALT_TOOLS[step.tool_slug] ?? [];

  const showPlayground = !!recipeSlug && step.tool_slug in EXECUTABLE_TOOLS;

  return (
    <div className="relative">
      {/* 연결선 */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-100" />
      )}

      <div className="flex gap-4">
        {/* 스텝 번호 */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow-sm">
          {step.step}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 pb-8">
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
          </div>

          {/* 도구 정보 */}
          <div className="flex items-center gap-2 mb-3">
            <Link
              href={`/tools/${step.tool_slug}`}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              {step.tool_name}
              <ArrowRight className="h-3 w-3" />
            </Link>
            {altToolSlugs.length > 0 && (
              <span className="text-xs text-gray-400">
                대안: {altToolSlugs.map((slug) => NAME_MAP[slug] || slug).join(', ')}
              </span>
            )}
          </div>

          {/* AI 플레이그라운드 — 상단 배치로 즉시 체험 유도 */}
          {showPlayground && (
            <RecipePlayground
              step={step}
              recipeSlug={recipeSlug}
              recipeCategory={recipeCategory}
              previousResult={previousResult}
              onResult={onResult}
              hasNextStep={hasNextStep}
              onUseNext={onUseNext}
              parentExecStatus={parentExecStatus}
              onDecrement={onDecrement}
            />
          )}

          {/* 설명 */}
          <p className="text-sm text-gray-600 mb-3 leading-relaxed mt-3">
            {step.action}
          </p>

          {/* 프롬프트 예시 (플레이그라운드 없을 때만 표시) */}
          {!showPlayground && step.prompt_example && (
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">프롬프트 예시</span>
                <button
                  onClick={() => {
                    if (step.prompt_example) {
                      navigator.clipboard.writeText(step.prompt_example);
                    }
                  }}
                  className="text-xs text-gray-400 hover:text-primary flex items-center gap-0.5 transition-colors"
                  title="복사"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {step.prompt_example}
              </p>
            </div>
          )}

          {/* 팁 */}
          {step.tip && (
            <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-100 p-3">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">{step.tip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
