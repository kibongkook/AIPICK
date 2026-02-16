# AIPICK 프로젝트 컨벤션

## 프로젝트 개요
- **AIPICK**: 사용자 목적/직군/학년에 맞는 AI 서비스 큐레이션 플랫폼
- **핵심 가치**: 무료 사용량(Quota) 정보 + 직군/학년별 맞춤 추천 + 랭킹 + 커뮤니티
- **5가지 탐색 경로**: 목적별, 직군별, 학년별, 랭킹, 검색

## 기술 스택
- Next.js 14 (App Router), React 19, TypeScript
- Tailwind CSS v4, Lucide React
- Supabase (PostgreSQL, Auth - Google/GitHub/Kakao OAuth)
- Zustand (상태 관리)
- Vercel (배포)
- PWA (Phase 6 - next-pwa)

## 코딩 원칙
- 절대 하드코딩 금지. 모든 설정값은 config 또는 환경변수로 분리
- 매직 넘버 금지, 상수는 `lib/constants.ts`에 정의
- 경로, URL, 인증정보는 환경변수로 관리
- 반복 로직은 함수로 일반화
- 데이터가 바뀌어도 코드 수정 없이 동작하도록 설계
- 기존 코드 패턴과 일관성 유지

## 폴더 구조 규칙
```
app/               → 페이지 및 API 라우트 (App Router)
  (main)/          → 메인 레이아웃 그룹
  tools/[slug]/    → AI 서비스 상세 페이지
  category/[slug]/ → 카테고리 페이지
  ranking/         → 랭킹 페이지
  jobs/            → 직군별 추천 페이지
  education/       → 학년별 추천 페이지
  news/            → AI 뉴스 페이지
  recommend/       → 추천 위자드
  api/             → API 라우트
components/        → 재사용 가능한 컴포넌트
  layout/          → Header, Footer 등 레이아웃
  ui/              → Button, Badge 등 기본 UI
  service/         → 서비스 카드 등 도메인 컴포넌트
  search/          → 검색 관련
  recommend/       → 추천 위자드
  review/          → 리뷰/평가 관련
  community/       → 댓글, 컬렉션, 업보트
  news/            → 뉴스 관련
  ranking/         → 랭킹 관련
  jobs/            → 직군별 추천 관련
  education/       → 학년별 추천 관련
  auth/            → 인증 관련
lib/               → 유틸리티, Supabase 클라이언트, 상수
types/             → TypeScript 타입 정의
hooks/             → 커스텀 훅
store/             → Zustand 스토어
data/              → 시드 데이터
supabase/          → DB 마이그레이션 SQL
docs/              → 기획서, 진행사항 문서
public/            → 정적 파일 (아이콘, manifest 등)
```

## 네이밍 규칙
- **컴포넌트**: PascalCase (예: ServiceCard.tsx)
- **훅**: camelCase, use 접두사 (예: useBookmark.ts)
- **유틸리티**: camelCase (예: formatDate.ts)
- **상수**: UPPER_SNAKE_CASE (예: MAX_REVIEW_LENGTH)
- **타입/인터페이스**: PascalCase (예: Tool, Category)
- **DB 컬럼**: snake_case (예: free_quota_detail)
- **URL slug**: kebab-case (예: text-generation)

## 컴포넌트 작성 규칙
- 컴포넌트는 기능 단위로 분리
- Props는 인터페이스로 명시적 타입 정의
- Server Component를 기본으로 사용, 클라이언트 인터랙션이 필요할 때만 'use client'
- 한 파일에 하나의 export default 컴포넌트

## 데이터 페칭 규칙
- Server Component에서 직접 Supabase 쿼리 (lib/supabase/server.ts 사용)
- Client Component에서는 lib/supabase/client.ts 사용
- 쿼리 함수는 lib/supabase/queries.ts에 집중 관리
- 에러 처리 필수

## 핵심 도메인 개념

### 랭킹 시스템
- 랭킹 점수 = 방문수(40%) + 평점(30%) + 리뷰수(20%) + 북마크수(10%)
- 전체 랭킹 + 카테고리별 랭킹 + 주간/월간 트렌딩
- 순위 변동(▲▼) 표시

### 직군별 추천 (10개 직군)
- AI 개발자, UI/UX 디자이너, 그래픽 디자이너, 마케터, 영상 제작자
- 작가/카피라이터, 데이터 분석가, 교육자, 음악 프로듀서, 비즈니스 기획자
- 추천 등급: essential(필수) / recommended(추천) / optional(선택)

### 학년별 추천 (6단계)
- 초등학생, 중학생, 고등학생, 대학생/취준생, 대학원생, 교사/교수
- 안전 등급: safe(안전) / guided(지도 필요) / advanced(고급)

### 커뮤니티 기능
- 통합 커뮤니티: 하나의 글 풀 + 태그 기반 위치별 필터링
- 글 타입: 일반(discussion), 팁(tip), 질문(question)
- 태그 4종: GOAL(목적), AI_TOOL(서비스명), FEATURE(기능), KEYWORD(키워드)
- 도구 페이지 → ai=toolSlug 태그 필터, 레시피 페이지 → tags=도구+키워드 OR 필터
- 태그 클릭 시 /community?tag=xxx 로 이동
- 댓글, 업보트/다운보트, 북마크

### AI 레시피 규칙
- 모든 레시피는 반드시 `icon` 필드를 포함해야 함 (Lucide 아이콘명)
- 레시피에서 사용하는 아이콘은 `components/ui/DynamicIcon.tsx`의 ICON_MAP에 반드시 등록
- 새 아이콘 추가 시: lucide-react import + ICON_MAP 엔트리 모두 추가

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 공개 키
- `ADMIN_EMAILS` - 관리자 이메일 목록 (쉼표 구분)

## 개발 진행 순서
Phase 1 → 2 → 3 → 4 → 5 → 6 순서로 진행
각 Phase 완료 후 다음 Phase로 넘어감
상세 내용: docs/PRD.md, docs/PHASES.md 참조

### Phase 요약
- **Phase 1** (완료): 프로젝트 셋업 + 메인 화면 UI (더미 데이터)
- **Phase 2**: Supabase 연동 + DB 스키마 + 상세 페이지 + 랭킹/직군/학년 페이지
- **Phase 3**: 인증 + 리뷰/평가 + 커뮤니티 (댓글, 업보트, 컬렉션)
- **Phase 4**: 검색 + 추천 위자드 + AI 뉴스
- **Phase 5**: 관리자 대시보드 + 성능 최적화
- **Phase 6**: PWA + SEO 고도화 + 배포

## gh CLI 경로
Windows 환경에서 gh CLI가 PATH에 없을 수 있음.
전체 경로 사용: `"C:/Program Files/GitHub CLI/gh.exe"`
