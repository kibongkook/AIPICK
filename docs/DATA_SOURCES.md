# AIPICK 데이터 출처 및 파이프라인

## 📊 데이터 필드 출처

### 1. 평점 관련 (rating_avg)
**현재 상태**: seed.json에 수동 입력
**향후 자동화**: `/api/cron/aggregate-ratings`

#### 외부 소스 (90%):
- **Product Hunt** (40%)
  - API: https://api.producthunt.com/v2/api/graphql
  - 수집: `/api/cron/product-hunt`
  - 데이터: 평점, 추천수, 리뷰 수

- **벤치마크** (25%)
  - LMSYS Chatbot Arena (https://chat.lmsys.org)
  - AlpacaEval (https://tatsu-lab.github.io/alpaca_eval)
  - 수집: `/api/cron/benchmarks`
  - 데이터: Elo 점수, 승률

- **Artificial Analysis** (15%)
  - API: https://artificialanalysis.ai
  - 수집: `/api/cron/artificial-analysis`
  - 데이터: 품질 지수, 속도, 가격

- **GitHub Stars** (20%)
  - API: GitHub REST API
  - 수집: `/api/cron/github-stats`
  - 데이터: Stars, Issues, Forks

- **G2** (0% - 비활성)
  - 유료 API, 현재 접근 불가

#### 내부 소스 (10%):
- 사용자 평가 (`tool_ratings` 테이블)
- 실시간 입력, 즉시 반영

### 2. 방문수 (visit_count)
**현재 상태**: seed.json에 추정치 입력 (외부 조사 기반)
**향후 자동화**: 구글 애널리틱스 연동 또는 자체 추적

#### 데이터 출처:
- 현재: SimilarWeb, Sensor Tower 등 트래픽 추정 도구
- 향후: 자체 방문 추적 시스템

### 3. 하이브리드 점수 (hybrid_score)
**계산**: `/api/cron/ranking`
**공식**: 4계층 가중 합계

```typescript
hybrid_score =
  tier1 (35%: 기술 품질) +
  tier2 (40%: 커뮤니티) +
  tier3 (15%: 실용성) +
  tier4 (10%: 내부 평가)
```

#### Tier 1 - 기술 품질 (35%)
- 벤치마크 점수 (50%)
- GitHub Stars (30%)
- Artificial Analysis 품질 지수 (20%)

#### Tier 2 - 커뮤니티 활동 (40%)
- 방문수 (40%)
- 북마크 수 (30%)
- 업보트 수 (20%)
- 리뷰 수 (10%)

#### Tier 3 - 실용성 (15%)
- 한국어 지원 여부 (40%)
- 카테고리 인기도 (30%)
- LLM 판단 점수 (30%)

#### Tier 4 - 내부 평가 (10%)
- AIPICK 사용자 평가 (`rating_avg`)

### 4. 트렌드 (trend_magnitude, trend_direction)
**계산**: `/api/cron/trends`
**알고리즘**: 7일 전 순위와 비교

```typescript
trend_direction = 'up' | 'down' | 'stable' | 'new'
trend_magnitude = Math.abs(현재순위 - 7일전순위)
```

#### 데이터 흐름:
1. 매일 `trend_snapshots` 테이블에 현재 순위 저장
2. 7일 전 스냅샷과 비교하여 변동 계산
3. `tools` 테이블의 `trend_direction`, `trend_magnitude` 업데이트

### 5. 주간 증가량 (weekly_visit_delta)
**계산**: `/api/cron/trends`
**알고리즘**: 7일 전 visit_count와 비교

```typescript
weekly_visit_delta = 현재 visit_count - 7일전 visit_count
```

## 🔧 Cron Job 스케줄

| Job | 실행 주기 | 역할 |
|-----|----------|------|
| `/api/cron/product-hunt` | 매일 02:00 | Product Hunt 데이터 수집 |
| `/api/cron/github-stats` | 매일 03:00 | GitHub 통계 수집 |
| `/api/cron/benchmarks` | 매주 월요일 01:00 | 벤치마크 점수 업데이트 |
| `/api/cron/artificial-analysis` | 매주 화요일 01:00 | AA 품질 지수 수집 |
| `/api/cron/aggregate-ratings` | 매일 04:00 | 외부 평점 집계 |
| `/api/cron/ranking` | 매일 05:00 | 하이브리드 점수 계산 |
| `/api/cron/trends` | 매일 06:00 | 트렌드 방향/크기 계산 |

## 📈 현재 상태 (2026-02-10)

### ✅ 이미 있는 데이터 (seed.json)
- `rating_avg`: 4.0-4.8 (14개 실제 조사, 105개 추정)
- `visit_count`: 500만-3.5억 (외부 트래픽 추정)
- `product_hunt_upvotes`: 실제/추정치 혼합

### ⏳ 아직 없는 데이터 (향후 수집)
- `hybrid_score`: 0 → Cron Job으로 계산 예정
- `weekly_visit_delta`: 0 → 방문 추적 시작 후 계산
- `trend_magnitude`: 0 → 7일간 데이터 쌓인 후 계산
- `trend_direction`: 'stable' → 트렌드 계산 후 업데이트

## 🎯 데이터 활성화 방법

### 즉시 가능 (Supabase 설정 후)
1. `.env.local`에 Supabase URL + Key 설정
2. `npm run seed` - seed.json 데이터 업로드
3. Cron Job 실행:
   ```bash
   curl -X POST http://localhost:3000/api/cron/ranking \
     -H "Authorization: Bearer YOUR_CRON_SECRET"

   curl -X POST http://localhost:3000/api/cron/trends \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### 외부 API 연동 필요
1. **Product Hunt**: `PRODUCT_HUNT_API_KEY` 환경변수
2. **GitHub**: `GITHUB_TOKEN` 환경변수
3. **Artificial Analysis**: 별도 계약 필요
4. **G2**: Developer Portal + API key 발급

## 💡 현재 동작 방식

**Supabase 없이 (seed.json fallback)**:
- 🔥 HOT: `visit_count` 기준 정렬 (인기도)
- 🏆 TOP 5: `rating_avg` 기준 정렬 (평점)

**Supabase 연동 후**:
- 🔥 HOT: `weekly_visit_delta` → `visit_count` (폴백)
- 🏆 TOP 5: `hybrid_score` → `rating_avg` (폴백)

## 📚 관련 파일
- `lib/scoring/index.ts` - 하이브리드 점수 계산 로직
- `lib/scoring/weights.ts` - 가중치 관리
- `lib/pipeline/rating-aggregator.ts` - 평점 집계 로직
- `lib/supabase/queries.ts` - 데이터 조회 + fallback
- `data/seed.json` - 초기 데이터 + fallback 데이터
