# AIPICK - 단계별 개발 상세 진행사항 (v2)

> 각 Phase의 세부 태스크와 진행 상태를 추적합니다.
> 상태: [ ] 미진행 / [~] 진행중 / [x] 완료
> v2.0 - 랭킹, 직군/학년별 추천, 커뮤니티, 뉴스, PWA 추가

---

## Phase 1: 프로젝트 초기 세팅 및 메인 UI/UX ✅ 완료

(Phase 1 상세 내용 생략 - 이미 완료됨)

**산출물**: 더미 데이터 기반 반응형 메인 페이지 (빌드 통과, 서버 동작 확인)

---

## Phase 2: DB 연동 + 상세 페이지 + 랭킹 + 직군/학년별 추천 ✅ 완료

### 2-1. Supabase 설정
- [x] Supabase 프로젝트 연결 가이드 문서화
- [x] `lib/supabase/client.ts` - 브라우저용 클라이언트
- [x] `lib/supabase/server.ts` - Server Component용 클라이언트
- [x] 환경변수 설정 (.env.local)

### 2-2. DB 마이그레이션 (전체 스키마)
- [x] `supabase/migrations/001_initial_schema.sql`
  - categories, tools (기존 + ranking_score, upvote_count, weekly_visit_delta, prev_ranking)
  - reviews, bookmarks
  - **job_categories** - 직군 10개
  - **edu_levels** - 교육 단계 6개
  - **job_tool_recommendations** - 직군-툴 매핑
  - **edu_tool_recommendations** - 학년-툴 매핑
  - **tool_feature_ratings** - 기능별 세부 평가
  - **comments** - 댓글 (parent_id로 대댓글)
  - **upvotes** - 업보트
  - **collections**, **collection_items** - 사용자 컬렉션
  - **guides** - AI 활용 가이드
  - **news** (변경: category, related_tool_id, view_count 추가)
  - **weekly_rankings** - 주간 랭킹 스냅샷
  - RLS (Row Level Security) 정책 전체 적용
  - 인덱스 설정 (검색, 정렬, FK)

### 2-3. 시드 데이터
- [x] `supabase/seed.sql`
  - categories 8개 (기존 seed.json 기반)
  - tools 26개+ (기존 seed.json 기반)
  - **job_categories 10개**: AI 개발자, UI/UX 디자이너, 그래픽 디자이너, 마케터, 영상 크리에이터, 작가/블로거, 데이터 분석가, 사업가/창업자, 음악가/작곡가, PM/기획자
  - **edu_levels 6개**: 초등 저학년, 초등 고학년, 중학생, 고등학생, 대학생, 교사/교수
  - **job_tool_recommendations**: 직군별 필수/추천/선택 매핑
  - **edu_tool_recommendations**: 학년별 안전등급 + 활용사례 매핑
  - 초기 뉴스 5건

### 2-4. 타입 정의 업데이트
- [x] `types/index.ts` 확장
  - JobCategory, EduLevel
  - JobToolRecommendation, EduToolRecommendation
  - ToolFeatureRating, Comment, Upvote
  - Collection, CollectionItem, Guide
  - WeeklyRanking, News (변경)

### 2-5. 데이터 페칭 레이어
- [x] `lib/supabase/queries.ts`
  - getTools(), getToolBySlug(), getToolsByCategory()
  - getEditorPicks(), getCategories()
  - getSimilarTools()
  - **getRankings(category?)** - 종합/카테고리별 랭킹
  - **getTrending()** - 주간 트렌딩
  - **getJobCategories(), getJobRecommendations(jobSlug)**
  - **getEduLevels(), getEduRecommendations(levelSlug)**
  - incrementVisitCount()

### 2-6. 메인 페이지 DB 연동
- [x] 더미 데이터 → Supabase 쿼리로 교체
- [x] Skeleton 로딩 UI 적용
- [x] error.tsx, not-found.tsx 에러 페이지
- [x] **메인 페이지에 직군/학년 퀵 네비게이션 추가**
  - "당신의 직업은?" 직군 아이콘 그리드
  - "학생이신가요?" 학년 선택 섹션
- [x] **메인 페이지에 종합 랭킹 TOP 5 위젯**

### 2-7. 서비스 상세 페이지
- [x] `app/tools/[slug]/page.tsx`
  - 서비스 헤더 (로고, 이름, 설명, 카테고리, 평점, 업보트 수)
  - "서비스 바로가기" 외부 링크 버튼
  - **"무료로 어디까지?" 섹션** (강조)
  - 장점/단점 섹션
  - 가격 정보
  - **기능별 평균 점수 레이더 차트** (UI, 품질, 속도, 가성비, 한국어)
  - 유사 서비스 추천 카드 3개
  - 리뷰 영역 (Phase 4에서 인터랙션 추가)
  - 댓글 영역 (Phase 4에서 인터랙션 추가)
- [x] `app/tools/[slug]/loading.tsx` - 스켈레톤 UI
- [x] visit_count 증가 API
- [x] 동적 메타데이터 (SEO)

### 2-8. 랭킹 페이지
- [x] `app/rankings/page.tsx` - 종합 랭킹
  - TOP 100 테이블 (순위, 서비스명, 카테고리, 평점, 주간 변동 ↑↓)
  - 1~3위 강조 디자인 (금/은/동)
  - 카테고리 탭 필터
- [x] `app/rankings/[category]/page.tsx` - 카테고리별 랭킹
  - 해당 카테고리 TOP 20

### 2-9. 직군별 추천 페이지
- [x] `app/jobs/page.tsx` - 직군 목록
  - 아이콘 + 이름 + 간단 설명 카드 그리드
  - "당신의 직업을 선택하세요"
- [x] `app/jobs/[slug]/page.tsx` - 직군 상세
  - 직군 소개 헤더
  - **필수 AI 툴킷** (essential) - 카드 리스트
  - **추천 AI** (recommended) - 카드 리스트
  - **선택 AI** (optional) - 카드 리스트
  - 추천 이유(reason) 표시
  - "이 직군 사용자들이 많이 쓰는 AI" (해당 직군 리뷰 기반)

### 2-10. 학년별 추천 페이지
- [x] `app/education/page.tsx` - 교육 메인
  - 학년별 카드: 초등 저/고, 중, 고, 대학, 교사
  - 각 카드에 대표 추천 AI 미리보기
  - 안전 등급 범례 설명
- [x] `app/education/[level]/page.tsx` - 학년 상세
  - 학년 소개 (나이대, 설명)
  - **안전 등급별 AI 추천**
    - 🟢 Safe: 자유롭게 사용 가능
    - 🟡 Guided: 보호자/교사 지도 하에 사용
    - 🔴 Advanced: 고학년/성인용
  - 활용 사례 및 팁
  - 학부모/교사 가이드 링크

**완료 기준**: Supabase 연동, 상세 페이지, 랭킹 TOP 100, 직군 10개, 학년 6개 모두 동작

---

## Phase 3: 검색 + 필터 + 추천 위자드 ✅ 완료

### 3-1. 검색 기능
- [x] `app/api/search/route.ts` - 검색 API
  - Supabase full-text search 또는 ilike
  - 서비스명, 설명, 태그 기반 검색
- [x] `components/search/SearchBar.tsx`
  - 디바운스 (300ms)
  - 자동완성 드롭다운 (인기 검색어 + 매칭 서비스)
- [x] `app/search/page.tsx` - 검색 결과
  - 결과 개수, 검색어 하이라이팅
  - 결과 없을 때 "이런 서비스는 어때요?" 제안
  - 필터 사이드바 연동

### 3-2. 필터 시스템
- [x] `components/search/FilterSidebar.tsx`
  - 가격: Free / Freemium / Paid (체크박스)
  - 카테고리: 다중 선택
  - 한국어 지원 (토글)
  - 평점: 4점 이상 등
  - **직군 필터**: 특정 직군에 추천되는 AI만
  - **학년 필터**: 특정 학년에 적합한 AI만
  - 정렬: 인기순 / 평점순 / 최신순 / 무료우선
- [x] URL 쿼리 파라미터 동기화
  - `?pricing=free&category=text-generation&job=marketer&sort=popular`
  - 뒤로가기 시 필터 유지
  - 필터 URL 공유 가능

### 3-3. 카테고리 페이지
- [x] `app/category/[slug]/page.tsx`
  - 카테고리 헤더 (이름, 설명, 아이콘)
  - 해당 카테고리 서비스 그리드
  - 필터 사이드바 연동
  - 카테고리별 랭킹 TOP 3 강조

### 3-4. 추천 위자드 (4단계)
- [x] `app/recommend/page.tsx`
- [x] `components/recommend/Wizard.tsx`
  - 프로그레스 바 UI
  - **Step 1**: "어떤 작업을 하시나요?" → 카테고리 선택
  - **Step 2**: "당신은 누구인가요?" → 직군 또는 학년 선택
  - **Step 3**: "예산은?" → 무료만 / $10 이하 / 상관없음
  - **Step 4**: "한국어 지원 필요?" → 필수 / 상관없음
  - **결과**: 매칭 TOP 3 서비스 카드 + 추천 이유
- [x] 위자드 로직: 조건에 맞는 서비스를 ranking_score로 정렬

**완료 기준**: 검색/필터/카테고리/위자드 모든 경로에서 정확한 AI 탐색 가능

---

## Phase 4: 인증 + 리뷰 + 댓글 + 북마크 + 업보트

### 4-1. 인증
- [ ] Supabase Auth 설정 (Google, GitHub, **Kakao** Provider)
- [ ] `app/auth/login/page.tsx` - 소셜 로그인 페이지
- [ ] `app/auth/callback/route.ts` - OAuth 콜백 처리
- [ ] `middleware.ts` - 인증 보호 라우트
- [ ] `components/auth/AuthButton.tsx` - 로그인/로그아웃 버튼
- [ ] `components/auth/AuthGuard.tsx` - 로그인 필요 시 유도 모달

### 4-2. 사용자 프로필
- [ ] `app/profile/page.tsx`
  - 기본 정보 (이메일, 이름, 아바타)
  - 내 리뷰 목록
  - 내 북마크
  - 내 컬렉션
  - 내 댓글

### 4-3. 북마크
- [ ] `hooks/useBookmark.ts`
- [ ] 북마크 추가/제거 API
- [ ] ServiceCard에 북마크 아이콘 (로그인 시 활성)
- [ ] `app/bookmarks/page.tsx` - 내 북마크 페이지

### 4-4. 업보트
- [ ] `hooks/useUpvote.ts`
- [ ] 업보트 토글 API
- [ ] ServiceCard에 업보트 버튼 + 카운트
- [ ] 업보트 시 tools.upvote_count 자동 갱신

### 4-5. 리뷰 시스템 (강화)
- [ ] `components/review/ReviewForm.tsx`
  - 종합 별점 (1~5)
  - 텍스트 리뷰
  - **기능별 세부 평가** (UI, 품질, 속도, 가성비, 한국어) 각 1~5
  - 로그인 필수
- [ ] `components/review/ReviewList.tsx`
  - 리뷰 카드: 작성자, 별점, 세부 평가 요약, 내용, 날짜
  - 리뷰 좋아요 (도움이 돼요)
  - 정렬: 최신순 / 평점순 / 도움순
- [ ] 상세 페이지에 리뷰 섹션 연동
- [ ] DB Trigger: 리뷰 CUD 시 tools.rating_avg, review_count 자동 갱신
- [ ] 기능별 평균 점수 계산 → 상세 페이지 레이더 차트 데이터
- [ ] 본인 리뷰 수정/삭제

### 4-6. 댓글 시스템
- [ ] `components/comment/CommentForm.tsx` - 댓글 작성
- [ ] `components/comment/CommentList.tsx` - 댓글 리스트
  - 대댓글 (1단계) 지원
  - 좋아요 기능
  - 신고 기능
  - 본인 댓글 수정/삭제
- [ ] 상세 페이지에 댓글 섹션 연동

**완료 기준**: 로그인, 북마크, 업보트, 리뷰(기능별 평가), 댓글 모두 정상 동작

---

## Phase 5: 뉴스 + 컬렉션 + 가이드 + 관리자 + 트렌딩

### 5-1. AI 뉴스 섹션
- [ ] `app/news/page.tsx` - 뉴스 메인
  - 카드형 리스트 (썸네일, 제목, 요약, 출처, 날짜)
  - 카테고리 필터 탭 (업데이트, 신규 출시, 업계 동향, 가격 변경)
  - 주간 핫 뉴스 TOP 5 사이드바
- [ ] `components/news/NewsCard.tsx`
- [ ] 뉴스 → 원문 링크 리다이렉트 + view_count 증가
- [ ] 메인 페이지에 "최신 AI 소식" 위젯 (3건)
- [ ] 관련 서비스 연결 (related_tool_id)

### 5-2. 사용자 컬렉션
- [ ] `app/collections/page.tsx` - 인기 컬렉션 목록
  - 좋아요순 정렬
  - 최신순 탭
- [ ] `app/collections/[id]/page.tsx` - 컬렉션 상세
  - 제목, 설명, 작성자
  - 포함된 AI 서비스 카드 리스트
  - 좋아요, 공유 버튼
- [ ] `components/collection/CollectionForm.tsx` - 컬렉션 생성/수정
  - 제목, 설명
  - AI 서비스 추가 (검색으로 찾아서 추가)
  - 공개/비공개 설정
- [ ] 프로필에서 내 컬렉션 관리

### 5-3. AI 활용 가이드
- [ ] `app/guides/page.tsx` - 가이드 목록
  - 직군별 / 학년별 / 팁 카테고리 탭
- [ ] `app/guides/[slug]/page.tsx` - 가이드 상세
  - 마크다운 렌더링
  - 관련 AI 서비스 카드 인라인 삽입
  - 조회 수 표시
- [ ] 직군/학년 상세 페이지에서 관련 가이드 링크

### 5-4. 주간 트렌딩
- [ ] `app/trending/page.tsx`
  - 이번 주 급상승 TOP 10 (visit 변동 기준)
  - 신규 등록 서비스 하이라이트
  - 무료 쿼터 변경 서비스 알림
- [ ] 주간 랭킹 스냅샷 Cron Job (Supabase Edge Function 또는 Vercel Cron)
  - 매주 월요일 rankings 스냅샷 저장
  - weekly_visit_delta, prev_ranking 갱신

### 5-5. 관리자 대시보드
- [ ] 관리자 접근 권한 (ADMIN_EMAILS 환경변수)
- [ ] `app/admin/page.tsx` - 대시보드
  - 통계: 총 서비스 수, 총 리뷰, 총 사용자, 주간 방문
  - 인기 서비스 TOP 10
  - 최근 리뷰/댓글
- [ ] `app/admin/tools/...` - 서비스 CRUD
- [ ] `app/admin/news/...` - 뉴스 CRUD
- [ ] `app/admin/guides/...` - 가이드 CRUD
- [ ] `app/admin/jobs/...` - 직군 관리 (매핑 추가/수정)
- [ ] `app/admin/education/...` - 학년 관리 (매핑 추가/수정)
- [ ] 댓글/리뷰 신고 관리

**완료 기준**: 뉴스 피드, 컬렉션 생성/공유, 가이드, 트렌딩, 관리자 CRUD 모두 동작

---

## Phase 6: SEO + PWA + 성능 최적화 + 뉴스레터

### 6-1. PWA (Progressive Web App)
- [ ] `next-pwa` 설정
- [ ] `manifest.json` (앱 이름, 아이콘, 테마 색상)
- [ ] Service Worker (오프라인 캐시)
- [ ] 앱 설치 유도 배너 ("홈 화면에 추가")
- [ ] 하단 탭 바 네비게이션 (모바일 앱 느낌)
  - 홈 / 랭킹 / 검색 / 뉴스 / MY

### 6-2. SEO 완성
- [ ] 모든 페이지 동적 메타데이터
  - title, description, og:image, twitter:card
- [ ] `app/sitemap.ts` - 동적 사이트맵
- [ ] `app/robots.ts` - robots.txt
- [ ] JSON-LD 구조화 데이터
  - WebSite (메인)
  - SoftwareApplication (서비스 상세)
  - Review (리뷰)
  - Article (뉴스, 가이드)

### 6-3. 성능 최적화
- [ ] `next/image` 이미지 최적화
- [ ] ISR (revalidate) 설정 - 랭킹, 뉴스 등
- [ ] 번들 분석 (@next/bundle-analyzer)
- [ ] Suspense Boundary 적용
- [ ] Error Boundary 적용
- [ ] Lighthouse 전 항목 90+ 달성

### 6-4. 뉴스레터 구독
- [ ] 이메일 수집 폼 (메인 페이지 + 뉴스 페이지)
- [ ] 구독자 DB 테이블
- [ ] 주간 AI 뉴스레터 발송 (Resend 또는 Supabase Edge Function)

### 6-5. 추가 앱 전환 준비
- [ ] 터치 제스처 최적화 (스와이프, 풀 투 리프레시)
- [ ] 푸시 알림 기반 구조 (Web Push API)
- [ ] 오프라인 시 캐시된 데이터 표시
- [ ] 향후 React Native / Capacitor 전환 가이드 문서

**완료 기준**: PWA 설치 가능, Lighthouse 전 항목 90+, 뉴스레터 구독 동작

---

## 개발 진행 요약

| Phase | 상태 | 핵심 산출물 |
|-------|------|------------|
| Phase 1 | ✅ 완료 | 메인 UI, 서비스 카드, 더미 데이터 |
| Phase 2 | ✅ 완료 | DB 연동, 상세 페이지, 랭킹, 직군/학년 |
| Phase 3 | ✅ 완료 | 검색, 필터, 추천 위자드 |
| Phase 4 | [~] 진행중 | 인증, 리뷰, 댓글, 북마크, 업보트 |
| Phase 5 | [ ] 미진행 | 뉴스, 컬렉션, 가이드, 관리자, 트렌딩 |
| Phase 6 | [ ] 미진행 | PWA, SEO, 성능, 뉴스레터 |
