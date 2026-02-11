// ==========================================
// 자동 카테고리 분류기
// 도구 이름, 설명, 태그를 기반으로 PURPOSE_CATEGORIES slug 매핑
// ==========================================

import { PURPOSE_CATEGORIES } from '@/lib/constants';

type PurposeSlug = (typeof PURPOSE_CATEGORIES)[number]['slug'];

// 카테고리별 키워드 사전
const CATEGORY_KEYWORDS: Record<PurposeSlug, string[]> = {
  writing: [
    'writing', 'writer', 'text', 'document', 'blog', 'article', 'copywriting',
    'grammar', 'translate', 'translation', 'summarize', 'summary', 'paraphrase',
    'proofread', 'essay', 'content writing', 'report', 'notion', 'note',
  ],
  design: [
    'design', 'image', 'photo', 'illustration', 'logo', 'graphic', 'art',
    'thumbnail', 'banner', 'ui design', 'figma', 'canva', 'draw', 'sketch',
    'visual', 'picture', 'wallpaper', 'icon', 'avatar',
  ],
  video: [
    'video', 'film', 'movie', 'animation', 'subtitle', 'caption', 'edit video',
    'music', 'audio', 'sound', 'voice', 'podcast', 'tts', 'text-to-speech',
    'speech', 'youtube', 'stream', 'clip', 'reel',
  ],
  automation: [
    'automation', 'automate', 'workflow', 'integration', 'zapier', 'bot',
    'scrape', 'schedule', 'pipeline', 'no-code', 'nocode', 'task automation',
    'rpa', 'productivity', 'efficiency', 'macro',
  ],
  coding: [
    'code', 'coding', 'programming', 'developer', 'debug', 'github copilot',
    'ide', 'terminal', 'api', 'software', 'deploy', 'devops', 'compiler',
    'repository', 'git', 'frontend', 'backend', 'full-stack',
  ],
  research: [
    'research', 'search', 'analysis', 'data', 'paper', 'journal', 'academic',
    'citation', 'scholar', 'survey', 'insight', 'analytics', 'intelligence',
    'crawl', 'scraping', 'web search',
  ],
  learning: [
    'learn', 'education', 'study', 'tutor', 'quiz', 'flashcard', 'course',
    'language learning', 'exam', 'homework', 'practice', 'mentor', 'teach',
    'training', 'skill', 'certification',
  ],
  presentation: [
    'presentation', 'slide', 'ppt', 'powerpoint', 'keynote', 'deck',
    'pitch', 'template', 'infographic', 'chart', 'diagram',
  ],
  marketing: [
    'marketing', 'seo', 'advertising', 'ad', 'social media', 'email marketing',
    'campaign', 'brand', 'growth', 'conversion', 'funnel', 'landing page',
    'instagram', 'twitter', 'facebook', 'tiktok', 'influencer',
  ],
  building: [
    'build', 'prototype', 'mvp', 'app builder', 'website builder', 'saas',
    'startup', 'product', 'ship', 'launch', 'no-code app', 'low-code',
    'platform', 'framework', 'boilerplate',
  ],
};

/**
 * 도구 이름, 설명, 태그를 기반으로 가장 적합한 카테고리를 자동 분류합니다.
 * 키워드 매칭 기반 점수 계산 후 최고 점수 카테고리 반환.
 */
export function categorizeByDescription(
  name: string,
  description: string | null,
  tags: string[] = []
): PurposeSlug {
  const text = [name, description || '', ...tags].join(' ').toLowerCase();

  let bestSlug: PurposeSlug = 'automation'; // 기본값
  let bestScore = 0;

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        // 이름에서 매칭되면 가중치 2배
        if (name.toLowerCase().includes(kw)) {
          score += 2;
        } else {
          score += 1;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestSlug = slug as PurposeSlug;
    }
  }

  return bestSlug;
}

/**
 * URL에서 도메인을 추출합니다.
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * 이름에서 URL-safe slug를 생성합니다.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
