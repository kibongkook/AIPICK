'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { EXECUTION_PRICE_KRW } from '@/lib/constants';

interface PaymentCheckoutProps {
  recipeSlug: string;
  step: number;
  toolSlug: string;
  onSuccess: (paymentKey: string) => void;
  onCancel?: () => void;
}

/** 토스페이먼츠 결제 위젯 (script 로더 방식) */
export default function PaymentCheckout({
  recipeSlug,
  step,
  toolSlug,
  onSuccess,
  onCancel,
}: PaymentCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. 주문 생성
      const createRes = await fetch('/api/recipe/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_slug: recipeSlug, step, tool_slug: toolSlug }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || '주문 생성 실패');
      }

      const { order_id, amount, order_name } = await createRes.json();

      // 2. 토스페이먼츠 SDK 로드 (CDN 스크립트)
      const clientKey = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY;
      if (!clientKey) {
        throw new Error('결제 서비스가 설정되지 않았습니다');
      }

      // CDN 스크립트 동적 로드
      await new Promise<void>((resolve, reject) => {
        if ((window as unknown as Record<string, unknown>)['TossPayments']) {
          resolve();
          return;
        }
        if (document.querySelector('[data-toss-payments]')) {
          const check = setInterval(() => {
            if ((window as unknown as Record<string, unknown>)['TossPayments']) {
              clearInterval(check);
              resolve();
            }
          }, 50);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v2/standard';
        script.setAttribute('data-toss-payments', 'true');
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('TossPayments SDK 로드 실패'));
        document.head.appendChild(script);
      });

      type TossPaymentsFn = (key: string) => {
        requestPayment: (params: Record<string, unknown>) => Promise<void>;
      };
      const TossPayments = (window as unknown as Record<string, unknown>)['TossPayments'] as TossPaymentsFn | undefined;
      if (!TossPayments) throw new Error('결제 서비스 초기화 실패');
      const tossPayments = TossPayments(clientKey);

      // 3. 결제 요청
      await tossPayments.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: amount },
        orderId: order_id,
        orderName: order_name,
        successUrl: `${window.location.origin}/api/recipe/payment/success?recipe=${recipeSlug}`,
        failUrl: `${window.location.origin}/api/recipe/payment/fail`,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : '결제 중 오류가 발생했습니다';
      // 사용자가 취소한 경우는 에러로 표시하지 않음
      if (!message.includes('취소') && !message.includes('cancel')) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="text-center mb-3">
        <p className="text-sm font-medium text-foreground">오늘의 무료 실행을 모두 사용했습니다</p>
        <p className="text-xs text-gray-500 mt-1">내일 오전 0시에 3회가 다시 충전됩니다</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">추가 실행 비용</span>
          <span className="font-bold text-foreground">₩{EXECUTION_PRICE_KRW.toLocaleString()}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">카드 / 카카오페이 / 네이버페이 / 토스페이</div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-2 text-center">{error}</p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 text-xs text-gray-500 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        )}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-primary rounded-lg py-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CreditCard className="h-3 w-3" />
          )}
          {loading ? '결제 중...' : `결제 후 실행하기 (₩${EXECUTION_PRICE_KRW.toLocaleString()})`}
        </button>
      </div>
    </div>
  );
}
