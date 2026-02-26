'use client';

import { useState, useCallback, useEffect } from 'react';
import { Play, Loader2, ChevronDown, ChevronUp, Lock, Zap } from 'lucide-react';
import { DAILY_FREE_EXECUTIONS, EXECUTION_PRICE_KRW, EXECUTABLE_TOOLS } from '@/lib/constants';
import ExecutionCounter from './ExecutionCounter';
import PlaygroundResult from './PlaygroundResult';
import PaymentCheckout from './PaymentCheckout';
import type { RecipeStep, RecipeStepV2, ExecutionType } from '@/types';

type AnyStep = RecipeStep | RecipeStepV2;

export interface ExecutionStatusLocal {
  daily_free_used: number;
  remaining_free: number;
  logged_in: boolean;
  loading: boolean;
}

interface RecipePlaygroundProps {
  step: AnyStep;
  recipeSlug: string;
  recipeCategory?: string;
  previousResult?: string;
  onResult?: (result: string) => void;
  hasNextStep?: boolean;
  onUseNext?: (value: string) => void;
  /** 부모가 제공하면 내부 fetch를 건너뜀 (중복 API 호출 방지) */
  parentExecStatus?: ExecutionStatusLocal;
  /** 실행 성공 시 부모 카운터 차감 콜백 */
  onDecrement?: () => void;
}

/** 도구가 실행 가능한지 확인 */
function isExecutable(toolSlug: string): boolean {
  return toolSlug in EXECUTABLE_TOOLS;
}

/** 실행 유형 결정 */
function getExecutionType(step: AnyStep): ExecutionType {
  if ('execution_type' in step && step.execution_type) return step.execution_type;
  const config = EXECUTABLE_TOOLS[step.tool_slug];
  return config?.type ?? 'text';
}

export default function RecipePlayground({
  step,
  recipeSlug,
  recipeCategory,
  previousResult,
  onResult,
  hasNextStep = false,
  onUseNext,
  parentExecStatus,
  onDecrement,
}: RecipePlaygroundProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [prompt, setPrompt] = useState(step.prompt_example || '');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [resultImageUrl, setResultImageUrl] = useState('');
  const [resultImageMime, setResultImageMime] = useState('image/png');
  const [hasResult, setHasResult] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentKey, setPaymentKey] = useState<string | null>(null);
  const [localExecStatus, setLocalExecStatus] = useState<ExecutionStatusLocal>({
    daily_free_used: 0,
    remaining_free: DAILY_FREE_EXECUTIONS,
    logged_in: false,
    loading: true,
  });

  // parentExecStatus가 있으면 내부 fetch 건너뜀 (중복 API 호출 방지)
  const execStatus = parentExecStatus ?? localExecStatus;

  // 이전 단계 결과 프롬프트에 삽입
  const finalPrompt = previousResult && ('use_previous' in step) && step.use_previous
    ? prompt.replace('{{previous_result}}', previousResult)
    : prompt;

  // 부모가 상태를 제공하지 않을 때만 자체 조회
  useEffect(() => {
    if (parentExecStatus) return;
    fetch('/api/recipe/status')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setLocalExecStatus({
          daily_free_used: data.daily_free_used ?? 0,
          remaining_free: data.remaining_free ?? DAILY_FREE_EXECUTIONS,
          logged_in: data.logged_in ?? false,
          loading: false,
        });
      })
      .catch(() => setLocalExecStatus((prev) => ({ ...prev, loading: false })));
  }, [parentExecStatus]);

  const executionType = getExecutionType(step);
  const isFree = execStatus.remaining_free > 0;

  // ── 텍스트 실행 ──
  const executeText = useCallback(async (pKey?: string) => {
    setIsLoading(true);
    setResultText('');
    setHasResult(false);

    try {
      const systemPrompt = ('system_prompt' in step && step.system_prompt) ? step.system_prompt : undefined;

      const res = await fetch('/api/recipe/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe_slug: recipeSlug,
          step: step.step,
          tool_slug: step.tool_slug,
          prompt: finalPrompt,
          category: recipeCategory,
          system_prompt: systemPrompt,
          payment_id: pKey,
        }),
      });

      if (res.status === 402) {
        setShowPayment(true);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        setResultText(`오류: ${err.error || '실행 실패'}`);
        setHasResult(true);
        return;
      }

      // SSE 스트리밍 읽기
      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const { text } = JSON.parse(data);
            if (text) {
              fullText += text;
              setResultText(fullText);
            }
          } catch { /* JSON 파싱 실패 무시 */ }
        }
      }

      setHasResult(true);
      if (fullText) {
        onResult?.(fullText);
        // 무료 횟수 차감: 부모 콜백 우선, 없으면 로컬 상태 업데이트
        if (isFree) {
          if (onDecrement) {
            onDecrement();
          } else {
            setLocalExecStatus((prev) => ({
              ...prev,
              daily_free_used: prev.daily_free_used + 1,
              remaining_free: Math.max(0, prev.remaining_free - 1),
            }));
          }
        }
      }
    } catch (err) {
      setResultText(`네트워크 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      setHasResult(true);
    } finally {
      setIsLoading(false);
    }
  }, [finalPrompt, isFree, onResult, recipeCategory, recipeSlug, step]);

  // ── 이미지 실행 ──
  const executeImage = useCallback(async (pKey?: string) => {
    setIsLoading(true);
    setResultImageUrl('');
    setHasResult(false);

    try {
      const res = await fetch('/api/recipe/execute-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe_slug: recipeSlug,
          step: step.step,
          tool_slug: step.tool_slug,
          prompt: finalPrompt,
          payment_id: pKey,
        }),
      });

      if (res.status === 402) {
        setShowPayment(true);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        setResultText(`오류: ${err.error || '이미지 생성 실패'}`);
        setHasResult(true);
        return;
      }

      const data = await res.json();
      if (data.image?.dataUrl) {
        setResultImageUrl(data.image.dataUrl);
        setResultImageMime(data.image.mimeType || 'image/png');
        setHasResult(true);
        if (isFree) {
          if (onDecrement) {
            onDecrement();
          } else {
            setLocalExecStatus((prev) => ({
              ...prev,
              daily_free_used: prev.daily_free_used + 1,
              remaining_free: Math.max(0, prev.remaining_free - 1),
            }));
          }
        }
      }
    } catch (err) {
      setResultText(`네트워크 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      setHasResult(true);
    } finally {
      setIsLoading(false);
    }
  }, [finalPrompt, isFree, recipeSlug, step]);

  const handleExecute = useCallback((pKey?: string) => {
    if (!execStatus.logged_in) return;
    if (executionType === 'image') {
      executeImage(pKey);
    } else {
      executeText(pKey);
    }
  }, [execStatus.logged_in, executionType, executeImage, executeText]);

  const handleRetry = useCallback(() => {
    setHasResult(false);
    setResultText('');
    setResultImageUrl('');
    handleExecute(paymentKey || undefined);
  }, [handleExecute, paymentKey]);

  const handlePaymentSuccess = useCallback((pKey: string) => {
    setPaymentKey(pKey);
    setShowPayment(false);
    handleExecute(pKey);
  }, [handleExecute]);

  // 실행 불가 도구
  if (!isExecutable(step.tool_slug)) return null;
  // 프롬프트 없는 스텝
  if (!step.prompt_example) return null;

  // 비로그인
  if (!execStatus.loading && !execStatus.logged_in) {
    return (
      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <Lock className="mx-auto h-5 w-5 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-1">로그인하면 AI 레시피를 바로 실행할 수 있어요</p>
        <p className="text-xs text-gray-400">매일 {DAILY_FREE_EXECUTIONS}회 무료 제공!</p>
      </div>
    );
  }

  return (
    <div className="mb-3">
      {/* 결제 모달 */}
      {showPayment && (
        <PaymentCheckout
          recipeSlug={recipeSlug}
          step={step.step}
          toolSlug={step.tool_slug}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}

      {/* 메인 패널 */}
      {!showPayment && (
        <div className="rounded-xl border border-orange-200 bg-white overflow-hidden shadow-sm">
          {/* 헤더 토글 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-left bg-orange-50 hover:bg-orange-100/70 transition-colors border-b border-orange-100"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-sm">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900">AIPICK에서 바로 실행해보기</span>
                <span className="ml-2 text-xs text-gray-400">— 프롬프트 수정 후 즉시 체험</span>
              </div>
              <ExecutionCounter
                remaining={execStatus.remaining_free}
                loading={execStatus.loading}
                compact
              />
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {/* 펼쳐진 내용 */}
          {isExpanded && (
            <div className="px-4 pb-4 pt-3">
              {/* 프롬프트 편집 */}
              <div className="mb-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 leading-relaxed shadow-sm"
                  rows={Math.min(8, Math.max(3, (prompt.match(/\n/g) || []).length + 2))}
                  placeholder="프롬프트를 입력하세요..."
                />
              </div>

              {/* 실행 버튼 */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!isFree) { setShowPayment(true); return; }
                    handleExecute();
                  }}
                  disabled={isLoading || !prompt.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-accent-warm hover:bg-[#EA6B10] disabled:opacity-50 transition-all [box-shadow:0_4px_16px_rgba(249,115,22,0.35)] hover:[box-shadow:0_6px_24px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 fill-white" />
                  )}
                  {isLoading ? '실행 중...' : isFree ? '무료로 실행하기' : `₩${EXECUTION_PRICE_KRW.toLocaleString()} 결제 후 실행`}
                </button>
                <ExecutionCounter remaining={execStatus.remaining_free} loading={execStatus.loading} />
              </div>

              {/* 결과 표시 */}
              {hasResult && (
                <div className="mt-3">
                  <PlaygroundResult
                    type={executionType}
                    text={resultText || undefined}
                    imageDataUrl={resultImageUrl || undefined}
                    imageMimeType={resultImageMime}
                    isStreaming={isLoading}
                    onRetry={handleRetry}
                    onUseNext={onUseNext}
                    hasNextStep={hasNextStep}
                  />
                </div>
              )}
              {isLoading && !hasResult && executionType === 'text' && (
                <div className="mt-3">
                  <PlaygroundResult
                    type="text"
                    text={resultText}
                    isStreaming
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
