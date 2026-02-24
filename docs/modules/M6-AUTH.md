# M6. 인증 / 프로필 / 컬렉션 모듈

> 담당 경로: `/auth/login`, `/profile`, `/bookmarks`, `/collections`
> 관련 모듈: [M4-COMMUNITY](./M4-COMMUNITY.md) (글/댓글 작성), [M2-RANKING](./M2-RANKING.md) (북마크→랭킹)
> 최종 수정일: 2026-02-20

---

## 1. 모듈 개요

사용자 인증 및 개인화 기능을 담당한다.
로그인하지 않아도 탐색·조회는 가능하지만,
**북마크·리뷰·커뮤니티 참여·컬렉션**은 로그인이 필요하다.

---

## 2. 인증 시스템

### 2.1 지원 OAuth Provider

| Provider | 상태 | 비고 |
|---------|------|------|
| Google | 설정 필요 | 주 로그인 방법 |
| GitHub | 설정 필요 | 개발자 유저 타겟 |
| Kakao | 설정 필요 | 한국 유저 타겟 |

**구현**: Supabase Auth

### 2.2 인증 관련 파일

| 파일 | 역할 |
|------|------|
| `app/auth/login/page.tsx` | 소셜 로그인 페이지 |
| `app/auth/callback/route.ts` | OAuth 콜백 처리 |
| `middleware.ts` | 보호 라우트 접근 제어 |
| `components/auth/AuthButton.tsx` | 헤더 로그인/로그아웃 버튼 |
| `components/auth/AuthGuard.tsx` | 로그인 필요 시 유도 모달 |
| `lib/auth/AuthContext.tsx` | 전역 인증 상태 |
| `lib/auth/adminCheck.ts` | 관리자 권한 확인 |

### 2.3 보호 라우트

로그인 필요한 경로 (`middleware.ts`에서 리다이렉트):
- `/community/write`
- `/bookmarks`
- `/collections` (생성/수정)
- `/profile`
- 리뷰 작성, 댓글 작성 (모달 방식)

### 2.4 보안 이슈 (Critical)

**파일**: `lib/auth/adminCheck.ts`

```typescript
// ❌ 현재 코드 — ADMIN_EMAILS 미설정 시 모든 사용자가 관리자!
if (admins.length === 0) return true;

// ✅ 수정 필요
if (admins.length === 0) return false;
```

→ `ADMIN_EMAILS` 환경변수를 반드시 설정해야 함

---

## 3. 사용자 프로필 (`/profile`)

### 3.1 구성

```
┌─────────────────────────────────────────┐
│ 프로필 헤더                               │
│  아바타 | 이름 | 이메일 | 가입일           │
├─────────────────────────────────────────┤
│ 탭 네비게이션                             │
│  내 리뷰 | 내 북마크 | 내 컬렉션 | 내 댓글 │
└─────────────────────────────────────────┘
```

### 3.2 사용자 평판 (Reputation)

DB 테이블: `user_profiles_reputation` (migration 013)

| 항목 | 계산 기준 |
|------|---------|
| 리뷰 수 | 작성한 리뷰 개수 |
| 도움된 리뷰 수 | 다른 사용자에게 "도움이 됨" 받은 수 |
| 커뮤니티 참여 | 글 + 댓글 수 |

---

## 4. 리뷰 시스템

### 4.1 리뷰 구성

| 항목 | 타입 | 설명 |
|------|------|------|
| 종합 별점 | 1~5 | 전체 만족도 |
| 텍스트 리뷰 | text | 자유 작성 |
| UI 편의성 | 1~5 | 세부 평가 |
| 결과물 품질 | 1~5 | 세부 평가 |
| 속도/응답 | 1~5 | 세부 평가 |
| 가성비 | 1~5 | 세부 평가 |
| 한국어 품질 | 1~5 | 세부 평가 |

### 4.2 리뷰 → 도구 통계 자동 갱신

DB 트리거: 리뷰 CUD 시 `tools.rating_avg`, `tools.review_count` 자동 갱신

### 4.3 기능별 세부 점수 → 레이더 차트

`components/ranking/BenchmarkScores.tsx`에서 레이더 차트 형태로 표시

### 4.4 정렬 옵션
- 최신순 / 평점순 / 도움순

---

## 5. 북마크 (`/bookmarks`)

### 5.1 기능
- 로그인 후 ServiceCard에서 북마크 버튼 표시
- 추가/제거 토글
- 북마크 수 → `tools.bookmark_count` → 랭킹 반영 (10% 가중치)

### 5.2 관련 파일

| 파일 | 역할 |
|------|------|
| `hooks/useBookmark.ts` | 북마크 토글 로직 |
| `app/bookmarks/page.tsx` | 내 북마크 목록 |
| `/api/bookmarks` | 북마크 CRUD API |

---

## 6. 업보트 (Upvote)

### 6.1 기능
- AI 서비스 카드에서 업보트 버튼 (로그인 필수)
- 1인 1회 (중복 방지)
- 업보트 수 → `tools.upvote_count` → 랭킹 반영

### 6.2 커뮤니티 업보트 vs 서비스 업보트
| 대상 | 테이블 | 영향 |
|------|--------|------|
| AI 서비스 | `upvotes` | tools.upvote_count → 랭킹 |
| 커뮤니티 글 | `community_posts.upvote_count` | 커뮤니티 인기순 |

---

## 7. 사용자 컬렉션 (`/collections`)

### 7.1 개념
"나만의 AI 툴킷" — 사용자가 직접 AI 도구 묶음을 만들어 공유

**예시**:
- "프리랜서 디자이너의 AI 세트"
- "대학생 필수 무료 AI 5선"

### 7.2 기능

| 기능 | 설명 |
|------|------|
| 생성/수정 | 제목, 설명, AI 도구 검색으로 추가 |
| 공개/비공개 | `is_public` 설정 |
| 좋아요 | 인기 컬렉션 기준 |
| 공유 | URL 공유 |

### 7.3 컬렉션 목록 (`/collections`)
- 인기순(좋아요 수) 정렬
- 최신순 탭

### 7.4 DB 스키마

```
collections
  ├── id, user_id, title, description
  ├── is_public (boolean)
  └── like_count

collection_items
  ├── collection_id → collections
  ├── tool_id → tools
  ├── note (메모)
  └── sort_order
```

→ 전체 스키마: [DB-SCHEMA.md](../DB-SCHEMA.md)

---

## 8. 관련 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| 로그인 | `app/auth/login/page.tsx` | OAuth 로그인 |
| 프로필 | `app/profile/page.tsx` | 사용자 대시보드 |
| 북마크 목록 | `app/bookmarks/page.tsx` | 내 북마크 |
| 컬렉션 목록 | `app/collections/page.tsx` | 인기 컬렉션 |
| 컬렉션 상세 | `app/collections/[id]/page.tsx` | 컬렉션 보기 |
| 컬렉션 생성 | `components/collection/CollectionForm.tsx` | 생성/수정 폼 |
| 리뷰 폼 | `components/review/ReviewForm.tsx` | 리뷰 작성 |
| 리뷰 목록 | `components/review/ReviewList.tsx` | 리뷰 표시 |
| 북마크 훅 | `hooks/useBookmark.ts` | 토글 로직 |
| 업보트 훅 | `hooks/useUpvote.ts` | 토글 로직 |

---

## 9. 미결 이슈 / 개선 포인트

| 이슈 | 우선순위 | 메모 |
|------|---------|------|
| **Admin 인증 기본값 버그** | Critical | `return false` 로 수정 필요 |
| OAuth Provider 설정 | High | 배포 전 3개 모두 설정 |
| profile/bookmarks Client Component | Medium | 일부 Server Component 전환 가능 |
| useBookmark + useUpvote 중복 70% | Low | 공통 훅 `useBooleanToggle` 추출 |
| localStorage 57개 인스턴스 | Medium | `lib/storage.ts` 유틸리티로 통합 |
