# M7. 관리자 / 데이터 파이프라인 모듈

> 담당 경로: `/admin`, `app/api/cron/`
> 관련 모듈: [M2-RANKING](./M2-RANKING.md) (랭킹 크론), [M5-CONTENT](./M5-CONTENT.md) (뉴스 크론)
> 최종 수정일: 2026-02-20

---

## 1. 모듈 개요

두 가지 하위 시스템으로 구성:

1. **관리자 대시보드** — 콘텐츠 CRUD, 통계 모니터링
2. **외부 데이터 파이프라인** — 크론잡 기반 자동 데이터 수집

---

## 2. 관리자 대시보드 (`/admin`)

### 2.1 접근 권한

**환경변수**: `ADMIN_EMAILS` (쉼표 구분)

```bash
ADMIN_EMAILS=admin@example.com,another@example.com
```

**⚠️ 보안 주의**: 미설정 시 모든 인증 사용자가 관리자 권한 획득
→ [M6-AUTH 보안 이슈](./M6-AUTH.md#24-보안-이슈-critical) 참조

### 2.2 관리자 메뉴 구조

```
/admin
├── /admin/tools       AI 서비스 CRUD ✅
├── /admin/news        뉴스 CRUD ✅
├── /admin/guides      가이드 CRUD ✅
├── /admin/jobs        직군 관리 ⬜ (Supabase 연동 후)
└── /admin/education   학년 관리 ⬜ (Supabase 연동 후)
```

### 2.3 대시보드 통계 (`/admin`)

| 통계 항목 | 데이터 소스 |
|---------|---------|
| 총 서비스 수 | tools 테이블 COUNT |
| 총 리뷰 수 | reviews 테이블 COUNT |
| 총 사용자 수 | auth.users COUNT |
| 주간 방문 수 | visit_count 합계 |
| 인기 서비스 TOP 10 | ranking_score DESC |
| 최근 리뷰/댓글 | created_at DESC |

### 2.4 AI 서비스 관리 (`/admin/tools`)

| 기능 | 설명 |
|------|------|
| 목록 | 전체 서비스 테이블 |
| 생성 | 새 AI 서비스 등록 (slug, 카테고리, 가격, 무료사용량 등) |
| 수정 | 정보 업데이트 |
| 삭제 | 서비스 제거 |

### 2.5 뉴스 관리 (`/admin/news`)

| 기능 | 설명 |
|------|------|
| 목록 | 수집된/작성된 뉴스 목록 |
| 생성 | 수동 뉴스 등록 |
| 수정 | 제목, 요약, 썸네일, 카테고리 수정 |
| 삭제 | |

### 2.6 가이드 관리 (`/admin/guides`)

| 기능 | 설명 |
|------|------|
| 목록 | 전체 가이드 |
| 작성 | 마크다운 에디터 |
| 수정 | 내용 업데이트 |
| 삭제 | |

---

## 3. 외부 데이터 파이프라인

### 3.1 크론잡 목록 (22개)

**공통 기반**: `lib/pipeline/fetcher-base.ts`

| 크론 경로 | 주기 | 역할 |
|-----------|------|------|
| `/api/cron/ranking` | 매일 자정 | hybrid_score 재계산 |
| `/api/cron/trends` | 매주 월요일 | 주간 트렌드 계산, weekly_visit_delta |
| `/api/cron/product-hunt` | 매일 | Product Hunt 인기 도구 수집 |
| `/api/cron/benchmarks` | 매주 | AI 벤치마크 점수 (LMSYS, AlpacaEval) |
| `/api/cron/pricing` | 매일 | 가격 변동 추적 |
| `/api/cron/artificial-analysis` | 매주 | Artificial Analysis 데이터 |
| `/api/cron/category-popularity` | 매일 | 카테고리 인기도 |
| `/api/cron/news-fetch` | 매시간 | AI 뉴스 자동 수집 |
| (기타 14개) | 다양 | 추가 수집 작업 |

### 3.2 크론잡 인증 (보안 이슈)

**현재 문제**: `CRON_SECRET` 미설정 시 공개 접근 가능

```typescript
// ❌ 현재 코드
const cronSecret = process.env.CRON_SECRET;
if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
  // CRON_SECRET 미설정이면 통과!
}

// ✅ 수정 필요
if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**환경변수 필수**: `CRON_SECRET=<random-string>`

### 3.3 데이터 소스 상세

| 소스 | API | 수집 데이터 | 가중치 |
|------|-----|---------|--------|
| Product Hunt | GraphQL API | 평점, 추천수, 리뷰수 | 40% |
| LMSYS Chatbot Arena | 웹 스크래핑 | Elo 점수, 승률 | 25% (벤치마크 내) |
| AlpacaEval | 공개 JSON | 승률 | 25% (벤치마크 내) |
| Artificial Analysis | artificialanalysis.ai | 품질 지수, 속도, 가격 | 15% |
| GitHub | REST API | Stars, Issues, Forks | — |

### 3.4 모델 매핑

**파일**: `data/model-mapping.json`

AI 모델명 → AIPICK 도구 슬러그 매핑

```json
{
  "gpt-4o": "chatgpt",
  "claude-3-5-sonnet": "claude",
  "gemini-1.5-pro": "google-gemini"
}
```

**매처**: `lib/pipeline/model-matcher.ts`

---

## 4. 데이터 파이프라인 DB 스키마

**마이그레이션**: `supabase/migrations/004_external_data_pipeline.sql`

| 테이블 | 역할 |
|--------|------|
| `external_benchmark_scores` | 외부 벤치마크 점수 저장 |
| `pricing_history` | 가격 변동 이력 |
| `product_hunt_rankings` | Product Hunt 수집 결과 |
| `tool_discovery_queue` | 신규 발견 도구 대기열 |

→ 전체 스키마: [DB-SCHEMA.md](../DB-SCHEMA.md)

---

## 5. 배포 시 크론잡 등록

**Vercel Cron** 또는 **GitHub Actions**으로 등록 필요:

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/ranking", "schedule": "0 0 * * *" },
    { "path": "/api/cron/trends", "schedule": "0 9 * * 1" },
    { "path": "/api/cron/product-hunt", "schedule": "0 6 * * *" },
    { "path": "/api/cron/benchmarks", "schedule": "0 3 * * 0" },
    { "path": "/api/cron/pricing", "schedule": "0 12 * * *" },
    { "path": "/api/cron/news-fetch", "schedule": "0 * * * *" },
    { "path": "/api/cron/artificial-analysis", "schedule": "0 4 * * 0" },
    { "path": "/api/cron/category-popularity", "schedule": "0 1 * * *" }
  ]
}
```

---

## 6. 관련 컴포넌트/파일

| 파일 | 역할 |
|------|------|
| `app/admin/page.tsx` | 관리자 대시보드 |
| `app/admin/tools/` | 서비스 CRUD |
| `app/admin/news/` | 뉴스 CRUD |
| `app/admin/guides/` | 가이드 CRUD |
| `app/api/cron/` | 22개 크론잡 라우트 |
| `lib/pipeline/fetcher-base.ts` | 공통 수집 베이스 |
| `lib/pipeline/model-matcher.ts` | 모델명 매칭 |
| `data/model-mapping.json` | 모델명 → slug 매핑 |
| `lib/auth/adminCheck.ts` | 관리자 권한 확인 |

---

## 7. 미결 이슈 / 개선 포인트

| 이슈 | 우선순위 | 메모 |
|------|---------|------|
| **CRON_SECRET 인증 버그** | Critical | 미설정 시 공개 노출 |
| **Admin 인증 기본값 버그** | Critical | `return false` 수정 |
| admin/jobs, admin/education 미구현 | Medium | Supabase 연동 후 |
| 댓글/리뷰 신고 관리 미구현 | Medium | 배포 후 추가 |
| Rate limiting 미적용 | Medium | API 무한 요청 가능 |
| 크론잡 모니터링/알림 없음 | Low | 실패 시 알림 시스템 필요 |
