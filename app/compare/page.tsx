import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRightLeft, Search, Zap, Image, Code2, Video, Music, Languages, BarChart3 } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getTools } from '@/lib/supabase/queries';
import { POPULAR_PAIRS, getCompareUrl } from '@/lib/compare/popular-pairs';
import CompareSelector from '@/components/compare/CompareSelector';
import type { Tool } from '@/types';

export const metadata: Metadata = {
  title: `AI 도구 비교 | ${SITE_NAME}`,
  description: 'AI 도구를 나란히 비교하세요. 가격, 무료 사용량, 기능, 벤치마크를 한눈에 비교합니다.',
};

// 카테고리별 비교 쌍 그룹
const PAIR_GROUPS = [
  {
    title: '만능 AI 챗봇',
    icon: 'Zap',
    pairs: [
      ['chatgpt', 'claude'],
      ['chatgpt', 'gemini'],
      ['claude', 'gemini'],
      ['chatgpt', 'perplexity'],
      ['claude', 'grok'],
    ],
  },
  {
    title: '이미지 생성',
    icon: 'Image',
    pairs: [
      ['midjourney', 'dall-e-3'],
      ['midjourney', 'stable-diffusion'],
      ['dall-e-3', 'leonardo-ai'],
      ['midjourney', 'ideogram'],
      ['adobe-firefly', 'dall-e-3'],
    ],
  },
  {
    title: '코딩 도구',
    icon: 'Code2',
    pairs: [
      ['cursor', 'github-copilot'],
      ['cursor', 'windsurf'],
      ['github-copilot', 'claude-code'],
      ['v0', 'bolt-new'],
      ['replit', 'cursor'],
    ],
  },
  {
    title: '영상 편집',
    icon: 'Video',
    pairs: [
      ['runway-ml', 'sora'],
      ['runway-ml', 'pika'],
      ['capcut', 'descript'],
      ['sora', 'kling-ai'],
    ],
  },
  {
    title: '텍스트 생성',
    icon: 'Zap',
    pairs: [
      ['jasper', 'copy-ai'],
      ['grammarly', 'wordtune'],
      ['writesonic', 'rytr'],
    ],
  },
  {
    title: '번역',
    icon: 'Languages',
    pairs: [
      ['deepl', 'google-translate'],
      ['deepl', 'papago'],
      ['google-translate', 'papago'],
    ],
  },
  {
    title: '음악 & 데이터',
    icon: 'Music',
    pairs: [
      ['suno-ai', 'udio'],
      ['tableau', 'power-bi'],
      ['julius-ai', 'hex'],
    ],
  },
];

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  Image,
  Code2,
  Video,
  Music,
  Languages,
  BarChart3,
};

export default async function CompareIndexPage() {
  const allTools = await getTools();
  const toolMap = new Map(allTools.map((t) => [t.slug, t]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground">AI 도구 비교</h1>
        </div>
        <p className="text-sm text-gray-500">
          두 AI 도구를 선택하면 가격, 무료 사용량, 기능, 벤치마크를 한눈에 비교할 수 있습니다.
        </p>
      </div>

      {/* 도구 선택기 */}
      <div className="mb-10 rounded-xl border border-border bg-white p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">비교할 도구를 검색해서 선택하세요</p>
        <CompareSelector tools={allTools} currentSlugs={[]} />
      </div>

      {/* 인기 비교 */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-1">인기 비교</h2>
        <p className="text-sm text-gray-500 mb-6">사람들이 많이 비교하는 AI 도구 조합</p>

        <div className="space-y-8">
          {PAIR_GROUPS.map((group) => {
            const Icon = ICON_MAP[group.icon] || Zap;
            return (
              <div key={group.title}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-800">{group.title}</h3>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.pairs.map(([slug1, slug2]) => {
                    const tool1 = toolMap.get(slug1);
                    const tool2 = toolMap.get(slug2);
                    if (!tool1 || !tool2) return null;

                    return (
                      <Link
                        key={`${slug1}-${slug2}`}
                        href={getCompareUrl(slug1, slug2)}
                        className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm hover:border-primary hover:shadow-sm transition-all"
                      >
                        <ToolAvatar tool={tool1} />
                        <span className="font-medium truncate">{tool1.name}</span>
                        <span className="text-gray-400 shrink-0">vs</span>
                        <ToolAvatar tool={tool2} />
                        <span className="font-medium truncate">{tool2.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ToolAvatar({ tool }: { tool: Tool }) {
  if (tool.logo_url) {
    return <img src={tool.logo_url} alt={tool.name} className="h-5 w-5 rounded object-cover shrink-0" />;
  }
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-[9px] font-bold text-gray-600 shrink-0">
      {tool.name.charAt(0)}
    </div>
  );
}
