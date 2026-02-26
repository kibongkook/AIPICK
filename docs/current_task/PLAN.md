# 2축 평가 시스템 리팩토링

## 목표
hybrid_score/ranking_score 혼용 체계 → 성능 지표 + 사용자 평점 2축으로 단순화

## 수정 파일 목록
1. `lib/supabase/queries.ts` — getRankings() 정렬 모드 추가 + getRankingsByBenchmark() 신규
2. `app/rankings/page.tsx` — 2탭 UI (평점순/성능순)
3. `components/compare/ComparisonView.tsx` — hybrid_score → rating_avg
4. `components/compare/PickRecommendation.tsx` — hybrid_score → rating_avg
5. `lib/recommend/engine.ts` — 품질 신호 hybrid → rating
6. `app/api/cron/ranking/route.ts` — hybrid 계산 제거, rating 집계만
7. `app/api/cron/trends/route.ts` — effectiveScore → rating_avg
8. `app/api/cron/category-popularity/route.ts` — effectiveScore → rating_avg
9. `lib/scoring/hybrid.ts` — 삭제
10. `lib/constants.ts` — 불필요한 가중치 상수 제거
11. `components/ranking/ScoreBreakdown.tsx` — 수정 또는 삭제
12. `app/tools/[slug]/page.tsx` — ScoreBreakdown props 수정
13. `types/index.ts` — deprecated 주석
