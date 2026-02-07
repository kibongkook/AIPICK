/**
 * AI 쇼케이스 시드 데이터 생성 스크립트
 * - category_showcases: 카테고리별 프롬프트→결과 비교 (9개)
 * - tool_showcases: 카테고리 쇼케이스 결과물 (~40개)
 * - role_showcases: 직업/교육 역할별 AI 활용 쇼케이스 (19개)
 * - role_use_cases: 역할별 구체적 활용 사례 (~60개)
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, '..', 'data', 'seed.json');

const seed = JSON.parse(readFileSync(seedPath, 'utf-8'));

// =============================================
// 1. CATEGORY SHOWCASES (프롬프트→결과 비교)
// =============================================
const category_showcases = [
  {
    id: 'cs-general-ai',
    category_slug: 'general-ai',
    prompt: 'Summarize the following article about climate change in 3 key points',
    prompt_ko: '기후변화 관련 기사를 핵심 3가지로 요약해줘',
    description: '같은 요약 요청에 AI마다 다른 스타일의 답변을 비교하세요',
    media_type: 'text',
    sort_order: 1,
  },
  {
    id: 'cs-text-generation',
    category_slug: 'text-generation',
    prompt: 'Write a 200-character essay about spring in Korea',
    prompt_ko: '한국의 봄을 주제로 200자 에세이를 써줘',
    description: 'AI별 글쓰기 스타일과 창의성을 비교하세요',
    media_type: 'text',
    sort_order: 2,
  },
  {
    id: 'cs-image-generation',
    category_slug: 'image-generation',
    prompt: 'A rainy afternoon at a Paris cafe, watercolor style',
    prompt_ko: '비 오는 오후 파리의 카페, 수채화 스타일',
    description: '같은 프롬프트로 생성된 이미지를 비교하세요',
    media_type: 'image',
    sort_order: 3,
  },
  {
    id: 'cs-video-editing',
    category_slug: 'video-editing',
    prompt: 'A 15-second cinematic clip of someone drinking coffee at a cafe',
    prompt_ko: '카페에서 커피를 마시는 15초 시네마틱 영상',
    description: 'AI 영상 생성 도구의 품질을 비교하세요',
    media_type: 'image',
    sort_order: 4,
  },
  {
    id: 'cs-coding-tools',
    category_slug: 'coding-tools',
    prompt: 'Create a dark mode toggle button in React with Tailwind CSS',
    prompt_ko: 'React + Tailwind로 다크모드 토글 버튼을 만들어줘',
    description: 'AI 코딩 어시스턴트의 코드 품질을 비교하세요',
    media_type: 'code',
    sort_order: 5,
  },
  {
    id: 'cs-music-generation',
    category_slug: 'music-generation',
    prompt: 'Calm lo-fi hip hop beat, rainy day vibes, 30 seconds',
    prompt_ko: '잔잔한 로파이 힙합 비트, 비 오는 날 느낌',
    description: 'AI 음악 생성 도구의 결과물을 비교하세요',
    media_type: 'image',
    sort_order: 6,
  },
  {
    id: 'cs-data-analysis',
    category_slug: 'data-analysis',
    prompt: 'Analyze this monthly sales data and create a trend chart',
    prompt_ko: '이 월별 매출 데이터를 분석하고 트렌드 차트를 만들어줘',
    description: 'AI 데이터 분석 도구의 시각화 능력을 비교하세요',
    media_type: 'image',
    sort_order: 7,
  },
  {
    id: 'cs-translation',
    category_slug: 'translation',
    prompt: "Translate naturally: 'The early bird catches the worm'",
    prompt_ko: "'The early bird catches the worm'을 자연스러운 한국어로 번역해줘",
    description: 'AI 번역 도구의 자연스러움을 비교하세요',
    media_type: 'text',
    sort_order: 8,
  },
  {
    id: 'cs-others',
    category_slug: 'others',
    prompt: 'Create a 5-slide presentation about AI trends in 2026',
    prompt_ko: 'AI 트렌드 2026 주제로 5장 프레젠테이션 만들어줘',
    description: 'AI 프레젠테이션 도구의 디자인 품질을 비교하세요',
    media_type: 'image',
    sort_order: 9,
  },
];

// =============================================
// 2. TOOL SHOWCASES (카테고리 쇼케이스 결과물)
// =============================================
const tool_showcases = [
  // --- general-ai ---
  {
    id: 'ts-chatgpt-summary', tool_slug: 'chatgpt', showcase_id: 'cs-general-ai',
    result_image_url: null,
    result_text: '1. 지구 평균 기온이 산업화 이전 대비 1.2도 상승했습니다.\n2. 극지방 빙하가 연간 2,670억 톤 감소하고 있습니다.\n3. 2050년까지 탄소 중립 달성이 가장 시급한 과제입니다.',
    result_description: '구조화된 핵심 요약, 수치 포함',
    sort_order: 1,
  },
  {
    id: 'ts-claude-summary', tool_slug: 'claude', showcase_id: 'cs-general-ai',
    result_image_url: null,
    result_text: '이 기사는 세 가지 핵심을 전합니다. 첫째, 기후변화의 속도가 과학자들의 예측보다 빠르게 진행되고 있다는 점. 둘째, 해수면 상승이 저지대 국가에 실존적 위협이 되고 있다는 점. 셋째, 국제 사회의 협력 없이는 해결이 불가능하다는 점입니다.',
    result_description: '서술적이고 맥락이 풍부한 요약',
    sort_order: 2,
  },
  {
    id: 'ts-gemini-summary', tool_slug: 'gemini', showcase_id: 'cs-general-ai',
    result_image_url: null,
    result_text: '핵심 요약:\n- 기온 상승: 1.2도C 증가, 이상 기후 빈도 3배 증가\n- 생태계 영향: 30% 종의 멸종 위기, 산호초 50% 백화\n- 대응 방안: 재생에너지 전환, 탄소포집 기술 투자 확대 필요',
    result_description: '불릿 포인트 + 구체적 수치 중심',
    sort_order: 3,
  },
  {
    id: 'ts-perplexity-summary', tool_slug: 'perplexity', showcase_id: 'cs-general-ai',
    result_image_url: null,
    result_text: '기후변화 기사 요약 (출처 포함):\n1. NASA에 따르면 2024년이 관측 사상 가장 더운 해로 기록됨\n2. IPCC 보고서는 해수면이 2100년까지 최대 1m 상승할 것으로 전망\n3. EU의 탄소 국경조정 메커니즘이 글로벌 기후 정책의 전환점이 될 전망',
    result_description: '출처와 레퍼런스를 포함한 팩트 중심 요약',
    sort_order: 4,
  },

  // --- text-generation ---
  {
    id: 'ts-jasper-essay', tool_slug: 'jasper', showcase_id: 'cs-text-generation',
    result_image_url: null,
    result_text: '벚꽃이 흩날리는 거리, 부드러운 바람이 겨울의 끝자락을 쓸어간다. 한국의 봄은 자연이 건네는 가장 따뜻한 인사다. 여의도 윤중로를 걷다 보면, 분홍빛 터널 아래에서 시간이 느려지는 것을 느낀다.',
    result_description: '감성적이고 문학적인 톤',
    sort_order: 1,
  },
  {
    id: 'ts-copy-ai-essay', tool_slug: 'copy-ai', showcase_id: 'cs-text-generation',
    result_image_url: null,
    result_text: '한국의 봄은 3월 말, 제주도에서 시작된다. 벚꽃, 개나리, 진달래가 차례로 피어나며 전국을 물들인다. 꽃구경과 함께 봄나물 비빔밥을 즐기는 것이 한국인의 봄맞이다.',
    result_description: '정보 전달 중심의 깔끔한 문체',
    sort_order: 2,
  },
  {
    id: 'ts-writesonic-essay', tool_slug: 'writesonic', showcase_id: 'cs-text-generation',
    result_image_url: null,
    result_text: '겨울잠에서 깨어난 대지가 연초록 이불을 덮는다. 진해의 벚꽃비 아래 커피 한 잔, 경주 보문호수의 벚꽃 터널. 한국의 봄은 짧지만, 그래서 더 눈부시다.',
    result_description: '시적 표현과 구체적 장소 묘사',
    sort_order: 3,
  },
  {
    id: 'ts-notion-ai-essay', tool_slug: 'notion-ai', showcase_id: 'cs-text-generation',
    result_image_url: null,
    result_text: '한국의 봄(3~5월)은 벚꽃 시즌으로 유명합니다. 서울 여의도, 경주, 진해 등이 대표적인 명소입니다. 봄철 미세먼지에도 불구하고, 한국인들은 꽃놀이와 피크닉으로 봄을 만끽합니다.',
    result_description: '정보성 글 + 실용적 톤',
    sort_order: 4,
  },

  // --- image-generation ---
  {
    id: 'ts-midjourney-paris', tool_slug: 'midjourney', showcase_id: 'cs-image-generation',
    result_image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
    result_text: null,
    result_description: '풍부한 질감과 무드, 수채화 특유의 번짐 효과가 탁월',
    sort_order: 1,
  },
  {
    id: 'ts-dalle3-paris', tool_slug: 'dall-e-3', showcase_id: 'cs-image-generation',
    result_image_url: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400&q=80',
    result_text: null,
    result_description: '프롬프트 이해도 높고 구도가 안정적',
    sort_order: 2,
  },
  {
    id: 'ts-sd-paris', tool_slug: 'stable-diffusion', showcase_id: 'cs-image-generation',
    result_image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80',
    result_text: null,
    result_description: '오픈소스 모델로 세밀한 스타일 커스텀 가능',
    sort_order: 3,
  },
  {
    id: 'ts-leonardo-paris', tool_slug: 'leonardo-ai', showcase_id: 'cs-image-generation',
    result_image_url: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400&q=80',
    result_text: null,
    result_description: '다양한 스타일 프리셋으로 빠른 결과',
    sort_order: 4,
  },
  {
    id: 'ts-ideogram-paris', tool_slug: 'ideogram', showcase_id: 'cs-image-generation',
    result_image_url: 'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=400&q=80',
    result_text: null,
    result_description: '텍스트 렌더링이 탁월한 이미지 생성',
    sort_order: 5,
  },

  // --- video-editing ---
  {
    id: 'ts-runway-cafe', tool_slug: 'runway-ml', showcase_id: 'cs-video-editing',
    result_image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    result_text: null,
    result_description: '자연스러운 카메라 움직임, 시네마틱 색감',
    sort_order: 1,
  },
  {
    id: 'ts-sora-cafe', tool_slug: 'sora', showcase_id: 'cs-video-editing',
    result_image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
    result_text: null,
    result_description: '물리 법칙을 이해하는 사실적인 영상',
    sort_order: 2,
  },
  {
    id: 'ts-pika-cafe', tool_slug: 'pika', showcase_id: 'cs-video-editing',
    result_image_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80',
    result_text: null,
    result_description: '빠른 생성 속도와 직관적인 편집',
    sort_order: 3,
  },
  {
    id: 'ts-kling-cafe', tool_slug: 'kling-ai', showcase_id: 'cs-video-editing',
    result_image_url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&q=80',
    result_text: null,
    result_description: '중국 AI의 놀라운 영상 품질',
    sort_order: 4,
  },

  // --- coding-tools ---
  {
    id: 'ts-cursor-darkmode', tool_slug: 'cursor', showcase_id: 'cs-coding-tools',
    result_image_url: null,
    result_text: `import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="rounded-full p-2 bg-gray-200 dark:bg-gray-700 transition-colors"
    >
      {dark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
    </button>
  );
}`,
    result_description: 'localStorage 연동 + 아이콘 전환 + 접근성 고려',
    sort_order: 1,
  },
  {
    id: 'ts-copilot-darkmode', tool_slug: 'github-copilot', showcase_id: 'cs-coding-tools',
    result_image_url: null,
    result_text: `'use client';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}`,
    result_description: 'next-themes 활용, 간결한 구현',
    sort_order: 2,
  },
  {
    id: 'ts-v0-darkmode', tool_slug: 'v0', showcase_id: 'cs-coding-tools',
    result_image_url: null,
    result_text: `import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";

export default function DarkToggle() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border">
      <Sun className="h-4 w-4 text-orange-500" />
      <Switch id="dark-mode" />
      <Label htmlFor="dark-mode">
        <Moon className="h-4 w-4 text-blue-500" />
      </Label>
    </div>
  );
}`,
    result_description: 'shadcn/ui 컴포넌트 활용, 세련된 UI',
    sort_order: 3,
  },
  {
    id: 'ts-bolt-darkmode', tool_slug: 'bolt-new', showcase_id: 'cs-coding-tools',
    result_image_url: null,
    result_text: `export default function DarkMode() {
  const toggle = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem('theme',
      html.classList.contains('dark') ? 'dark' : 'light'
    );
  };

  return (
    <button onClick={toggle}
      className="w-12 h-6 bg-gray-300 dark:bg-primary rounded-full relative transition-colors">
      <span className="absolute top-0.5 left-0.5 dark:left-6.5 w-5 h-5 bg-white rounded-full transition-all shadow" />
    </button>
  );
}`,
    result_description: 'localStorage 영구 저장 + 슬라이드 토글 UI',
    sort_order: 4,
  },

  // --- music-generation ---
  {
    id: 'ts-suno-lofi', tool_slug: 'suno-ai', showcase_id: 'cs-music-generation',
    result_image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    result_text: null,
    result_description: '보컬 포함 가능, 감성적인 로파이 사운드',
    sort_order: 1,
  },
  {
    id: 'ts-udio-lofi', tool_slug: 'udio', showcase_id: 'cs-music-generation',
    result_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    result_text: null,
    result_description: '음악적 구성이 탄탄한 비트',
    sort_order: 2,
  },
  {
    id: 'ts-aiva-lofi', tool_slug: 'aiva', showcase_id: 'cs-music-generation',
    result_image_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=80',
    result_text: null,
    result_description: '클래식 기반의 정교한 편곡',
    sort_order: 3,
  },

  // --- data-analysis ---
  {
    id: 'ts-julius-chart', tool_slug: 'julius-ai', showcase_id: 'cs-data-analysis',
    result_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
    result_text: null,
    result_description: '자연어로 차트 생성, 인사이트 자동 도출',
    sort_order: 1,
  },
  {
    id: 'ts-tableau-chart', tool_slug: 'tableau', showcase_id: 'cs-data-analysis',
    result_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
    result_text: null,
    result_description: '전문가급 대시보드, 다양한 차트 옵션',
    sort_order: 2,
  },
  {
    id: 'ts-hex-chart', tool_slug: 'hex', showcase_id: 'cs-data-analysis',
    result_image_url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&q=80',
    result_text: null,
    result_description: 'SQL + Python 통합 분석 환경',
    sort_order: 3,
  },

  // --- translation ---
  {
    id: 'ts-deepl-translate', tool_slug: 'deepl', showcase_id: 'cs-translation',
    result_image_url: null,
    result_text: '일찍 일어나는 새가 벌레를 잡는다.\n→ "부지런한 사람이 성공한다"는 의미의 속담',
    result_description: '자연스러운 의역 + 맥락 설명',
    sort_order: 1,
  },
  {
    id: 'ts-papago-translate', tool_slug: 'papago', showcase_id: 'cs-translation',
    result_image_url: null,
    result_text: '일찍 일어나는 새가 벌레를 잡는다.\n한국 속담: "일찍 일어나는 새가 먹이를 먼저 잡는다"',
    result_description: '한국어에 특화된 자연스러운 번역',
    sort_order: 2,
  },
  {
    id: 'ts-google-translate', tool_slug: 'google-translate', showcase_id: 'cs-translation',
    result_image_url: null,
    result_text: '일찍 일어나는 새가 벌레를 잡습니다.',
    result_description: '빠르고 정확한 직역',
    sort_order: 3,
  },

  // --- others ---
  {
    id: 'ts-gamma-ppt', tool_slug: 'gamma', showcase_id: 'cs-others',
    result_image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80',
    result_text: null,
    result_description: '세련된 디자인 + AI 자동 레이아웃',
    sort_order: 1,
  },
  {
    id: 'ts-canva-ppt', tool_slug: 'canva-ai', showcase_id: 'cs-others',
    result_image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80',
    result_text: null,
    result_description: '풍부한 템플릿 + 브랜드 키트 연동',
    sort_order: 2,
  },
  {
    id: 'ts-beautiful-ppt', tool_slug: 'beautiful-ai', showcase_id: 'cs-others',
    result_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
    result_text: null,
    result_description: '스마트 레이아웃으로 자동 디자인 조정',
    sort_order: 3,
  },
];

// =============================================
// 3. ROLE SHOWCASES (직업별 + 교육별)
// =============================================
const role_showcases = [
  // --- 직업별 (10개) ---
  {
    id: 'rs-ai-developer', target_type: 'job', target_slug: 'ai-developer',
    title: '개발에서 AI를 잘 활용하면?',
    subtitle: 'AI 코딩 어시스턴트로 개발 생산성을 10배 높이는 방법',
    hero_image_url: null, sort_order: 1,
  },
  {
    id: 'rs-uiux-designer', target_type: 'job', target_slug: 'uiux-designer',
    title: 'UI/UX 디자인에서 AI를 잘 활용하면?',
    subtitle: '프로토타이핑부터 사용성 테스트까지 AI가 도와주는 디자인 워크플로우',
    hero_image_url: null, sort_order: 2,
  },
  {
    id: 'rs-graphic-designer', target_type: 'job', target_slug: 'graphic-designer',
    title: '그래픽 디자인에서 AI를 잘 활용하면?',
    subtitle: '아이디어 스케치부터 최종 아웃풋까지 AI와 협업하는 디자이너',
    hero_image_url: null, sort_order: 3,
  },
  {
    id: 'rs-marketer', target_type: 'job', target_slug: 'marketer',
    title: '마케팅에서 AI를 잘 활용하면?',
    subtitle: '콘텐츠 제작, 데이터 분석, 고객 타겟팅까지 마케터의 AI 비밀무기',
    hero_image_url: null, sort_order: 4,
  },
  {
    id: 'rs-video-creator', target_type: 'job', target_slug: 'video-creator',
    title: '영상 제작에서 AI를 잘 활용하면?',
    subtitle: '기획, 촬영, 편집, 자막까지 원맨 크리에이터가 되는 방법',
    hero_image_url: null, sort_order: 5,
  },
  {
    id: 'rs-writer', target_type: 'job', target_slug: 'writer',
    title: '글쓰기에서 AI를 잘 활용하면?',
    subtitle: '아이디어 발상, 초고 작성, 교정까지 작가의 AI 어시스턴트',
    hero_image_url: null, sort_order: 6,
  },
  {
    id: 'rs-data-analyst', target_type: 'job', target_slug: 'data-analyst',
    title: '데이터 분석에서 AI를 잘 활용하면?',
    subtitle: '자연어로 쿼리하고, AI가 인사이트를 찾아주는 분석 워크플로우',
    hero_image_url: null, sort_order: 7,
  },
  {
    id: 'rs-entrepreneur', target_type: 'job', target_slug: 'entrepreneur',
    title: '사업/창업에서 AI를 잘 활용하면?',
    subtitle: '시장 조사, 사업 계획, IR 자료까지 1인 CEO의 AI 경영',
    hero_image_url: null, sort_order: 8,
  },
  {
    id: 'rs-musician', target_type: 'job', target_slug: 'musician',
    title: '음악에서 AI를 잘 활용하면?',
    subtitle: '작곡, 편곡, 마스터링까지 AI와 만드는 음악',
    hero_image_url: null, sort_order: 9,
  },
  {
    id: 'rs-pm', target_type: 'job', target_slug: 'product-manager',
    title: '기획에서 AI를 잘 활용하면?',
    subtitle: 'PRD 작성, 경쟁사 분석, 로드맵까지 PM의 AI 워크플로우',
    hero_image_url: null, sort_order: 10,
  },

  // --- 교육별 (9개) ---
  {
    id: 'rs-elementary-low', target_type: 'education', target_slug: 'elementary-low',
    title: '초등 저학년이 AI를 잘 활용하면 여기까지?',
    subtitle: '그림 그리기, 동화 만들기로 창의력을 키우는 안전한 AI 활용',
    hero_image_url: null, sort_order: 1,
  },
  {
    id: 'rs-elementary-high', target_type: 'education', target_slug: 'elementary-high',
    title: '초등 고학년이 AI를 잘 활용하면 여기까지?',
    subtitle: '수학 풀이, 영어 학습, 과학 실험까지 AI가 도와주는 학습',
    hero_image_url: null, sort_order: 2,
  },
  {
    id: 'rs-middle-school', target_type: 'education', target_slug: 'middle-school',
    title: '중학생이 AI를 잘 활용하면 여기까지?',
    subtitle: '자기주도 학습, 발표 준비, 코딩 입문까지 AI와 함께 성장',
    hero_image_url: null, sort_order: 3,
  },
  {
    id: 'rs-high-school', target_type: 'education', target_slug: 'high-school',
    title: '고등학생이 AI를 잘 활용하면 여기까지?',
    subtitle: '수능 준비, 자소서 작성, 논문 검토까지 입시생의 AI 전략',
    hero_image_url: null, sort_order: 4,
  },
  {
    id: 'rs-college', target_type: 'education', target_slug: 'college',
    title: '대학생이 AI를 잘 활용하면 여기까지?',
    subtitle: '리포트, 졸업 프로젝트, 포트폴리오, 취업 준비까지',
    hero_image_url: null, sort_order: 5,
  },
  {
    id: 'rs-teacher', target_type: 'education', target_slug: 'teacher',
    title: '선생님이 AI를 잘 활용하면 여기까지?',
    subtitle: '수업 자료 제작, 평가, 학생 맞춤 피드백까지 교사의 AI 비서',
    hero_image_url: null, sort_order: 6,
  },
  {
    id: 'rs-parent', target_type: 'education', target_slug: 'parent',
    title: '부모님이 AI를 잘 활용하면 여기까지?',
    subtitle: '자녀 학습 관리, 안전한 AI 가이드, 교육 콘텐츠 만들기',
    hero_image_url: null, sort_order: 7,
  },
  {
    id: 'rs-academy-tutor', target_type: 'education', target_slug: 'academy-tutor',
    title: '학원 강사가 AI를 잘 활용하면 여기까지?',
    subtitle: '문제 출제, 수업 자료, 학생별 맞춤 커리큘럼까지',
    hero_image_url: null, sort_order: 8,
  },
  {
    id: 'rs-coding-tutor', target_type: 'education', target_slug: 'coding-tutor',
    title: '코딩 강사가 AI를 잘 활용하면 여기까지?',
    subtitle: '실습 환경, 코드 리뷰, 프로젝트 가이드까지 AI 코딩 교육',
    hero_image_url: null, sort_order: 9,
  },
];

// =============================================
// 4. ROLE USE CASES (역할별 구체적 활용 사례)
// =============================================
const role_use_cases = [
  // === 직업별 USE CASES ===

  // --- AI 개발자 ---
  {
    id: 'ruc-dev-1', role_showcase_id: 'rs-ai-developer', tool_slug: 'cursor',
    title: '전체 기능을 자연어로 구현',
    description: '"로그인 페이지에 OAuth 추가해줘"라고 말하면 관련 파일 전체를 수정',
    prompt_example: '이 프로젝트에 Google OAuth 로그인을 추가해줘. NextAuth.js를 사용하고 Prisma 스키마도 업데이트해줘.',
    result_image_url: null,
    result_text: '// Cursor가 자동으로 수정한 파일들:\n// 1. lib/auth.ts - NextAuth 설정\n// 2. prisma/schema.prisma - Account 모델 추가\n// 3. app/api/auth/[...nextauth]/route.ts - 라우트 생성\n// 4. components/LoginButton.tsx - UI 컴포넌트',
    result_video_url: null,
    outcome: '기존 2시간 → 5분으로 단축',
    sort_order: 1,
  },
  {
    id: 'ruc-dev-2', role_showcase_id: 'rs-ai-developer', tool_slug: 'github-copilot',
    title: '코드 작성 중 실시간 자동완성',
    description: '함수명과 주석만 입력하면 나머지 로직을 AI가 완성',
    prompt_example: '// 배열에서 중복을 제거하고 정렬하는 함수',
    result_image_url: null,
    result_text: 'function uniqueSorted<T>(arr: T[]): T[] {\n  return [...new Set(arr)].sort();\n}',
    result_video_url: null,
    outcome: '코딩 속도 55% 향상 (GitHub 공식 통계)',
    sort_order: 2,
  },
  {
    id: 'ruc-dev-3', role_showcase_id: 'rs-ai-developer', tool_slug: 'claude',
    title: '복잡한 버그 분석 및 해결',
    description: '에러 로그를 붙여넣으면 원인 분석부터 해결 코드까지 제공',
    prompt_example: '이 에러를 분석해줘: "TypeError: Cannot read properties of undefined (reading \'map\')"',
    result_image_url: null,
    result_text: '원인: API 응답이 undefined일 때 .map() 호출\n해결: Optional chaining + 기본값 설정\n\n// Before\ndata.items.map(...)\n// After\n(data?.items ?? []).map(...)',
    result_video_url: null,
    outcome: '디버깅 시간 70% 절감',
    sort_order: 3,
  },

  // --- UI/UX 디자이너 ---
  {
    id: 'ruc-uiux-1', role_showcase_id: 'rs-uiux-designer', tool_slug: 'v0',
    title: '자연어로 UI 컴포넌트 생성',
    description: '"대시보드 사이드바 만들어줘"로 즉시 React 코드 + 미리보기 제공',
    prompt_example: '관리자 대시보드 사이드바를 만들어줘. 다크 테마, 접기/펴기 기능, 아이콘 포함.',
    result_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '프로토타입 제작 시간 90% 단축',
    sort_order: 1,
  },
  {
    id: 'ruc-uiux-2', role_showcase_id: 'rs-uiux-designer', tool_slug: 'midjourney',
    title: 'UI 무드보드 및 컨셉 이미지 생성',
    description: '앱 디자인 방향성을 AI 이미지로 빠르게 시각화',
    prompt_example: 'Mobile banking app UI, dark theme, glassmorphism, neon accents, minimal --ar 9:16',
    result_image_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '무드보드 제작 3일 → 30분',
    sort_order: 2,
  },
  {
    id: 'ruc-uiux-3', role_showcase_id: 'rs-uiux-designer', tool_slug: 'chatgpt',
    title: '사용성 테스트 시나리오 자동 생성',
    description: '대상 페르소나와 태스크를 입력하면 테스트 시나리오 완성',
    prompt_example: '30대 직장인 대상 가계부 앱의 사용성 테스트 시나리오 5개 작성해줘',
    result_image_url: null,
    result_text: '시나리오 1: 첫 지출 등록하기\n- Task: "오늘 점심 식사비 12,000원을 기록해주세요"\n- 관찰 포인트: 카테고리 선택 용이성, 금액 입력 UX\n- 성공 기준: 30초 이내 완료\n...',
    result_video_url: null,
    outcome: '테스트 준비 시간 80% 절감',
    sort_order: 3,
  },

  // --- 그래픽 디자이너 ---
  {
    id: 'ruc-graphic-1', role_showcase_id: 'rs-graphic-designer', tool_slug: 'midjourney',
    title: '브랜드 로고 컨셉 아이디어',
    description: '키워드만 입력하면 다양한 로고 컨셉을 수십 개 생성',
    prompt_example: 'Minimal tech startup logo, letter A, gradient blue to purple, geometric --style raw',
    result_image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '초기 컨셉 도출 5일 → 1시간',
    sort_order: 1,
  },
  {
    id: 'ruc-graphic-2', role_showcase_id: 'rs-graphic-designer', tool_slug: 'dall-e-3',
    title: '마케팅 소재 이미지 대량 생성',
    description: 'SNS, 배너, 포스터용 이미지를 프롬프트로 빠르게 생성',
    prompt_example: '봄 세일 프로모션 배너, 벚꽃 배경, 한국적 느낌, 깔끔한 타이포그래피',
    result_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '소재 제작 비용 60% 절감',
    sort_order: 2,
  },
  {
    id: 'ruc-graphic-3', role_showcase_id: 'rs-graphic-designer', tool_slug: 'canva-ai',
    title: '소셜 미디어 디자인 자동화',
    description: 'AI가 브랜드 가이드에 맞는 디자인을 자동 생성',
    prompt_example: '인스타그램 피드용 카페 메뉴 소개 포스트, 미니멀 스타일',
    result_image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '소셜 미디어 포스트 하루 10개 → 50개 생산',
    sort_order: 3,
  },

  // --- 마케터 ---
  {
    id: 'ruc-marketer-1', role_showcase_id: 'rs-marketer', tool_slug: 'chatgpt',
    title: 'SNS 광고 카피 대량 생성',
    description: '타겟, 톤, 제품 특성을 입력하면 A/B 테스트용 카피 즉시 생성',
    prompt_example: '20대 여성 타겟, 봄 신상 원피스 인스타 광고 카피 10개. 톤: 트렌디하고 감각적',
    result_image_url: null,
    result_text: '1. "봄바람에 흩날리는 플로럴 원피스 🌸 지금 아니면 품절"\n2. "올봄 첫 데이트? 이 원피스면 준비 끝 💕"\n3. "OOTD 고민 끝. 입기만 하면 분위기 여신"\n4. "벚꽃보다 예쁜 건 이 원피스 입은 너"\n5. "봄 한정판 ⚡ 재입고 없음, 서두르세요"',
    result_video_url: null,
    outcome: '카피 작성 시간 80% 절감, CTR 25% 향상',
    sort_order: 1,
  },
  {
    id: 'ruc-marketer-2', role_showcase_id: 'rs-marketer', tool_slug: 'jasper',
    title: '블로그 SEO 콘텐츠 자동 작성',
    description: '키워드와 톤만 지정하면 SEO 최적화된 블로그 포스트 완성',
    prompt_example: '키워드: "2026 마케팅 트렌드", 2000자, 전문적이면서 읽기 쉬운 톤',
    result_image_url: null,
    result_text: '# 2026년 마케팅 트렌드 TOP 7\n\n마케팅 시장이 빠르게 변하고 있습니다. AI, 숏폼, 하이퍼 개인화...\n\n## 1. AI 네이티브 마케팅\n생성형 AI가 단순 보조 도구를 넘어...\n\n## 2. 숏폼 커머스\n틱톡샵, 인스타 릴스 쇼핑...',
    result_video_url: null,
    outcome: '블로그 발행 주 1회 → 주 5회, 유기 트래픽 3배 증가',
    sort_order: 2,
  },
  {
    id: 'ruc-marketer-3', role_showcase_id: 'rs-marketer', tool_slug: 'perplexity',
    title: '경쟁사 분석 및 시장 조사',
    description: '최신 데이터 기반 경쟁사 분석 리포트를 실시간 생성',
    prompt_example: '한국 이커머스 시장에서 쿠팡, 네이버쇼핑, 무신사의 2025년 전략을 비교 분석해줘',
    result_image_url: null,
    result_text: '## 경쟁사 분석 요약\n\n| 플랫폼 | 핵심 전략 | 강점 |\n|--------|----------|------|\n| 쿠팡 | 로켓배송 확대 | 물류 인프라 |\n| 네이버 | AI 쇼핑 어시스턴트 | 검색 트래픽 |\n| 무신사 | 글로벌 진출 | MZ세대 충성도 |',
    result_video_url: null,
    outcome: '시장 조사 2주 → 2시간',
    sort_order: 3,
  },

  // --- 영상 크리에이터 ---
  {
    id: 'ruc-video-1', role_showcase_id: 'rs-video-creator', tool_slug: 'runway-ml',
    title: 'AI로 영상 클립 생성',
    description: '텍스트나 이미지를 입력하면 고퀄리티 영상 클립 자동 생성',
    prompt_example: '도쿄 네온사인 거리를 걷는 시네마틱 영상, 비 오는 밤, 느린 카메라 움직임',
    result_image_url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: 'B-roll 촬영 비용 90% 절감',
    sort_order: 1,
  },
  {
    id: 'ruc-video-2', role_showcase_id: 'rs-video-creator', tool_slug: 'capcut',
    title: 'AI 자동 편집 및 자막 생성',
    description: '영상을 올리면 AI가 하이라이트 편집, 자막, 효과를 자동 추가',
    prompt_example: '15분 인터뷰 영상 → 1분 하이라이트 릴스로 자동 편집',
    result_image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '편집 시간 8시간 → 30분',
    sort_order: 2,
  },
  {
    id: 'ruc-video-3', role_showcase_id: 'rs-video-creator', tool_slug: 'sora',
    title: '상상만 하면 영상이 되는 시대',
    description: '텍스트 프롬프트만으로 영화급 퀄리티의 영상 생성',
    prompt_example: '벚꽃이 흩날리는 일본 시골 기차역, 여자가 기차를 기다리는 장면, 지브리 스타일',
    result_image_url: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '스톡 영상 구매 대비 비용 95% 절감',
    sort_order: 3,
  },

  // --- 작가/블로거 ---
  {
    id: 'ruc-writer-1', role_showcase_id: 'rs-writer', tool_slug: 'claude',
    title: '소설/에세이 초고 작성 파트너',
    description: '설정과 톤을 지정하면 초고를 작성하고 피드백까지 제공',
    prompt_example: '한국 1990년대 서울을 배경으로 한 단편소설 도입부를 써줘. 화자는 20대 대학생.',
    result_image_url: null,
    result_text: '"1996년 겨울, 신촌 골목의 포장마차에서 나는 처음으로 술을 마셨다. 삐삐가 울렸지만 확인하지 않았다. 그날따라 PC통신에서 만난 \'별\'이 오프라인에서 만나자고 했던 날이었다..."',
    result_video_url: null,
    outcome: '첫 원고 작성 시간 60% 단축',
    sort_order: 1,
  },
  {
    id: 'ruc-writer-2', role_showcase_id: 'rs-writer', tool_slug: 'grammarly',
    title: '영문 교정 및 톤 조절',
    description: '영어 글의 문법, 스타일, 톤을 AI가 자동으로 교정',
    prompt_example: 'I think this product is good → (Professional tone으로 변환)',
    result_image_url: null,
    result_text: 'Before: "I think this product is good."\nAfter: "This product demonstrates exceptional quality and delivers outstanding value to its users."\n\n교정 사항: 톤 변환 + 구체적 표현 + 설득력 강화',
    result_video_url: null,
    outcome: '영문 교정 시간 90% 절감',
    sort_order: 2,
  },
  {
    id: 'ruc-writer-3', role_showcase_id: 'rs-writer', tool_slug: 'notion-ai',
    title: '블로그 포스트 아이디어 및 구조화',
    description: '주제를 입력하면 아웃라인, SEO 키워드, 예상 반응까지 제안',
    prompt_example: '"재택근무 생산성" 주제로 블로그 포스트 아웃라인을 만들어줘',
    result_image_url: null,
    result_text: '# 재택근무 생산성 200% 올리는 7가지 방법\n\n## 아웃라인\n1. 전용 작업 공간 만들기\n2. 포모도로 테크닉 활용\n3. AI 도구로 반복 업무 자동화\n4. 비동기 커뮤니케이션 원칙\n...\n\n## SEO 키워드\n재택근무, 원격근무, 홈오피스, 생산성',
    result_video_url: null,
    outcome: '콘텐츠 기획 시간 50% 절감',
    sort_order: 3,
  },

  // --- 데이터 분석가 ---
  {
    id: 'ruc-data-1', role_showcase_id: 'rs-data-analyst', tool_slug: 'julius-ai',
    title: '자연어로 데이터 분석 및 시각화',
    description: 'CSV를 업로드하고 "매출 트렌드 보여줘"라고 말하면 즉시 차트 생성',
    prompt_example: '이 매출 데이터에서 월별 성장률을 계산하고 꺾은선 그래프로 보여줘. 이상치도 표시해줘.',
    result_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: 'Excel 작업 4시간 → 5분',
    sort_order: 1,
  },
  {
    id: 'ruc-data-2', role_showcase_id: 'rs-data-analyst', tool_slug: 'chatgpt',
    title: 'Python 분석 코드 자동 생성',
    description: '분석 목적만 설명하면 pandas, matplotlib 코드를 즉시 작성',
    prompt_example: 'A/B 테스트 결과를 분석하는 Python 코드를 짜줘. p-value, 효과 크기, 신뢰구간 포함.',
    result_image_url: null,
    result_text: 'import scipy.stats as stats\nimport numpy as np\n\ndef ab_test_analysis(control, treatment):\n    t_stat, p_value = stats.ttest_ind(control, treatment)\n    effect_size = (np.mean(treatment) - np.mean(control)) / np.std(control)\n    ci = stats.t.interval(0.95, len(treatment)-1, np.mean(treatment), stats.sem(treatment))\n    return {"p_value": p_value, "effect_size": effect_size, "ci_95": ci}',
    result_video_url: null,
    outcome: '분석 코드 작성 시간 70% 절감',
    sort_order: 2,
  },
  {
    id: 'ruc-data-3', role_showcase_id: 'rs-data-analyst', tool_slug: 'gemini',
    title: '데이터 인사이트 자동 도출',
    description: '대규모 데이터셋에서 패턴, 이상치, 트렌드를 AI가 자동 발견',
    prompt_example: '이 고객 데이터에서 이탈 가능성이 높은 고객 세그먼트를 찾아줘',
    result_image_url: null,
    result_text: '## 이탈 위험 고객 세그먼트 분석\n\n1. 고위험군 (이탈 확률 78%)\n   - 최근 30일 접속 0회\n   - 구독 후 3개월 이내\n   - 주요 특성: 무료 체험 후 전환 고객\n\n2. 중위험군 (이탈 확률 45%)\n   - 이용 빈도 주 1회 미만으로 감소\n   - CS 문의 2회 이상',
    result_video_url: null,
    outcome: '고객 이탈률 15% 감소',
    sort_order: 3,
  },

  // --- 사업가/창업자 ---
  {
    id: 'ruc-biz-1', role_showcase_id: 'rs-entrepreneur', tool_slug: 'chatgpt',
    title: '사업 계획서 초안 작성',
    description: '아이디어만 설명하면 시장 분석, 비즈니스 모델, 재무 계획까지 포함된 사업 계획서 생성',
    prompt_example: 'AI 기반 반려동물 건강관리 앱 사업 계획서를 작성해줘. 한국 시장 타겟.',
    result_image_url: null,
    result_text: '# PetAI - AI 반려동물 건강관리 플랫폼\n\n## 시장 규모\n- 한국 반려동물 시장: 6조원 (2025)\n- 펫테크 연평균 성장률: 23%\n\n## 비즈니스 모델\n- 프리미엄 구독: 월 9,900원\n- 동물병원 제휴 수수료: 15%\n\n## 초기 투자 필요액: 3억원',
    result_video_url: null,
    outcome: '사업 계획서 작성 2주 → 2시간',
    sort_order: 1,
  },
  {
    id: 'ruc-biz-2', role_showcase_id: 'rs-entrepreneur', tool_slug: 'gamma',
    title: 'IR 피치덱 자동 생성',
    description: '핵심 내용만 입력하면 투자자 미팅용 피치덱을 AI가 디자인까지 완성',
    prompt_example: 'Series A 투자 유치용 피치덱 10장. 시장기회, 제품, 트랙션, 팀, 재무 포함.',
    result_image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '피치덱 제작 1주 → 2시간',
    sort_order: 2,
  },
  {
    id: 'ruc-biz-3', role_showcase_id: 'rs-entrepreneur', tool_slug: 'perplexity',
    title: '시장 조사 및 경쟁 분석',
    description: '최신 데이터와 출처를 포함한 시장 분석 리포트를 실시간 생성',
    prompt_example: '한국 AI SaaS 시장 규모, 주요 플레이어, 트렌드를 분석해줘',
    result_image_url: null,
    result_text: '## 한국 AI SaaS 시장 분석 (2025)\n\n시장 규모: 2.3조원 (전년 대비 35% 성장)\n\n### 주요 플레이어\n1. 뤼튼 - 한국어 특화 AI\n2. 튜링 - 기업용 AI 솔루션\n3. 업스테이지 - LLM 기술\n\n출처: 과학기술정보통신부, IDC Korea',
    result_video_url: null,
    outcome: '시장 조사 외주 비용 100만원 → 0원',
    sort_order: 3,
  },

  // --- 음악가/작곡가 ---
  {
    id: 'ruc-music-1', role_showcase_id: 'rs-musician', tool_slug: 'suno-ai',
    title: '완성된 노래를 프롬프트 하나로',
    description: '장르, 분위기, 가사 키워드만 입력하면 보컬 포함 완곡 생성',
    prompt_example: '한국어 발라드, 이별 테마, 피아노 반주, 남성 보컬, 3분',
    result_image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '데모 곡 제작 3일 → 5분',
    sort_order: 1,
  },
  {
    id: 'ruc-music-2', role_showcase_id: 'rs-musician', tool_slug: 'udio',
    title: 'AI 작곡으로 다양한 장르 실험',
    description: '같은 멜로디를 다양한 장르로 변환하여 최적의 편곡 발견',
    prompt_example: '일렉트로닉 팝, 몽환적인 분위기, 신스웨이브 베이스, 영어 가사',
    result_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '장르 실험 비용 80% 절감',
    sort_order: 2,
  },
  {
    id: 'ruc-music-3', role_showcase_id: 'rs-musician', tool_slug: 'aiva',
    title: '영상/게임용 BGM 자동 작곡',
    description: '장면 분위기와 길이를 지정하면 로열티 프리 BGM 생성',
    prompt_example: 'Epic orchestral, cinematic trailer music, 60 seconds, building tension',
    result_image_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: 'BGM 외주 비용 곡당 50만원 → 0원',
    sort_order: 3,
  },

  // --- PM/기획자 ---
  {
    id: 'ruc-pm-1', role_showcase_id: 'rs-pm', tool_slug: 'chatgpt',
    title: 'PRD(제품 요구사항 문서) 자동 작성',
    description: '기능 설명만 입력하면 사용자 스토리, 수용 기준까지 포함된 PRD 생성',
    prompt_example: '소셜 로그인 기능 PRD를 작성해줘. Google, Kakao, Apple 지원. 기존 이메일 계정 연동 포함.',
    result_image_url: null,
    result_text: '# PRD: 소셜 로그인 기능\n\n## 목적\n사용자 가입 전환율 향상 (목표: +40%)\n\n## 사용자 스토리\nUS-1: 사용자는 Google 계정으로 원클릭 가입할 수 있다\nUS-2: 기존 이메일 계정에 소셜 계정을 연동할 수 있다\n\n## 수용 기준\n- [ ] 3초 이내 로그인 완료\n- [ ] 기존 계정 자동 감지 및 연동 제안',
    result_video_url: null,
    outcome: 'PRD 작성 3일 → 1시간',
    sort_order: 1,
  },
  {
    id: 'ruc-pm-2', role_showcase_id: 'rs-pm', tool_slug: 'claude',
    title: '경쟁사 기능 분석 매트릭스',
    description: '경쟁 서비스들의 기능을 체계적으로 비교 분석',
    prompt_example: 'Notion, Coda, ClickUp의 프로젝트 관리 기능을 비교 분석해줘',
    result_image_url: null,
    result_text: '| 기능 | Notion | Coda | ClickUp |\n|------|--------|------|--------|\n| 간트차트 | ⚠️ 제한적 | ✅ 기본 | ✅ 고급 |\n| 자동화 | ✅ 기본 | ✅ 강력 | ✅ 강력 |\n| AI 기능 | ✅ Notion AI | ⚠️ 베타 | ✅ ClickUp AI |\n| 한국어 | ✅ | ❌ | ⚠️ 부분 |',
    result_video_url: null,
    outcome: '경쟁 분석 1주 → 30분',
    sort_order: 2,
  },
  {
    id: 'ruc-pm-3', role_showcase_id: 'rs-pm', tool_slug: 'gamma',
    title: '스프린트 회고 및 발표 자료',
    description: '스프린트 데이터를 입력하면 회고 발표 자료를 자동 생성',
    prompt_example: 'Sprint 23 회고 발표자료. 완료 12개, 미완 3개, 버그 수정 5개, 번다운차트 포함.',
    result_image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '회고 자료 준비 2시간 → 15분',
    sort_order: 3,
  },

  // === 교육별 USE CASES ===

  // --- 초등 저학년 ---
  {
    id: 'ruc-elem-low-1', role_showcase_id: 'rs-elementary-low', tool_slug: 'dall-e-3',
    title: '상상 속 캐릭터 그려보기',
    description: '"파란 날개 달린 고양이"를 말하면 AI가 그림으로 완성',
    prompt_example: '파란 날개가 달린 귀여운 고양이가 무지개 위를 날고 있는 그림을 그려줘',
    result_image_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '창의력과 상상력 표현 능력 향상',
    sort_order: 1,
  },
  {
    id: 'ruc-elem-low-2', role_showcase_id: 'rs-elementary-low', tool_slug: 'chatgpt',
    title: '나만의 동화 만들기',
    description: '주인공과 장소를 정하면 AI가 동화를 만들어줌',
    prompt_example: '토끼 "뽀뽀"가 숲속에서 친구를 찾는 동화를 써줘. 쉬운 말로.',
    result_image_url: null,
    result_text: '🐰 뽀뽀의 숲속 모험\n\n어느 화창한 날, 토끼 뽀뽀는 숲속으로 산책을 갔어요.\n"안녕! 나랑 친구 할래?" 뽀뽀가 다람쥐에게 말했어요.\n다람쥐는 도토리를 내밀며 "같이 먹자!" 했어요.\n둘은 금세 가장 좋은 친구가 되었답니다. 🌈',
    result_video_url: null,
    outcome: '읽기/쓰기 흥미 유발, 어휘력 향상',
    sort_order: 2,
  },
  {
    id: 'ruc-elem-low-3', role_showcase_id: 'rs-elementary-low', tool_slug: 'canva-ai',
    title: '그림일기 꾸미기',
    description: 'AI가 그림일기 템플릿을 만들어주고 꾸미기 도와줌',
    prompt_example: '오늘 공원에서 자전거 탄 그림일기 페이지 만들어줘',
    result_image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '표현력과 기록 습관 형성',
    sort_order: 3,
  },

  // --- 초등 고학년 ---
  {
    id: 'ruc-elem-high-1', role_showcase_id: 'rs-elementary-high', tool_slug: 'chatgpt',
    title: '수학 문제 풀이 설명',
    description: '풀이 과정을 단계별로 쉽게 설명해줌',
    prompt_example: '분수의 나눗셈 3/4 ÷ 1/2 를 초등학생이 이해할 수 있게 설명해줘',
    result_image_url: null,
    result_text: '분수의 나눗셈은 뒤집어서 곱하기!\n\n3/4 ÷ 1/2\n= 3/4 × 2/1  (뒤집기!)\n= 6/4\n= 1과 2/4\n= 1과 1/2\n\n🍕 피자로 생각하면:\n피자 3/4조각을 1/2명이 나눠 먹으면\n한 사람당 1과 1/2조각이에요!',
    result_video_url: null,
    outcome: '수학 자기주도 학습 능력 향상',
    sort_order: 1,
  },
  {
    id: 'ruc-elem-high-2', role_showcase_id: 'rs-elementary-high', tool_slug: 'gemini',
    title: '과학 실험 시뮬레이션',
    description: '위험한 실험도 AI 설명으로 안전하게 이해',
    prompt_example: '화산이 폭발하는 원리를 초등학생에게 설명해줘. 베이킹소다 실험 방법도 알려줘.',
    result_image_url: null,
    result_text: '🌋 화산 폭발 원리\n\n지구 속 마그마(뜨거운 돌)가 압력으로 올라와요!\n\n🧪 집에서 하는 화산 실험:\n준비물: 베이킹소다, 식초, 빨간 물감\n1. 종이컵에 베이킹소다 2스푼\n2. 빨간 물감 조금\n3. 식초를 부으면... 부글부글! 🔴',
    result_video_url: null,
    outcome: '과학적 호기심과 탐구력 향상',
    sort_order: 2,
  },
  {
    id: 'ruc-elem-high-3', role_showcase_id: 'rs-elementary-high', tool_slug: 'deepl',
    title: '영어 문장 자연스럽게 만들기',
    description: '한국어로 쓰고 자연스러운 영어로 변환하며 학습',
    prompt_example: '"나는 주말에 가족과 놀이공원에 갔다" → 자연스러운 영어로',
    result_image_url: null,
    result_text: '"I went to an amusement park with my family over the weekend."\n\n📚 배울 점:\n- over the weekend = 주말에 (during보다 자연스러운 표현)\n- amusement park = 놀이공원\n- with my family = 가족과 함께',
    result_video_url: null,
    outcome: '영어 표현력과 작문 실력 향상',
    sort_order: 3,
  },

  // --- 중학생 ---
  {
    id: 'ruc-middle-1', role_showcase_id: 'rs-middle-school', tool_slug: 'chatgpt',
    title: '자기주도 학습 계획 세우기',
    description: '시험 범위와 일정을 입력하면 맞춤 학습 계획표 생성',
    prompt_example: '중간고사 2주 전, 수학/영어/과학 시험 범위 알려줄게. 학습 계획표 만들어줘.',
    result_image_url: null,
    result_text: '📋 2주 학습 계획표\n\n1주차: 개념 정리\n- 월: 수학 - 일차함수 개념 + 연습문제\n- 화: 영어 - Unit 5-6 단어/문법\n- 수: 과학 - 힘과 운동 정리\n- 목: 수학 - 일차함수 응용\n- 금: 영어 - 독해 연습\n\n2주차: 문제 풀이 + 오답 정리\n...',
    result_video_url: null,
    outcome: '학습 계획 수립 능력 + 시간 관리 능력 향상',
    sort_order: 1,
  },
  {
    id: 'ruc-middle-2', role_showcase_id: 'rs-middle-school', tool_slug: 'gamma',
    title: '발표 자료 만들기',
    description: '발표 주제를 입력하면 디자인된 슬라이드 자동 생성',
    prompt_example: '"기후변화와 우리의 역할" 주제로 5분 발표 슬라이드 만들어줘',
    result_image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '발표 준비 시간 80% 절감, 프레젠테이션 실력 향상',
    sort_order: 2,
  },
  {
    id: 'ruc-middle-3', role_showcase_id: 'rs-middle-school', tool_slug: 'cursor',
    title: '처음 코딩 배우기',
    description: 'AI가 코드를 설명하고 실시간으로 도와주는 코딩 입문',
    prompt_example: 'Python으로 가위바위보 게임 만들고 싶어. 한 줄씩 설명해줘.',
    result_image_url: null,
    result_text: 'import random  # 컴퓨터가 랜덤 선택\n\nchoices = ["가위", "바위", "보"]\ncomputer = random.choice(choices)\nplayer = input("가위/바위/보 중 선택: ")\n\nif player == computer:\n    print("비겼습니다!")\nelif (player == "가위" and computer == "보"):\n    print("이겼습니다! 🎉")\nelse:\n    print("졌습니다 😢")',
    result_video_url: null,
    outcome: '코딩 기초 개념 습득, 논리적 사고력 향상',
    sort_order: 3,
  },

  // --- 고등학생 ---
  {
    id: 'ruc-high-1', role_showcase_id: 'rs-high-school', tool_slug: 'claude',
    title: '자기소개서 첨삭 및 구조화',
    description: '대학 자소서 초안을 AI가 구조, 논리, 표현 면에서 피드백',
    prompt_example: '서울대 컴퓨터공학과 자소서를 첨삭해줘. 지원동기, 학업계획 부분.',
    result_image_url: null,
    result_text: '## 첨삭 피드백\n\n✅ 강점: 구체적 경험 사례가 좋습니다\n⚠️ 개선점:\n1. 지원동기가 다소 추상적 → "AI 윤리에 관심을 갖게 된 계기"를 구체적 에피소드로\n2. 학업계획이 나열식 → "1학년: 기초→2학년: 심화→3학년: 연구"의 성장 스토리로\n3. "열정" "도전" 같은 클리셰 → 구체적 행동으로 대체',
    result_video_url: null,
    outcome: '자소서 완성도 대폭 향상',
    sort_order: 1,
  },
  {
    id: 'ruc-high-2', role_showcase_id: 'rs-high-school', tool_slug: 'chatgpt',
    title: '수능 지문 분석 및 해설',
    description: '어려운 수능 지문을 단계별로 분석하고 핵심 논리를 설명',
    prompt_example: '이 수능 국어 비문학 지문의 논리 구조를 분석해줘. 핵심 주장과 근거를 구분해서.',
    result_image_url: null,
    result_text: '## 지문 분석\n\n📌 핵심 주장: 인공지능의 판단은 인간의 윤리적 검토가 필요\n\n📝 논리 구조:\n1단락: 배경 - AI 의사결정의 확산\n2단락: 문제 제기 - 알고리즘 편향성\n3단락: 근거 - 의료 AI 오진 사례\n4단락: 해결 - 인간-AI 협업 모델 제안\n\n⚡ 출제 포인트: 3단락 사례의 역할 = 주장의 근거',
    result_video_url: null,
    outcome: '비문학 독해력 향상, 수능 국어 3등급 → 1등급',
    sort_order: 2,
  },
  {
    id: 'ruc-high-3', role_showcase_id: 'rs-high-school', tool_slug: 'perplexity',
    title: '탐구 보고서 자료 조사',
    description: '학술적 출처가 포함된 자료 조사를 AI가 지원',
    prompt_example: '"미세플라스틱이 해양 생태계에 미치는 영향"에 대한 최신 연구 자료를 찾아줘',
    result_image_url: null,
    result_text: '## 미세플라스틱 해양 영향 연구 요약\n\n1. Nature(2024): 심해 5,000m에서도 미세플라스틱 검출\n2. Science(2025): 해양 플랑크톤의 미세플라스틱 섭취율 43% 증가\n3. 해양수산부 보고서: 한국 연안 미세플라스틱 농도 세계 평균 3배\n\n📎 참고문헌 형식으로도 제공 가능',
    result_video_url: null,
    outcome: '탐구 보고서 품질 향상, 학술적 글쓰기 능력 습득',
    sort_order: 3,
  },

  // --- 대학생 ---
  {
    id: 'ruc-college-1', role_showcase_id: 'rs-college', tool_slug: 'chatgpt',
    title: '리포트/논문 구조 잡기',
    description: '주제와 요구사항을 입력하면 논문 구조와 아웃라인 생성',
    prompt_example: '"SNS가 대학생 자존감에 미치는 영향" 주제로 학기말 리포트 아웃라인을 잡아줘',
    result_image_url: null,
    result_text: '# SNS와 대학생 자존감: 양날의 검\n\nI. 서론\n  - 연구 배경 및 목적\n  - 선행 연구 요약\n\nII. 이론적 배경\n  - 사회비교이론 (Festinger, 1954)\n  - SNS와 자기표현\n\nIII. 연구 방법\n  - 설문조사 (N=200)\n  - Rosenberg 자존감 척도 활용\n\nIV. 예상 결과 및 논의',
    result_video_url: null,
    outcome: '리포트 구조화 시간 70% 절감',
    sort_order: 1,
  },
  {
    id: 'ruc-college-2', role_showcase_id: 'rs-college', tool_slug: 'cursor',
    title: '졸업 프로젝트 개발',
    description: 'AI 코딩 어시스턴트와 함께 졸업 프로젝트를 빠르게 완성',
    prompt_example: 'Flask + React로 학식 메뉴 추천 웹앱을 만들고 싶어. 프로젝트 구조부터 잡아줘.',
    result_image_url: null,
    result_text: '📁 프로젝트 구조\n\nmenu-recommender/\n├── backend/\n│   ├── app.py         # Flask 서버\n│   ├── models.py      # DB 모델\n│   ├── recommender.py # 추천 알고리즘\n│   └── requirements.txt\n├── frontend/\n│   ├── src/\n│   │   ├── App.tsx\n│   │   ├── pages/\n│   │   └── components/\n│   └── package.json\n└── README.md',
    result_video_url: null,
    outcome: '프로젝트 개발 기간 3개월 → 3주',
    sort_order: 2,
  },
  {
    id: 'ruc-college-3', role_showcase_id: 'rs-college', tool_slug: 'canva-ai',
    title: '포트폴리오 디자인',
    description: 'AI가 포트폴리오 레이아웃을 자동 생성하고 디자인 제안',
    prompt_example: '취업용 포트폴리오, 미니멀 디자인, 프로젝트 3개 포함, PDF 형태',
    result_image_url: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '포트폴리오 완성 2주 → 2시간',
    sort_order: 3,
  },

  // --- 교사/교수 ---
  {
    id: 'ruc-teacher-1', role_showcase_id: 'rs-teacher', tool_slug: 'chatgpt',
    title: '수업 자료 및 학습지 자동 생성',
    description: '학년, 과목, 단원을 입력하면 맞춤 학습지를 자동 생성',
    prompt_example: '중학교 2학년 수학 "연립방정식" 단원 연습문제 10개를 난이도별로 만들어줘',
    result_image_url: null,
    result_text: '📝 연립방정식 연습문제\n\n[기초] 1-3번\n1. x + y = 5, x - y = 1\n2. 2x + y = 7, x + y = 4\n\n[중급] 4-7번\n4. 3x - 2y = 1, x + 3y = 14\n\n[심화] 8-10번\n8. 사과 3개와 배 2개의 가격이 5,000원...\n\n✅ 정답지 포함 | 📊 난이도 분포: 기초 30%, 중급 40%, 심화 30%',
    result_video_url: null,
    outcome: '학습지 제작 시간 3시간 → 10분',
    sort_order: 1,
  },
  {
    id: 'ruc-teacher-2', role_showcase_id: 'rs-teacher', tool_slug: 'gamma',
    title: '수업 PPT 자동 생성',
    description: '수업 주제와 학년을 입력하면 시각적 수업 자료 완성',
    prompt_example: '초등 5학년 과학 "태양계" 단원 수업 PPT 10장. 이미지 풍부하게.',
    result_image_url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '수업 준비 시간 대폭 절감, 학생 참여도 향상',
    sort_order: 2,
  },
  {
    id: 'ruc-teacher-3', role_showcase_id: 'rs-teacher', tool_slug: 'claude',
    title: '학생 개별 피드백 작성',
    description: '학생 과제를 분석하고 개인 맞춤 피드백을 자동 생성',
    prompt_example: '이 학생의 독서감상문을 분석하고 칭찬 2개, 개선점 2개로 피드백을 써줘',
    result_image_url: null,
    result_text: '🌟 잘한 점:\n1. 등장인물의 심리를 자신의 경험과 연결한 점이 훌륭합니다\n2. 책의 주제를 정확하게 파악했어요\n\n📝 더 좋아지려면:\n1. "감동적이다"보다 어떤 부분이 왜 감동적이었는지 구체적으로\n2. 결론에서 이 책이 나에게 어떤 변화를 주었는지 한 문장 추가해보세요',
    result_video_url: null,
    outcome: '30명 피드백 5시간 → 30분',
    sort_order: 3,
  },

  // --- 학부모 ---
  {
    id: 'ruc-parent-1', role_showcase_id: 'rs-parent', tool_slug: 'chatgpt',
    title: '자녀 학습 가이드 역할',
    description: '아이의 숙제를 부모가 도와줄 수 있도록 설명 제공',
    prompt_example: '초등 4학년 아이에게 분수 개념을 피자로 설명하는 방법을 알려줘',
    result_image_url: null,
    result_text: '🍕 피자로 배우는 분수!\n\n준비물: 종이 원 2개\n\n1단계: "피자를 2조각으로 나누면 한 조각은 1/2이야"\n2단계: "4조각으로 나누면 한 조각은 1/4"\n3단계: "어떤 게 더 클까? 1/2 vs 1/4"\n4단계: 실제로 종이 피자를 자르면서 확인!\n\n💡 핵심: 분모가 클수록 한 조각이 작아져요',
    result_video_url: null,
    outcome: '가정 학습 지도 품질 향상',
    sort_order: 1,
  },
  {
    id: 'ruc-parent-2', role_showcase_id: 'rs-parent', tool_slug: 'dall-e-3',
    title: '아이와 함께 그림 그리기',
    description: '아이의 상상을 AI 그림으로 시각화하며 놀이학습',
    prompt_example: '우리 아이가 "우주에서 피자 먹는 공룡"을 보고 싶대요. 귀여운 그림으로 그려줘.',
    result_image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '창의적 놀이 시간 확보, 부모-자녀 유대 강화',
    sort_order: 2,
  },
  {
    id: 'ruc-parent-3', role_showcase_id: 'rs-parent', tool_slug: 'gemini',
    title: '안전한 AI 사용 가이드',
    description: '자녀의 나이에 맞는 AI 사용 규칙과 가이드라인 제공',
    prompt_example: '초등학생 자녀의 AI 사용 규칙 5가지를 알려줘. 부모 지도 방법 포함.',
    result_image_url: null,
    result_text: '🛡️ 초등학생 AI 사용 5대 규칙\n\n1. AI 결과를 무조건 믿지 않기 - "AI도 틀릴 수 있어"\n2. 개인정보 절대 입력 금지 - 이름, 주소, 학교명\n3. 숙제는 AI 도움받되, 본인이 이해하기\n4. 부모님과 함께 사용하기 (하루 30분 제한)\n5. "이상한 대화"가 나오면 바로 부모님께 보여주기\n\n📱 부모 설정: ChatGPT 대화 기록 공유 활성화',
    result_video_url: null,
    outcome: '안전한 디지털 리터러시 교육',
    sort_order: 3,
  },

  // --- 학원 강사 ---
  {
    id: 'ruc-academy-1', role_showcase_id: 'rs-academy-tutor', tool_slug: 'chatgpt',
    title: '맞춤형 문제 출제',
    description: '학생 수준에 맞는 문제를 자동으로 생성하고 해설까지 포함',
    prompt_example: '중3 영어, 관계대명사 문법 문제 10개. 난이도 중하. 한글 해설 포함.',
    result_image_url: null,
    result_text: '📝 관계대명사 문제 (중3 수준)\n\n1. The boy _____ is playing soccer is my friend.\n   a) who  b) which  c) what\n   정답: a) who (사람 → who)\n\n2. This is the book _____ I bought yesterday.\n   a) who  b) which  c) whom\n   정답: b) which (사물 → which)\n...',
    result_video_url: null,
    outcome: '문제 출제 시간 90% 절감',
    sort_order: 1,
  },
  {
    id: 'ruc-academy-2', role_showcase_id: 'rs-academy-tutor', tool_slug: 'claude',
    title: '학생별 취약점 분석',
    description: '학생의 오답 패턴을 분석하고 맞춤 학습 계획 제안',
    prompt_example: '이 학생이 틀린 수학 문제 20개를 분석해서 취약 단원과 보충 학습 계획을 세워줘',
    result_image_url: null,
    result_text: '## 취약점 분석 결과\n\n📊 오답 패턴:\n- 일차방정식 이항 실수: 8/20 (40%)\n- 분수 계산 오류: 5/20 (25%)\n- 문장제 해석 실수: 4/20 (20%)\n\n📋 보충 학습 계획:\n1주차: 이항 원리 재학습 + 연습 30문제\n2주차: 분수 연산 기초부터 복습\n3주차: 문장제 핵심어 밑줄 긋기 훈련',
    result_video_url: null,
    outcome: '학생 맞춤 지도 품질 향상',
    sort_order: 2,
  },
  {
    id: 'ruc-academy-3', role_showcase_id: 'rs-academy-tutor', tool_slug: 'gamma',
    title: '수업 자료 자동 생성',
    description: '단원과 학년만 입력하면 수업용 프레젠테이션 자동 생성',
    prompt_example: '고1 영어 "가정법" 수업 자료 8장. 예문 풍부하게.',
    result_image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '수업 자료 제작 2시간 → 10분',
    sort_order: 3,
  },

  // --- 코딩 강사 ---
  {
    id: 'ruc-coding-1', role_showcase_id: 'rs-coding-tutor', tool_slug: 'cursor',
    title: '실습 프로젝트 환경 구축',
    description: 'AI가 학생별 실습 프로젝트 보일러플레이트를 자동 생성',
    prompt_example: 'Python 기초반 학생용 "가위바위보 게임" 실습 환경. 힌트 주석 포함, 빈칸 채우기 형태.',
    result_image_url: null,
    result_text: '# 가위바위보 게임 만들기 🎮\n# TODO: 빈칸을 채워 게임을 완성하세요!\n\nimport random\n\nchoices = ["가위", "바위", "보"]\n\n# 1단계: 컴퓨터의 선택 (힌트: random.choice 사용)\ncomputer = ______\n\n# 2단계: 사용자 입력받기 (힌트: input 함수)\nplayer = ______\n\n# 3단계: 승패 판정 (힌트: if/elif/else)\n# 여기에 코드를 작성하세요',
    result_video_url: null,
    outcome: '실습 환경 준비 시간 80% 절감',
    sort_order: 1,
  },
  {
    id: 'ruc-coding-2', role_showcase_id: 'rs-coding-tutor', tool_slug: 'github-copilot',
    title: '학생 코드 실시간 리뷰',
    description: 'AI가 학생 코드의 오류와 개선점을 즉시 피드백',
    prompt_example: '이 학생의 Python 코드를 리뷰해줘. 초보자 수준에 맞는 피드백으로.',
    result_image_url: null,
    result_text: '## 코드 리뷰 피드백\n\n✅ 잘한 점: 변수명이 의미 있게 작성됨\n\n⚠️ 개선 사항:\n1. 5번째 줄: `=` 대신 `==` 사용해야 해요 (비교 연산자)\n2. 들여쓰기가 일관되지 않아요 → 탭 대신 스페이스 4칸\n3. 변수 `a`보다 `user_score` 같은 이름이 더 좋아요\n\n💡 팁: print()로 중간값 확인하는 습관을 들여보세요!',
    result_video_url: null,
    outcome: '1:1 코드 리뷰 시간 60% 절감',
    sort_order: 2,
  },
  {
    id: 'ruc-coding-3', role_showcase_id: 'rs-coding-tutor', tool_slug: 'v0',
    title: '프론트엔드 수업 교안 자동 생성',
    description: 'React/HTML 수업 예제를 AI가 미리보기와 함께 생성',
    prompt_example: 'HTML/CSS 기초 수업용 "나만의 프로필 카드" 실습 예제',
    result_image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
    result_text: null,
    result_video_url: null,
    outcome: '수업 예제 제작 시간 70% 절감',
    sort_order: 3,
  },
];

// =============================================
// seed.json에 추가
// =============================================
seed.category_showcases = category_showcases;
seed.tool_showcases = tool_showcases;
seed.role_showcases = role_showcases;
seed.role_use_cases = role_use_cases;

writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf-8');

console.log(`✅ 쇼케이스 시드 데이터 생성 완료:`);
console.log(`   - category_showcases: ${category_showcases.length}개`);
console.log(`   - tool_showcases: ${tool_showcases.length}개`);
console.log(`   - role_showcases: ${role_showcases.length}개`);
console.log(`   - role_use_cases: ${role_use_cases.length}개`);
console.log(`   합계: ${category_showcases.length + tool_showcases.length + role_showcases.length + role_use_cases.length}개`);
