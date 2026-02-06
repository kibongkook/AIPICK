# AIPICK 프로젝트 컨벤션

## 프로젝트 개요
- **AIPICK**: 사용자 목적에 맞는 AI 서비스 큐레이션 플랫폼
- **핵심 가치**: 무료 사용량(Quota) 정보를 직관적으로 제공

## 기술 스택
- Next.js 14 (App Router), React, TypeScript
- Tailwind CSS, Lucide React
- Supabase (PostgreSQL, Auth)
- Zustand (상태 관리)
- Vercel (배포)

## 코딩 원칙
- 절대 하드코딩 금지. 모든 설정값은 config 또는 환경변수로 분리
- 매직 넘버 금지, 상수는 `lib/constants.ts`에 정의
- 경로, URL, 인증정보는 환경변수로 관리
- 반복 로직은 함수로 일반화
- 데이터가 바뀌어도 코드 수정 없이 동작하도록 설계
- 기존 코드 패턴과 일관성 유지

## 폴더 구조 규칙
```
app/          → 페이지 및 API 라우트 (App Router)
components/   → 재사용 가능한 컴포넌트
  layout/     → Header, Footer 등 레이아웃
  ui/         → Button, Badge 등 기본 UI
  service/    → 서비스 카드 등 도메인 컴포넌트
  search/     → 검색 관련
  recommend/  → 추천 위자드
  review/     → 리뷰 관련
  news/       → 뉴스 관련
  auth/       → 인증 관련
lib/          → 유틸리티, Supabase 클라이언트, 상수
types/        → TypeScript 타입 정의
hooks/        → 커스텀 훅
store/        → Zustand 스토어
data/         → 시드 데이터
supabase/     → DB 마이그레이션 SQL
docs/         → 기획서, 진행사항 문서
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

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 공개 키
- `ADMIN_EMAILS` - 관리자 이메일 목록 (쉼표 구분)

## 개발 진행 순서
Phase 1 → 2 → 3 → 4 → 5 순서로 진행
각 Phase 완료 후 다음 Phase로 넘어감
상세 내용: docs/PRD.md, docs/PHASES.md 참조
