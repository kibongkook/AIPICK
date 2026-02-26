# 2축 평가 시스템 리팩토링 TODO

## Phase A: 랭킹 페이지 UI
- [x] A2: getRankings() 정렬 모드 파라미터 추가
- [x] A3: getRankingsByBenchmark() 새 함수 작성
- [x] A1: 랭킹 페이지 2탭 UI 구현 (평점순 + 성능순)

## Phase B: 비교 페이지
- [x] B1: ComparisonView hybrid_score → rating_avg
- [x] B2: PickRecommendation hybrid_score → rating_avg

## Phase C: 추천 엔진
- [x] C1: engine.ts 품질 신호 수정

## Phase D: 크론잡
- [x] D1: ranking cron hybrid 계산 제거
- [x] D2: trends cron effectiveScore 수정
- [x] D3: category-popularity cron effectiveScore 수정

## Phase E: 스코어링 라이브러리
- [x] E1: lib/scoring/hybrid.ts 삭제
- [x] E2: lib/scoring/index.ts 정리
- [x] E3: lib/constants.ts 불필요 상수 제거

## Phase F: UI 컴포넌트
- [x] F1: ScoreBreakdown 사용 제거 (tool detail page)
- [x] F2: ConfidenceBadge로 대체

## Phase G: 타입
- [x] G1: types/index.ts deprecated 주석

## Phase H: 외부 평점 데이터 수집 + seed 초기화
- [x] H1: 실제 외부 평점 조사 (App Store, Play Store, G2, Trustpilot, Product Hunt)
- [x] H2: generate-ratings.mjs 스크립트 작성 (61개 도구, 132개 소스 엔트리)
- [x] H3: seed.json에 tool_external_scores 추가 + rating_avg 계산
- [x] H4: getToolExternalScores() seed fallback 추가
- [x] H5: npm run build 통과

## 검증
- [x] npm run build 통과 (436 pages, 0 errors)
- [x] npm run build 통과 (Phase H 완료 후)
