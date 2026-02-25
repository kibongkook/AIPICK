# Dependency 규칙 (패키지 & 빌드 설정)

> 패키지 설치/제거, tsconfig, next.config 수정 시 반드시 따를 것.

## 1. 현재 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | ^15.1.6 |
| UI | React | 19.x |
| 언어 | TypeScript | ^5 |
| 스타일링 | Tailwind CSS | v4 |
| 아이콘 | Lucide React | ^0.563.0 |
| DB/Auth | Supabase (SSR) | ^0.8.0 / ^2.95.2 |
| 상태 관리 | Zustand | (필요시 추가) |
| 유틸리티 | clsx | ^2.1.1 |
| 배포 | Vercel | - |

## 2. 패키지 설치 규칙

### 2.1 설치 전 확인
- 기존 의존성으로 해결 가능한지 먼저 확인
- 유사한 기능의 패키지가 이미 있는지 `package.json` 검토
- 번들 사이즈 영향 고려 (가능하면 가벼운 패키지 선택)

### 2.2 설치 명령어
```bash
# 런타임 의존성
npm install <package>

# 개발 의존성 (빌드 도구, 타입, 린터)
npm install -D <package>
```

### 2.3 금지 패키지 유형
- jQuery 또는 jQuery 의존 라이브러리
- moment.js (대안: date-fns 또는 Intl API)
- CSS-in-JS 런타임 (styled-components, emotion) — Tailwind 사용
- 별도 아이콘 라이브러리 (FontAwesome 등) — Lucide React 사용

### 2.4 버전 관리
- `package-lock.json` 은 항상 커밋
- 메이저 버전 업그레이드는 사전 검토 후 진행
- `^` (caret) 범위 기본 사용

## 3. TypeScript 설정

### 3.1 현재 tsconfig 핵심
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "noEmit": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": { "@/*": ["./*"] }
  }
}
```

### 3.2 규칙
- `strict: true` 유지 — 절대 비활성화 금지
- Path alias는 `@/` 만 사용 (예: `@/lib/utils`, `@/components/ui/Button`)
- `any` 타입 사용 최소화, 불가피한 경우 주석으로 사유 명시
- 새 타입은 `types/index.ts` 에 중앙화

## 4. Next.js 설정

### 4.1 이미지 도메인
새 외부 이미지 소스 사용 시 `next.config.ts`의 `images.remotePatterns`에 추가:
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'example.com', pathname: '/**' },
  ],
},
```

### 4.2 리다이렉트
URL 변경 시 `next.config.ts`의 `redirects()`에 301 리다이렉트 추가:
```typescript
{ source: '/old-path', destination: '/new-path', permanent: true },
```

### 4.3 환경변수 노출
- 클라이언트에서 필요한 변수만 `NEXT_PUBLIC_` 접두사 사용
- 서버 전용 변수는 접두사 없이 사용

## 5. 빌드 & 배포

### 5.1 빌드 검증
```bash
npm run build    # 타입 에러, 빌드 에러 확인
```

### 5.2 빌드 전 체크리스트
- [ ] TypeScript 에러 없음 (`npm run build` 통과)
- [ ] 사용하지 않는 import 정리
- [ ] 새 환경변수가 있다면 Vercel에도 설정
- [ ] 새 페이지의 metadata (title, description) 설정

### 5.3 Vercel 배포
- `master` 브랜치 push 시 자동 배포
- 환경변수는 Vercel Dashboard에서 관리
- Preview 배포: PR 생성 시 자동

## 6. 린팅
- ESLint: `eslint-config-next` 사용
- Tailwind CSS 관련 린팅은 Tailwind v4 내장 기능 활용
- `npm run lint` 로 검증
