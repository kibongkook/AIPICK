import type {
  AIRecipe,
  AIRecipeV2,
  AnyRecipe,
  RecipeDifficultyV2,
  RecipeOption,
} from '@/types';
import { isRecipeV2 } from '@/types';

/** v1 난이도 → v2 난이도 매핑 */
const DIFFICULTY_MAP: Record<string, RecipeDifficultyV2> = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

/** 난이도 한 단계 낮추기 */
function lowerDifficulty(d: RecipeDifficultyV2): RecipeDifficultyV2 {
  switch (d) {
    case 'expert': return 'hard';
    case 'hard': return 'medium';
    case 'medium': return 'easy';
    case 'easy': return 'very-easy';
    default: return 'very-easy';
  }
}

/** 빠른 방법의 예상 소요 시간 추정 */
function estimateQuickTime(fullTime: string): string {
  const nums = fullTime.match(/\d+/g)?.map(Number) ?? [];
  const hasHour = fullTime.includes('시간');
  const hasDay = fullTime.includes('일');

  if (hasDay) return '1~2시간';
  if (hasHour) {
    const hours = nums[0] ?? 1;
    if (hours >= 5) return '1~2시간';
    if (hours >= 2) return '30분~1시간';
    return '15~30분';
  }
  const mins = nums[0] ?? 30;
  if (mins >= 30) return '10~15분';
  if (mins >= 20) return '5~10분';
  return '3~5분';
}

/**
 * v1 레시피를 v2 멀티옵션으로 변환 (Phase 3 자동 확장)
 * - 옵션 1 (빠른 방법): 핵심 도구 1개만 사용, 낮은 난이도
 * - 옵션 2 (전체 프로세스): v1 전체 워크플로우, 원래 난이도
 */
export function migrateRecipeV1toV2(v1: AIRecipe): AIRecipeV2 {
  const difficulty = DIFFICULTY_MAP[v1.difficulty] ?? 'medium';
  const easyDifficulty = lowerDifficulty(difficulty);
  const primaryStep = v1.steps[0];
  const isMultiTool = v1.steps.length > 1;

  const quickOption: RecipeOption = {
    option_id: 'quick',
    title: isMultiTool
      ? `${primaryStep.tool_name} 하나로 빠르게`
      : '간단하게 시작하기',
    subtitle: isMultiTool
      ? '핵심 도구 1개만 사용하여 빠르게 결과물 완성'
      : '기본적인 요청으로 빠르게 결과물 확인',
    difficulty: easyDifficulty,
    estimated_time: estimateQuickTime(v1.estimated_time),
    tool_count: 1,
    steps: [{
      step: 1,
      title: primaryStep.title,
      tool_slug: primaryStep.tool_slug,
      tool_name: primaryStep.tool_name,
      action: primaryStep.action,
      prompt_example: primaryStep.prompt_example,
      tip: primaryStep.tip,
    }],
    pros: [
      '가장 빠르고 간단한 방법',
      '도구 1개만 사용하여 진입 장벽이 낮음',
      '처음 시도하는 초보자에게 적합',
    ],
    cons: [
      '결과물의 완성도가 제한적',
      '세부 커스터마이징이 어려움',
      '고급 기능을 활용할 수 없음',
    ],
    best_for: '빠르게 결과물이 필요한 초보자',
    quality_rating: 2,
    customization_rating: 1,
  };

  const fullOption: RecipeOption = {
    option_id: 'full',
    title: isMultiTool ? '전체 프로세스' : '체계적으로 완성하기',
    subtitle: isMultiTool
      ? `${v1.tool_count}개 도구를 활용한 완성도 높은 결과`
      : '구조화된 접근으로 높은 퀄리티 달성',
    difficulty,
    estimated_time: v1.estimated_time,
    tool_count: v1.tool_count,
    steps: v1.steps.map((s) => ({
      step: s.step,
      title: s.title,
      tool_slug: s.tool_slug,
      tool_name: s.tool_name,
      action: s.action,
      prompt_example: s.prompt_example,
      tip: s.tip,
    })),
    pros: [
      isMultiTool ? '여러 도구를 활용하여 높은 퀄리티 달성' : '체계적인 접근으로 높은 퀄리티',
      '단계별로 세밀한 조정 가능',
      '전문가 수준의 완성도',
    ],
    cons: [
      isMultiTool ? '여러 도구를 배워야 하는 학습 비용' : '프롬프트 작성에 경험이 필요',
      '전체 과정에 시간이 더 소요됨',
      isMultiTool ? '도구 간 전환이 번거로울 수 있음' : '반복적인 수정이 필요할 수 있음',
    ],
    best_for: '퀄리티 있는 결과물이 필요한 사용자',
    quality_rating: 4,
    customization_rating: isMultiTool ? 4 : 3,
  };

  return {
    slug: v1.slug,
    title: v1.title,
    subtitle: v1.subtitle,
    category: v1.category,
    difficulty_range: { min: easyDifficulty, max: difficulty },
    result_description: v1.result_description,
    tags: v1.tags,
    icon: v1.icon,
    color: v1.color,
    options: [quickOption, fullOption],
  };
}

/** AnyRecipe → AIRecipeV2 통합 변환 */
export function toRecipeV2(recipe: AnyRecipe): AIRecipeV2 {
  if (isRecipeV2(recipe)) return recipe;
  return migrateRecipeV1toV2(recipe);
}

/** 난이도 순서 (정렬용) */
const DIFFICULTY_ORDER: Record<RecipeDifficultyV2, number> = {
  'very-easy': 0,
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

/** 난이도 값을 숫자로 (정렬 / 비교용) */
export function difficultyToNumber(d: RecipeDifficultyV2): number {
  return DIFFICULTY_ORDER[d] ?? 2;
}

/** v2 레시피의 최소 난이도 순서 값 */
export function getMinDifficulty(recipe: AIRecipeV2): number {
  return difficultyToNumber(recipe.difficulty_range.min);
}
