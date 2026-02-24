# M4. 커뮤니티 모듈

> 담당 경로: `/community`, `/community/write`, `/community/[post_id]`
> 관련 모듈: [M6-AUTH](./M6-AUTH.md) (사용자 인증), [M2-RANKING](./M2-RANKING.md) (업보트 → 랭킹 반영)
> 최종 수정일: 2026-02-20
> 원본 PRD: COMMUNITY_V2_PRD.md (이 파일로 통합)

---

## 1. 모듈 개요

**통합 커뮤니티**: 모든 글은 단일 `community_posts` 테이블에 저장되고,
자동 태그 기반으로 다양한 컨텍스트에서 필터링되어 표시된다.

### 핵심 원칙
- **하나의 피드**: 별도 게시판 없이 태그로 분류
- **자동 태그**: 사용자가 분류하지 않아도 시스템이 자동 추출
- **URL별 자동 필터**: 현재 URL에 따라 관련 글만 표시
- **컨텍스트 연계**: AI 도구 상세 페이지, 레시피 페이지에서도 관련 커뮤니티 표시

---

## 2. URL 구조

| URL | 설명 | 자동 필터 |
|-----|------|---------|
| `/community` | 통합 피드 (메인) | 전체 |
| `/community/write` | 글 작성 | — |
| `/community/[post_id]` | 글 상세 | — |
| `/community?goal=[slug]` | 목적별 피드 | goal 태그 |
| `/community?ai=[slug]` | AI별 피드 | ai_tool 태그 |
| `/community?tag=[keyword]` | 태그별 피드 | keyword 태그 |
| `/tools/[slug]` 하단 | 도구별 커뮤니티 | ai=toolSlug 자동 필터 |

### URL 쿼리 파라미터

| 파라미터 | 설명 | 예시 |
|---------|------|------|
| `goal` | 목적 필터 | `?goal=image-generation` |
| `ai` | AI 서비스 필터 | `?ai=chatgpt` |
| `keyword` | 키워드 검색 | `?keyword=프롬프트` |
| `sort` | 정렬 | `?sort=latest\|popular\|saved` |
| `tag` | 태그 직접 필터 | `?tag=ChatGPT` |

---

## 3. 글 타입 (Post Type)

| 타입 | 의미 | 뱃지 |
|------|------|------|
| discussion | 일반 토론 | 파랑 |
| tip | AI 활용 팁 | 초록 |
| question | 질문 | 노랑 |

> 글 타입은 수동 선택, 나머지 분류는 태그가 담당.

---

## 4. 자동 태그 시스템

### 4.1 태그 4종

| 태그 타입 | 설명 | 예시 |
|---------|------|------|
| GOAL | 목적/사용 상황 | `image-generation`, `writing` |
| AI_TOOL | AI 서비스명 | `chatgpt`, `midjourney` |
| FEATURE | AI 기능 키워드 | `프롬프트`, `파인튜닝` |
| KEYWORD | 일반 키워드 | `생산성`, `무료` |

### 4.2 자동 태그 추출 로직

**위치**: `lib/community/tag-extractor.ts`

```
글 제목 + 본문 분석
  ↓
1. AI 서비스명 사전 매칭 (tools 테이블 slug 기반)
   → AI_TOOL 태그 생성
2. 목적 카테고리 키워드 매칭 (PURPOSE_CATEGORIES 기반)
   → GOAL 태그 생성
3. 기능 키워드 사전 매칭
   → FEATURE 태그 생성
4. 나머지 명사 추출
   → KEYWORD 태그 생성
```

### 4.3 태그와 URL 필터 연계

| 상황 | 동작 |
|------|------|
| 도구 상세 페이지 `/tools/[slug]` | 해당 도구 커뮤니티 → `?ai=[slug]` 자동 필터 |
| 레시피 페이지 `/recipes/[slug]` | 사용된 도구+키워드 OR 필터 자동 적용 |
| 태그 클릭 | `/community?tag=[tagValue]` 로 이동 |

---

## 5. 기능 명세

### 5.1 글 목록 (피드)
- 정렬: 최신순 / 인기순(업보트) / 저장순
- 무한 스크롤 또는 페이지네이션
- 필터 바: 글 타입(discussion/tip/question) + 태그 필터

### 5.2 글 작성 (`/community/write`)
- 제목 + 본문 (Markdown 지원)
- 글 타입 선택 (토론/팁/질문)
- 이미지 첨부 (선택)
- 작성 시 자동 태그 추출 → 미리보기 표시
- 로그인 필수

### 5.3 글 상세 (`/community/[post_id]`)
- 본문 + 자동 추출된 태그 칩 표시
- 업보트 / 다운보트 버튼
- 저장(북마크) 버튼
- 댓글 섹션 (대댓글 1단계)
- 신고 기능
- 본인 글 수정/삭제

### 5.4 업보트/다운보트
- 로그인 사용자만 가능
- 1인 1표 (중복 방지)
- 업보트 수 → tools.upvote_count → 랭킹 반영

### 5.5 댓글
- 댓글 + 대댓글 (1단계)
- 댓글 좋아요
- 본인 댓글 수정/삭제
- 신고

---

## 6. DB 스키마

### community_posts

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| user_name | text | 작성자 이름 (캐시) |
| title | text | 제목 |
| content | text | 본문 (Markdown) |
| post_type | text | discussion / tip / question |
| target_type | text | tool / news / guide / general |
| target_id | text | 관련 대상 ID |
| upvote_count | int | 업보트 수 |
| downvote_count | int | 다운보트 수 |
| comment_count | int | 댓글 수 |
| bookmark_count | int | 저장 수 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### community_tags

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| tag_type | text | GOAL / AI_TOOL / FEATURE / KEYWORD |
| tag_value | text | 태그 값 |
| display_name | text | 화면 표시 이름 |

### community_post_tags

| 컬럼 | 타입 | 설명 |
|------|------|------|
| post_id | UUID | FK → community_posts |
| tag_id | UUID | FK → community_tags |

→ 전체 스키마: [DB-SCHEMA.md](../DB-SCHEMA.md)

---

## 7. API 엔드포인트

| 엔드포인트 | 메서드 | 역할 |
|-----------|--------|------|
| `/api/community/v2` | GET | 글 목록 (필터/정렬) |
| `/api/community/v2` | POST | 글 작성 (태그 자동 추출 포함) |
| `/api/community/v2/[id]` | GET/PUT/DELETE | 글 상세/수정/삭제 |
| `/api/community/v2/[id]/votes` | POST | 업보트/다운보트 |
| `/api/community/v2/[id]/bookmark` | POST | 저장 |
| `/api/community/v2/mentions` | GET | 멘션 알림 |

### 보안 이슈 (CODE_REVIEW)
- **SQL 인젝션 위험**: keyword 파라미터 직접 삽입 → 특수문자 이스케이핑 필요
- **N+1 쿼리**: 태그 삽입 시 순차 처리 → `Promise.all()` 또는 벌크 insert로 개선 필요

---

## 8. 관련 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| 커뮤니티 피드 | `app/community/page.tsx` | 통합 피드 |
| 글 작성 | `app/community/write/page.tsx` | 글 작성 |
| 포스트 카드 | `components/community/v2/CommunityPostCardV2.tsx` | 글 목록 카드 |
| 필터 바 | `components/community/v2/CommunityFilterBar.tsx` | 태그/정렬 필터 |
| 태그 추출기 | `lib/community/tag-extractor.ts` | 자동 태그 추출 |

---

## 9. 미결 이슈 / 개선 포인트

| 이슈 | 우선순위 | 메모 |
|------|---------|------|
| Community 전체가 Client Component | High | Server Component 부분 전환 검토 |
| N+1 쿼리 (태그 삽입) | High | Promise.all 병렬화 필요 |
| SQL 인젝션 (keyword) | High | 이스케이핑 함수 추가 필요 |
| localStorage 폴백 | Medium | Supabase 연동 후 제거 |
| 실시간 업데이트 | Low | Supabase Realtime 도입 검토 |
| 글 신고 관리 (admin) | Low | 배포 후 구현 |
