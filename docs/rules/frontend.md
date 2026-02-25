# Frontend 규칙 (Components & Pages)

> `components/`, `app/` 폴더의 UI 파일을 수정하거나 새로 만들 때 반드시 따를 것.

## 1. Server vs Client Component

### 1.1 기본 원칙
- **Server Component가 기본** — 'use client' 없이 작성
- **Client Component 조건** — useState, useEffect, 이벤트 핸들러, 브라우저 API 사용 시에만

### 1.2 Client Component 선언
```typescript
'use client';  // 파일 최상단, import보다 위

import { useState } from 'react';
```

## 2. Import 순서

```typescript
// 1. React/Next.js 핵심
'use client';                                    // (필요시)
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 2. 외부 라이브러리
import { Send, Hash, X } from 'lucide-react';

// 3. 내부 라이브러리/유틸리티
import { useAuth } from '@/lib/auth/AuthContext';
import { cn } from '@/lib/utils';
import { COMMUNITY_POST_TYPES } from '@/lib/constants';

// 4. 컴포넌트
import Button from '@/components/ui/Button';
import RecipeCard from './RecipeCard';

// 5. 타입 (type-only import)
import type { Tool, Category } from '@/types';
```

## 3. 컴포넌트 작성 패턴

### 3.1 Props 타입 정의
```typescript
// 파일 내 인터페이스로 정의 (export 하지 않음)
interface ServiceCardProps {
  tool: Tool;
  compact?: boolean;
}

export default function ServiceCard({ tool, compact = false }: ServiceCardProps) {
  // ...
}
```

### 3.2 한 파일 한 컴포넌트
- 파일당 하나의 `export default` 컴포넌트
- 헬퍼 함수는 같은 파일 내 일반 함수로 작성 가능
- 컴포넌트 이름 = 파일 이름 (PascalCase)

### 3.3 폴더별 컴포넌트 분류
```
components/
  ui/           → 범용 UI (Button, Badge, DifficultyBadge)
  layout/       → 레이아웃 (Header, Footer, Sidebar)
  service/      → AI 서비스 도메인
  recipe/       → 레시피 도메인
  community/    → 커뮤니티 도메인
  auth/         → 인증 관련
```

## 4. Tailwind CSS 규칙

### 4.1 cn() 유틸리티 사용
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'rounded-xl border border-border bg-white',
  compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
  isActive && 'border-primary shadow-md',
)}>
```

### 4.2 조건부 스타일 (Record 패턴)
```typescript
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
  outline: 'border border-border bg-white text-foreground hover:bg-surface',
  ghost: 'text-foreground hover:bg-surface',
};
```

### 4.3 반응형 디자인 (Mobile-First)
```typescript
// 모바일 기본 → md/lg에서 확장
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<nav className="hidden md:flex">          {/* 데스크탑 전용 */}
<div className="flex md:hidden">          {/* 모바일 전용 */}
```

### 4.4 그라데이션 + 동적 색상
```typescript
// 동적 색상은 prop으로 전달
<div className={`bg-gradient-to-r ${recipe.color}`} />
<div className={`bg-gradient-to-br ${color} text-white`}>
```

### 4.5 전환 효과
```typescript
// hover, focus 전환은 transition-* 클래스 사용
className="hover:border-primary hover:shadow-lg transition-all"
className="opacity-0 group-hover:opacity-100 transition-opacity"
```

## 5. 페이지 규칙 (app/)

### 5.1 메타데이터
```typescript
export const metadata = {
  title: '페이지 제목 | AIPICK',
  description: '페이지 설명',
};
```

### 5.2 레이아웃 구조
```typescript
export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">제목</h1>
      </div>
      {/* 콘텐츠 */}
    </div>
  );
}
```

### 5.3 Suspense 래핑
```typescript
import { Suspense } from 'react';

<Suspense fallback={<div className="h-8" />}>
  <ClientComponent />
</Suspense>
```

## 6. 아이콘 규칙
- Lucide React 아이콘만 사용
- 레시피의 동적 아이콘: `components/ui/DynamicIcon.tsx` 의 ICON_MAP에 등록 필수
- 아이콘 크기: `h-4 w-4` (소), `h-5 w-5` (기본), `h-7 w-7` (대)

## 7. Link 규칙
- 내부 이동은 반드시 `next/link`의 `<Link>` 사용
- 외부 링크: `<a href="..." target="_blank" rel="noopener noreferrer">`
- 카드형 링크: `<Link className="group block ...">` + group-hover 패턴
