import type { Tool } from '@/types';
import { cn } from '@/lib/utils';

interface PickRecommendationProps {
  tools: Tool[];
}

export default function PickRecommendation({ tools }: PickRecommendationProps) {
  if (tools.length < 2) return null;
  const [a, b] = tools;

  const analysis = generateAnalysis(a, b);

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
      <h3 className="text-base font-bold text-foreground mb-3">어떤 걸 고를까?</h3>
      <div className="space-y-3 text-sm text-gray-700">
        {analysis.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function generateAnalysis(a: Tool, b: Tool): string[] {
  const lines: string[] = [];

  // 사용자 평점 비교
  const aRating = a.rating_avg || 0;
  const bRating = b.rating_avg || 0;

  if (aRating > 0 && bRating > 0 && Math.abs(aRating - bRating) >= 0.3) {
    const leader = aRating > bRating ? a : b;
    const follower = aRating > bRating ? b : a;
    lines.push(
      `사용자 평점 기준, ${leader.name}(★${Math.max(aRating, bRating).toFixed(1)})이 ${follower.name}(★${Math.min(aRating, bRating).toFixed(1)})보다 높은 평가를 받고 있습니다.`
    );
  } else if (aRating > 0 && bRating > 0) {
    lines.push(
      `${a.name}(★${aRating.toFixed(1)})과 ${b.name}(★${bRating.toFixed(1)})은 비슷한 수준의 사용자 평가를 받고 있습니다.`
    );
  }

  // 가격 비교
  if (a.pricing_type !== b.pricing_type) {
    const freeOne = a.pricing_type === 'Free' ? a : b.pricing_type === 'Free' ? b : null;
    if (freeOne) {
      lines.push(`${freeOne.name}은 완전 무료로 제공되어 비용 부담 없이 시작할 수 있습니다.`);
    } else {
      lines.push(
        `${a.name}은 ${a.pricing_type === 'Paid' ? '유료' : '부분 무료'}, ${b.name}은 ${b.pricing_type === 'Paid' ? '유료' : '부분 무료'} 서비스입니다.`
      );
    }
  }

  // 한국어 지원 비교
  if (a.supports_korean !== b.supports_korean) {
    const koreanOne = a.supports_korean ? a : b;
    const nonKoreanOne = a.supports_korean ? b : a;
    lines.push(
      `한국어 지원이 필요하다면 ${koreanOne.name}을 선택하세요. ${nonKoreanOne.name}은 영어 위주입니다.`
    );
  } else if (a.supports_korean && b.supports_korean) {
    lines.push('두 서비스 모두 한국어를 지원합니다.');
  }

  // 무료 사용량 비교
  if (a.free_quota_detail && b.free_quota_detail) {
    lines.push(
      `무료 사용량 면에서, ${a.name}은 "${a.free_quota_detail.slice(0, 50)}", ${b.name}은 "${b.free_quota_detail.slice(0, 50)}"을 제공합니다.`
    );
  } else if (a.free_quota_detail) {
    lines.push(`${a.name}은 무료 사용량이 있지만 (${a.free_quota_detail.slice(0, 50)}), ${b.name}은 별도 무료 플랜이 없습니다.`);
  } else if (b.free_quota_detail) {
    lines.push(`${b.name}은 무료 사용량이 있지만 (${b.free_quota_detail.slice(0, 50)}), ${a.name}은 별도 무료 플랜이 없습니다.`);
  }

  // 결론
  const betterRating = a.rating_avg > b.rating_avg ? a : b;
  if (Math.abs(a.rating_avg - b.rating_avg) >= 0.3) {
    lines.push(
      `사용자 만족도는 ${betterRating.name}(${betterRating.rating_avg.toFixed(1)}점)이 더 높습니다.`
    );
  }

  return lines;
}
