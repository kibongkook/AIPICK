# 왜 2축 평가 시스템으로 전환하는가

## 현재 문제
- ranking_score(레거시): 방문수+평점+리뷰+북마크가 섞여 의미 모호
- hybrid_score(신규): 리뷰+인기도+커뮤니티+벤치마크가 뒤섞여 "이 점수가 뭘 뜻하는지" 사용자가 이해 불가
- 두 점수가 코드 전반에 `hybrid_score || ranking_score` 패턴으로 혼용

## 새 접근
- **성능 지표**: "객관적으로 얼마나 잘하나?" — LMSYS Arena Elo, HuggingFace 등 벤치마크
- **사용자 평점**: "실제로 써보니 어떤가?" — App Store, Play Store, G2 등 리뷰 집계
- 두 축을 분리하여 랭킹 페이지에서 탭으로 전환 가능하게

## 참고 기존 코드
- `lib/scoring/hybrid.ts` — 삭제 대상 (4카테고리 가중합 로직)
- `lib/pipeline/rating-aggregator.ts` — 유지 (rating_avg 집계에 사용)
- `lib/constants.ts:395-429` — DEFAULT_SCORING_WEIGHTS 중 hybrid 관련 키 삭제
- `lib/supabase/queries.ts:433` — 현재 `.order('hybrid_score')` → `.order('rating_avg')` 전환
