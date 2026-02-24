# AIPICK - 전체 개략 기획서

> 최종 수정일: 2026-02-20 | 버전: v1.0
> 상세 기획은 → [docs/modules/](./modules/README.md) 각 모듈 문서 참조

---

## 1. 프로젝트 개요

### 비전
> "어떤 AI를 써야 할지 모르겠다면, AIPICK이 골라줍니다."

### 문제 정의
| 문제 | 설명 |
|------|------|
| AI 과부하 | 수천 개 AI 서비스 중 내 목적에 맞는 것을 고르기 어려움 |
| 무료 정보 부재 | "무료로 어디까지 쓸 수 있는지" 정보가 흩어져 있음 |
| 한국어 부재 | 기존 디렉토리는 영문 위주, 한국 사용자 맞춤 정보 부족 |
| 역할 맞춤 부재 | 학생·교사·직장인 등 역할에 맞는 AI 추천 서비스 없음 |

### 핵심 가치 (USP)
1. **무료 사용량(Quota) 강조** — 모든 서비스의 무료 범위를 한눈에
2. **직군/학년별 큐레이션** — 내 역할에 딱 맞는 AI 툴킷
3. **한국어 특화** — 한국어 지원 여부·품질 명시
4. **커뮤니티 기반 신뢰** — 실사용자 리뷰·팁·경험 공유
5. **AI 뉴스 원스톱** — 최신 AI 트렌드를 한 곳에서

---

## 2. 타겟 사용자

| 페르소나 | 핵심 니즈 | 주요 진입 경로 |
|---------|----------|--------------|
| AI 입문자 | "어떤 AI가 있는지 모름" → 쉬운 탐색 | 추천 위자드, 목적별 카테고리 |
| 학생 (초~대학) | 학년에 맞는 AI, 무료 서비스 | 학년별 추천 `/education` |
| 교사/교수 | 수업용 AI, 학년별 적합성 | 학년별 추천, 가이드 |
| 직장인/실무자 | 업무 효율화, 직군별 툴킷 | 직군별 추천 `/jobs` |
| 프리랜서/크리에이터 | 콘텐츠 제작 AI, 무료 사용량 | 카테고리, 랭킹 |
| AI 관심층 | 트렌드, 신규 서비스 팔로우 | 뉴스, 랭킹, 커뮤니티 |

---

## 3. 사용자가 AI를 찾는 5가지 경로

```
┌─────────────────────────────────────────────────┐
│              AIPICK 탐색 경로                     │
├──────────┬──────────┬──────────┬────────┬────────┤
│ 목적별   │ 직군별   │ 학년별   │ 랭킹   │ 검색   │
│          │          │          │        │        │
│ "~을 하  │ "나는    │ "나는    │ "가장  │ "Chat  │
│  고 싶다"│  마케터" │  중학생" │  인기" │  GPT"  │
│          │          │          │        │        │
│/discover │  /jobs   │/education│/ranking│/search │
│/category │/jobs/[sl]│/edu/[lvl]│        │        │
└──────────┴──────────┴──────────┴────────┴────────┘
```

| 경로 | 모듈 문서 | 핵심 기능 |
|------|---------|---------|
| 목적별 | [M1-DISCOVERY](./modules/M1-DISCOVERY.md) | 추천 위자드, 12개 목적 카테고리 |
| 직군별 | [M3-CURATION](./modules/M3-CURATION.md) | 10개 직군별 AI 툴킷 |
| 학년별 | [M3-CURATION](./modules/M3-CURATION.md) | 6단계 학년별 안전 추천 |
| 랭킹 | [M2-RANKING](./modules/M2-RANKING.md) | 하이브리드 스코어링, 주간 트렌딩 |
| 검색 | [M1-DISCOVERY](./modules/M1-DISCOVERY.md) | 키워드+필터 복합 검색 |

---

## 4. 핵심 도메인 개념

### 4.1 AI 서비스 (Tool)
- 기본 정보: 이름, 설명, 카테고리, 가격 정책, 무료 사용량
- 평가 정보: 종합 평점, 기능별 세부 점수(UI/품질/속도/가성비/한국어)
- 랭킹 정보: 하이브리드 점수, 주간 변동, 방문 수
- 관계: 카테고리, 직군 추천, 학년 추천, 리뷰, 커뮤니티 포스트

### 4.2 가격 정책 유형
| 타입 | 설명 | 뱃지 색상 |
|------|------|----------|
| Free | 완전 무료 | Emerald |
| Freemium | 기본 무료 + 유료 플랜 | Blue |
| Paid | 유료 전용 | Gray |

### 4.3 랭킹 스코어링 (하이브리드)
```
hybrid_score =
  외부 벤치마크(25%) + 사용자 평가(25%) + 커뮤니티 활동(25%) + AI 메타데이터(25%)
```
→ 상세: [M2-RANKING.md](./modules/M2-RANKING.md)

### 4.4 직군 추천 등급
| 등급 | 의미 |
|------|------|
| essential | 이 직군에 필수 |
| recommended | 적극 추천 |
| optional | 선택적으로 유용 |

### 4.5 학년별 안전 등급
| 등급 | 의미 |
|------|------|
| safe | 자유롭게 사용 가능 |
| guided | 보호자/교사 지도 하에 사용 |
| advanced | 고학년/성인용 |

---

## 5. 전체 페이지 구조 (Sitemap)

```
/ (홈)
├── /discover                    AI 찾기 통합 허브
├── /search?q=...                키워드 검색
├── /category/[slug]             목적별 카테고리 (12개)
├── /rankings                    전체 랭킹 TOP 100
│   └── /rankings/[category]    카테고리별 랭킹
├── /trending                    주간 급상승
├── /jobs                        직군 목록 (10개)
│   └── /jobs/[slug]            직군별 AI 툴킷
├── /education                   학년 목록 (6단계)
│   └── /education/[level]      학년별 AI 추천
├── /tools/[slug]                AI 서비스 상세
├── /compare/[...slugs]         1:1 AI 비교
├── /community                   통합 커뮤니티 피드
│   ├── /community/write         글 작성
│   └── /community/[post_id]    글 상세
├── /news                        AI 뉴스
├── /guides                      AI 활용 가이드
│   └── /guides/[slug]          가이드 상세
├── /recipes                     AI 레시피 (워크플로우)
│   └── /recipes/[slug]         레시피 상세
├── /collections                 인기 컬렉션
│   └── /collections/[id]       컬렉션 상세
├── /bookmarks                   내 북마크
├── /profile                     내 프로필
├── /auth/login                  로그인 (Google/GitHub/Kakao)
└── /admin                       관리자 대시보드
    ├── /admin/tools
    ├── /admin/news
    └── /admin/guides
```

---

## 6. 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| Framework | Next.js 15 (App Router) | SSR/SSG/ISR + PWA |
| UI | React 19 + Tailwind CSS v4 | 모바일 퍼스트 |
| Icons | Lucide React 0.563.0 | DynamicIcon 컴포넌트로 동적 로드 |
| Backend/DB | Supabase (PostgreSQL) | 현재 seed.json 폴백 모드 |
| Auth | Supabase Auth | Google / GitHub / Kakao OAuth |
| State | Zustand | (미설치, 추후 도입) |
| Deploy | Vercel | 목표 도메인: aipick.kr |
| PWA | manifest.json | next-pwa 미설치, Phase 6 목표 |

---

## 7. UI/UX 핵심 원칙

| 원칙 | 설명 |
|------|------|
| 2클릭 규칙 | 원하는 AI까지 최대 2번의 클릭으로 도달 |
| 무료 정보 우선 | free_quota_detail은 항상 가장 눈에 띄는 위치 |
| 모바일 퍼스트 | 하단 탭 바, 터치 친화적 카드 UI |
| 네비게이션 다양화 | 5가지 탐색 진입점 (목적/직군/학년/랭킹/검색) |
| 커뮤니티 활성화 | 리뷰, 댓글, 컬렉션으로 사용자 참여 유도 |

### 색상 가이드
| 의미 | 색상 | HEX |
|------|------|-----|
| Primary (신뢰/기술) | Blue | #3B82F6 |
| Free/접근성 | Emerald | #10B981 |
| 트렌딩/주의 | Amber | #F59E0B |
| 랭킹 1위 | Gold | #F59E0B |
| 랭킹 2위 | Silver | #9CA3AF |
| 랭킹 3위 | Bronze | #CD7F32 |

---

## 8. 개발 현황 요약

| Phase | 상태 | 핵심 산출물 |
|-------|------|------------|
| Phase 1 | ✅ 완료 | 메인 UI, 서비스 카드 |
| Phase 2 | ✅ 완료 | DB 연동, 상세/랭킹/직군/학년 페이지 |
| Phase 3 | ✅ 완료 | 검색, 필터, 추천 위자드 |
| Phase 4 | ✅ 완료 | 인증, 리뷰, 댓글, 북마크, 업보트 |
| Phase 5 | ✅ 완료 | 뉴스, 컬렉션, 가이드, 관리자, 트렌딩 |
| Phase 6 | ✅ 완료 | PWA, SEO, JSON-LD, 하단탭바 |
| Phase 7 | ✅ 완료 | 데이터 정확성, 외부 파이프라인, UX 개선 |
| Phase 8 | 🔄 진행중 | 아이콘/벤치마크/미리보기/홈페이지 개선 |

→ 상세 진행사항: [PHASES.md](./PHASES.md)
→ 현재 할일: [TODO.md](./TODO.md)

---

## 9. 관련 문서 링크

| 문서 | 역할 |
|------|------|
| [modules/CONNECTIONS.md](./modules/CONNECTIONS.md) | 모듈 간 데이터 흐름 및 의존성 |
| [DB-SCHEMA.md](./DB-SCHEMA.md) | 전체 DB 스키마 |
| [CODE_REVIEW.md](./CODE_REVIEW.md) | 보안/성능 이슈 및 개선 로드맵 |
