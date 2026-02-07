# AIPICK 실제 데이터 전환 가이드

> 더미 데이터 기반 → 실제 프로덕션 데이터 전환 과정을 기록합니다.
> 10단계 로드맵 전체 완료!

---

## 전체 진행 현황

| Step | 작업 | 상태 | 커밋 |
|------|------|------|------|
| 1 | 실제 AI 도구 119개 데이터 확장 | ✅ 완료 | `fcf20e3` |
| 2 | 직군별/학년별 추천 105+79개 매핑 | ✅ 완료 | `4ceb2c8` |
| 3 | 문서 정리 + docs/ 업데이트 | ✅ 완료 | |
| 4 | Supabase 백엔드 연동 (async 리팩터링) | ✅ 완료 | `2f29471` |
| 5 | 사용자 인증 (OAuth) 실제 연동 | ✅ 완료 | `299b0b8` |
| 6+7 | 리뷰/댓글/북마크/업보트 백엔드 | ✅ 완료 | `96165a5` |
| 8 | 컬렉션/가이드 사용자 생성 | ✅ 완료 | `55d3064` |
| 9 | 관리자 대시보드 풀기능 | ✅ 완료 | `b663e20` |
| 10 | 외부 데이터 자동 수집 파이프라인 | ✅ 완료 | `c020938` |

---

## API 라우트 전체 목록 (21개)

### 공개 API
| 경로 | 메서드 | 설명 |
|------|--------|------|
| `/api/tools` | GET | 전체 도구 목록 |
| `/api/search` | GET | 도구 검색 |
| `/api/reviews` | GET/POST/DELETE | 리뷰 CRUD |
| `/api/reviews/helpful` | POST | 리뷰 도움 카운트 |
| `/api/comments` | GET/POST/DELETE | 댓글 CRUD |
| `/api/comments/like` | POST | 댓글 좋아요 |
| `/api/bookmarks` | GET/POST | 북마크 목록/토글 |
| `/api/upvotes` | GET/POST | 업보트 확인/토글 |
| `/api/collections` | GET/POST/PATCH/DELETE | 컬렉션 CRUD |
| `/api/collections/like` | POST | 컬렉션 좋아요 |
| `/api/guides` | POST/PATCH/DELETE | 가이드 CRUD |
| `/api/guides/views` | POST | 가이드 조회수 증가 |

### 관리자 API (ADMIN_EMAILS 인증)
| 경로 | 메서드 | 설명 |
|------|--------|------|
| `/api/admin/tools` | POST/PATCH/DELETE | 도구 관리 |
| `/api/admin/news` | POST/PATCH/DELETE | 뉴스 관리 |

### 크론 API (CRON_SECRET 인증)
| 경로 | 스케줄 | 설명 |
|------|--------|------|
| `/api/cron/ranking` | 매주 월 03:00 | 랭킹 재계산 + 주간 스냅샷 |
| `/api/cron/news-fetch` | 6시간마다 | HackerNews AI 뉴스 수집 |
| `/api/cron/github-stats` | 매주 일 04:00 | GitHub 오픈소스 통계 |

### 인증 라우트
| 경로 | 설명 |
|------|------|
| `/auth/callback` | OAuth 코드 → 세션 교환 |

---

## 듀얼모드 아키텍처

모든 기능은 **Supabase 설정 여부**에 따라 자동 전환:

```
┌──────────────┐     ┌─────────────────┐
│ Server       │────▶│ queries.ts      │──▶ Supabase DB
│ Components   │     │ (async 28개)    │    OR seed.json
└──────────────┘     └─────────────────┘

┌──────────────┐     ┌─────────────────┐
│ Client Hooks │────▶│ API Routes      │──▶ Supabase DB
│ (4개 훅)     │     │ OR              │
│              │     │ localStorage    │──▶ localStorage
└──────────────┘     └─────────────────┘

┌──────────────┐     ┌─────────────────┐
│ AuthContext   │────▶│ Supabase Auth   │──▶ OAuth (Google/GitHub/Kakao)
│              │     │ OR              │
│              │     │ Demo Mode       │──▶ localStorage
└──────────────┘     └─────────────────┘
```

### 전환 기준
- `isSupabaseConfigured()`: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
- `user.provider !== 'demo'`: OAuth 사용자만 API 라우트 사용
- 데모 사용자: 항상 localStorage 폴백

---

## 환경변수 전체 목록

```env
# Supabase (필수 - 실제 DB 연동 시)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...

# 사이트 URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 관리자 (쉼표 구분, 비어있으면 모든 인증 사용자 허용)
ADMIN_EMAILS=admin@aipick.kr

# 크론 시크릿 (Vercel Cron 자동 전달)
CRON_SECRET=

# GitHub API (선택, 오픈소스 통계 수집 rate limit 완화)
GITHUB_TOKEN=
```

---

## DB 마이그레이션

| 파일 | 내용 |
|------|------|
| `001_initial_schema.sql` | 16개 테이블 + RLS + 인덱스 |
| `002_add_user_name_columns.sql` | reviews/comments user_name + 통계 트리거 |

### 트리거
- `trg_update_tool_review_stats`: 리뷰 변경 시 rating_avg, review_count 자동 계산
- `trg_update_tool_upvote_count`: 업보트 변경 시 upvote_count 자동 증감

---

## 프로덕션 배포 체크리스트

1. Supabase 프로젝트 생성 + 마이그레이션 실행
2. OAuth 프로바이더 설정 (Google/GitHub/Kakao)
3. 환경변수 설정 (.env.local 또는 Vercel Dashboard)
4. `npm run build` 성공 확인
5. Vercel 배포
6. 크론 작업 자동 활성화 (vercel.json)
