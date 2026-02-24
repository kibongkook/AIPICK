# AIPICK DB 스키마

> Supabase (PostgreSQL) 기반
> 마이그레이션 파일: `supabase/migrations/001~016`
> 최종 수정일: 2026-02-20

---

## 1. ERD 개요

```
categories ──1:N── tools ──1:N── reviews ──N:1── auth.users
                     │              │
                     ├──1:N── tool_feature_ratings ──N:1── auth.users
                     ├──1:N── comments ──N:1── auth.users
                     ├──N:M── bookmarks ──N:1── auth.users
                     ├──N:M── upvotes ──N:1── auth.users
                     └──N:M── collection_items ──N:1── collections ──N:1── auth.users

job_categories ──1:N── job_tool_recommendations ──N:1── tools
edu_levels ──1:N── edu_tool_recommendations ──N:1── tools

community_posts ──N:1── auth.users
community_posts ──N:M── community_tags (via community_post_tags)

news (독립)
guides ──N:1── job_categories (nullable)
guides ──N:1── edu_levels (nullable)
weekly_rankings ──N:1── tools
external_benchmark_scores ──N:1── tools
```

---

## 2. 핵심 테이블

### `categories` — AI 서비스 카테고리

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | text | 카테고리명 (예: 텍스트 생성) |
| slug | text | URL용 (예: text-generation) |
| description | text | 설명 |
| icon | text | Lucide 아이콘명 |
| sort_order | int | 노출 순서 |

---

### `tools` — AI 서비스 (핵심 테이블)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | text | 서비스명 |
| slug | text | URL용 (kebab-case) |
| description | text | 짧은 설명 |
| long_description | text | 상세 설명 |
| logo_url | text | 로고 이미지 URL |
| website_url | text | 서비스 URL |
| category_id | uuid | FK → categories.id |
| pricing_type | text | 'free' / 'freemium' / 'paid' |
| free_quota_detail | text | 무료 사용량 상세 |
| pros | text[] | 장점 배열 |
| cons | text[] | 단점 배열 |
| tags | text[] | 태그 배열 |
| korean_support | boolean | 한국어 지원 여부 |
| rating_avg | float | 종합 평점 (트리거 자동 갱신) |
| review_count | int | 리뷰 수 (트리거 자동 갱신) |
| visit_count | int | 방문 수 |
| upvote_count | int | 업보트 수 |
| bookmark_count | int | 북마크 수 |
| ranking_score | float | 레거시 랭킹 점수 |
| hybrid_score | float | 신규 하이브리드 점수 |
| benchmark_score | float | 외부 벤치마크 점수 |
| weekly_visit_delta | int | 주간 방문 변동 |
| prev_ranking | int | 이전 주 순위 (nullable) |
| sample_output | text | 결과 미리보기 텍스트 |
| sample_output_prompt | text | 미리보기 생성 프롬프트 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### `reviews` — 사용자 리뷰

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| tool_id | uuid | FK → tools.id |
| user_id | uuid | FK → auth.users.id |
| rating | int | 종합 별점 (1~5) |
| content | text | 리뷰 텍스트 |
| like_count | int | 도움이 됨 수 |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| UNIQUE(tool_id, user_id) | | 사용자당 1회 |

**트리거**: 리뷰 CUD → `tools.rating_avg`, `tools.review_count` 자동 갱신

---

### `tool_feature_ratings` — 기능별 세부 평가

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| tool_id | uuid | FK → tools.id |
| user_id | uuid | FK → auth.users.id |
| ui_score | int | UI 편의성 (1~5) |
| quality_score | int | 결과물 품질 (1~5) |
| speed_score | int | 속도 (1~5) |
| value_score | int | 가성비 (1~5) |
| korean_score | int | 한국어 품질 (1~5) |
| created_at | timestamptz | |
| UNIQUE(tool_id, user_id) | | 사용자당 1회 |

---

### `bookmarks` — 북마크

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| tool_id | uuid | FK → tools.id |
| created_at | timestamptz | |
| UNIQUE(user_id, tool_id) | | |

**트리거**: 북마크 추가/삭제 → `tools.bookmark_count` 자동 갱신

---

### `upvotes` — 서비스 업보트

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| tool_id | uuid | FK → tools.id |
| created_at | timestamptz | |
| UNIQUE(user_id, tool_id) | | |

**트리거**: 업보트 추가/삭제 → `tools.upvote_count` 자동 갱신

---

### `comments` — 댓글

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| tool_id | uuid | FK → tools.id |
| user_id | uuid | FK → auth.users.id |
| parent_id | uuid | FK → comments.id (대댓글, nullable) |
| content | text | 댓글 내용 |
| like_count | int | 좋아요 수 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### `collections` — 사용자 컬렉션

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| title | text | 컬렉션 제목 |
| description | text | 설명 (nullable) |
| is_public | boolean | 공개 여부 |
| like_count | int | 좋아요 수 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### `collection_items` — 컬렉션 항목

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| collection_id | uuid | FK → collections.id |
| tool_id | uuid | FK → tools.id |
| note | text | 메모 (nullable) |
| sort_order | int | 순서 |

---

## 3. 직군/학년 테이블

### `job_categories` — 직군 (10개)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | text | 직군명 |
| slug | text | URL용 |
| description | text | 직군 설명 |
| icon | text | Lucide 아이콘명 |
| sort_order | int | 노출 순서 |

---

### `job_tool_recommendations` — 직군-도구 매핑

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| job_category_id | uuid | FK → job_categories.id |
| tool_id | uuid | FK → tools.id |
| recommendation_type | text | 'essential' / 'recommended' / 'optional' |
| reason | text | 추천 이유 |
| sort_order | int | 노출 순서 |

---

### `edu_levels` — 교육 단계 (6단계)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | text | 단계명 (예: 초등 저학년) |
| slug | text | URL용 |
| description | text | 설명 |
| age_range | text | 대상 나이 (예: 7~9세) |
| sort_order | int | 노출 순서 |

---

### `edu_tool_recommendations` — 학년-도구 매핑

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| edu_level_id | uuid | FK → edu_levels.id |
| tool_id | uuid | FK → tools.id |
| safety_rating | text | 'safe' / 'guided' / 'advanced' |
| use_case | text | 활용 사례 |
| sort_order | int | 노출 순서 |

---

## 4. 커뮤니티 테이블

### `community_posts` — 커뮤니티 글

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| user_name | text | 작성자 이름 |
| title | text | 제목 |
| content | text | 본문 (Markdown) |
| post_type | text | 'discussion' / 'tip' / 'question' |
| target_type | text | 'tool' / 'news' / 'guide' / 'general' |
| target_id | text | 관련 대상 ID (nullable) |
| upvote_count | int | 업보트 수 |
| downvote_count | int | 다운보트 수 |
| comment_count | int | 댓글 수 |
| bookmark_count | int | 저장 수 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**인덱스**: GIN(tags, ai_tools), user_id, post_type, created_at DESC

---

### `community_tags` — 태그 사전

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| tag_type | text | 'GOAL' / 'AI_TOOL' / 'FEATURE' / 'KEYWORD' |
| tag_value | text | 태그 값 (slug) |
| display_name | text | 화면 표시명 |
| UNIQUE(tag_type, tag_value) | | |

---

### `community_post_tags` — 글-태그 N:M

| 컬럼 | 타입 | 설명 |
|------|------|------|
| post_id | uuid | FK → community_posts |
| tag_id | uuid | FK → community_tags |
| PRIMARY KEY(post_id, tag_id) | | |

---

## 5. 콘텐츠 테이블

### `news` — AI 뉴스

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| title | text | 뉴스 제목 |
| summary | text | 요약 |
| source_url | text | 원문 링크 |
| thumbnail_url | text | 썸네일 (nullable) |
| category | text | 'update' / 'launch' / 'industry' / 'pricing' |
| related_tool_id | uuid | FK → tools.id (nullable) |
| view_count | int | 조회수 |
| published_at | timestamptz | |
| created_at | timestamptz | |

---

### `guides` — AI 활용 가이드

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| title | text | 가이드 제목 |
| slug | text | URL용 |
| content | text | 마크다운 본문 |
| category | text | 'job' / 'education' / 'tip' |
| target_job_id | uuid | FK → job_categories.id (nullable) |
| target_edu_id | uuid | FK → edu_levels.id (nullable) |
| thumbnail_url | text | 썸네일 (nullable) |
| view_count | int | 조회수 |
| published_at | timestamptz | |
| created_at | timestamptz | |

---

## 6. 랭킹/파이프라인 테이블

### `weekly_rankings` — 주간 랭킹 스냅샷

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| tool_id | uuid | FK → tools.id |
| week_start | date | 주 시작일 (월요일) |
| ranking | int | 해당 주 순위 |
| ranking_score | float | 해당 주 점수 |
| visit_count | int | 해당 주 방문 수 |

---

### `external_benchmark_scores` — 외부 벤치마크

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| tool_id | uuid | FK → tools.id |
| source | text | 'lmsys' / 'alpacaeval' / 'artificial-analysis' |
| score | float | 점수 |
| score_type | text | 'elo' / 'winrate' / 'quality' |
| collected_at | timestamptz | 수집 시각 |

---

## 7. RLS (Row Level Security) 정책 요약

| 테이블 | 읽기 | 쓰기 |
|--------|------|------|
| tools, categories | Public | 관리자만 (admin API) |
| reviews | Public | 로그인 사용자 본인만 |
| bookmarks | 본인만 | 본인만 |
| upvotes | Public (집계) | 로그인 사용자 본인만 |
| comments | Public | 로그인 사용자 본인만 |
| community_posts | Public | 로그인 사용자 본인만 |
| collections (public) | Public | 본인만 수정 |
| news, guides | Public | 관리자만 |

---

## 8. DB 마이그레이션 이력

| # | 파일 | 내용 |
|---|------|------|
| 001 | initial_schema.sql | tools, categories, reviews, bookmarks, upvotes, comments, collections, job_categories, edu_levels, news, guides, weekly_rankings |
| 002 | add_user_name_columns.sql | 사용자 이름 필드 |
| 003 | community_posts.sql | 커뮤니티 v1 |
| 004 | external_data_pipeline.sql | 외부 데이터 수집 파이프라인 테이블 |
| 005 | tool_discovery_pipeline.sql | 도구 발견 파이프라인 |
| 006 | evaluation_system.sql | 평가 시스템 |
| 007 | tool_content_enrichment.sql | long_description, usage_tips, sample_output |
| 008 | tool_suggestions.sql | 도구 제안 시스템 |
| 009 | community_v2_tags.sql | 커뮤니티 v2 태그 시스템 |
| 010 | daily_picks.sql | 오늘의 추천 |
| 011 | qa_system.sql | Q&A 시스템 |
| 012 | notifications.sql | 알림 시스템 |
| 013 | user_profiles_reputation.sql | 사용자 평판 |
| 014 | provocation_system.sql | 도발적 질문 시스템 |
| 015 | multi_category_support.sql | 다중 카테고리 지원 |
| 016 | rating_scoring_redesign.sql | 평점/스코어링 재설계 |

**트리거 목록**:
- `updated_at` 자동 갱신 (tools, comments, collections)
- `vote_count` 자동 갱신 (community_posts)
- `comment_count` 자동 갱신 (community_posts)
- `bookmark_count` 자동 갱신 (tools, community_posts)
- `tools.rating_avg`, `tools.review_count` (reviews CUD)

---

## 9. 현재 데이터 소스 상태

| 상태 | 설명 |
|------|------|
| Supabase 미연결 | `.env.local` 플레이스홀더 |
| 폴백 모드 | `data/seed.json` (216개 도구) 직접 사용 |
| 전환 필요 | Supabase 연결 후 seed.json → DB 마이그레이션 |

→ 마이그레이션 가이드: [REAL-DATA-MIGRATION.md](./REAL-DATA-MIGRATION.md)
