'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ALL_RECIPES } from '@/data/recipes';
import { toRecipeV2 } from '@/lib/recipe-adapter';
import RecipeCard from '@/components/recipe/RecipeCard';
import RecipeCommunitySection from './RecipeCommunitySection';
import type { CommunityPost } from '@/types';

interface RecipeCarouselProps {
  communityPosts: CommunityPost[];
}

// 상수 정의 (매직 넘버 제거)
const MILLISECONDS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;
const SLIDE_DURATION = 350; // 슬라이드 애니메이션 시간 (ms)

/**
 * 주 번호 기반으로 Featured Recipe 인덱스를 계산
 * 매주 다른 레시피가 초기 Featured로 표시됨
 */
const getWeeklyFeaturedIndex = (totalRecipes: number): number => {
  if (totalRecipes === 0) return 0;

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const weekNumber = Math.floor(diff / MILLISECONDS_PER_WEEK);

  return weekNumber % totalRecipes;
};

// 카테고리 필터 정의 (실제 사용 빈도 기반)
const RECIPE_FILTERS = [
  { id: 'writing', label: '글쓰기', categories: ['writing', 'blog', 'social'] },
  { id: 'document', label: '문서 작성', categories: ['presentation', 'business', 'brand'] },
  { id: 'image', label: '이미지 생성', categories: ['image', 'design'] },
  { id: 'video', label: '동영상 생성', categories: ['video'] },
  { id: 'music', label: '노래 생성', categories: ['music', 'audio', 'podcast'] },
  { id: 'automation', label: '자동화', categories: ['data', 'marketing', 'ecommerce'] },
  { id: 'education', label: '교육', categories: ['education', 'personal'] },
  { id: 'coding', label: '코딩', categories: ['coding'] },
] as const;

export default function RecipeCarousel({ communityPosts: initialPosts }: RecipeCarouselProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>(() => {
    // sessionStorage에서 마지막 필터 복원
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('recipeFilter') || 'writing';
    }
    return 'writing';
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const isSliding = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 필터링된 레시피 목록
  const filteredRecipes = ALL_RECIPES.filter(recipe => {
    const filterConfig = RECIPE_FILTERS.find(f => f.id === selectedFilter);
    return (filterConfig?.categories as readonly string[]).includes(recipe.category);
  });

  // 컴포넌트 마운트 시 마지막 인덱스 복원
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIndex = sessionStorage.getItem('recipeIndex');
      if (savedIndex) {
        setCurrentIndex(parseInt(savedIndex, 10));
      }
    }
  }, []);

  // 필터/인덱스 변경 시 sessionStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('recipeFilter', selectedFilter);
      sessionStorage.setItem('recipeIndex', currentIndex.toString());
    }
  }, [selectedFilter, currentIndex]);

  if (filteredRecipes.length === 0) return null;

  const currentRecipe = filteredRecipes[currentIndex];
  const prevIndex = (currentIndex - 1 + filteredRecipes.length) % filteredRecipes.length;
  const nextIndex = (currentIndex + 1) % filteredRecipes.length;
  const prevRecipe = filteredRecipes[prevIndex];
  const nextRecipe = filteredRecipes[nextIndex];

  // 현재 레시피에서 사용하는 도구 목록 추출
  const currentV2 = toRecipeV2(currentRecipe);
  const allSteps = currentV2.options.flatMap(opt => opt.steps);
  const recipeTools = Array.from(
    new Set(allSteps.map(step => step.tool_slug))
  );

  /** 인덱스 변경 (필터 경계 처리 포함) */
  const changeIndex = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (currentIndex === filteredRecipes.length - 1) {
        const idx = RECIPE_FILTERS.findIndex(f => f.id === selectedFilter);
        const nextFilter = RECIPE_FILTERS[(idx + 1) % RECIPE_FILTERS.length];
        setSelectedFilter(nextFilter.id);
        setCurrentIndex(0);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } else {
      if (currentIndex === 0) {
        const idx = RECIPE_FILTERS.findIndex(f => f.id === selectedFilter);
        const prevIdx = (idx - 1 + RECIPE_FILTERS.length) % RECIPE_FILTERS.length;
        const prevFilter = RECIPE_FILTERS[prevIdx];
        const prevRecipes = ALL_RECIPES.filter(r =>
          (prevFilter.categories as readonly string[]).includes(r.category)
        );
        setSelectedFilter(prevFilter.id);
        setCurrentIndex(prevRecipes.length - 1);
      } else {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  /** 슬라이드 애니메이션 → 인덱스 변경 → 위치 리셋 */
  const slideToDirection = (direction: 'next' | 'prev') => {
    if (isSliding.current) return;
    isSliding.current = true;

    const containerWidth = containerRef.current?.offsetWidth || 600;
    const targetOffset = direction === 'next' ? -containerWidth : containerWidth;

    setDragOffset(targetOffset);

    setTimeout(() => {
      setSkipTransition(true);
      changeIndex(direction);
      setDragOffset(0);

      requestAnimationFrame(() => {
        setSkipTransition(false);
        isSliding.current = false;
      });
    }, SLIDE_DURATION);
  };

  const handlePrev = () => {
    if (isDragging || isSliding.current) return;
    slideToDirection('prev');
  };

  const handleNext = () => {
    if (isDragging || isSliding.current) return;
    slideToDirection('next');
  };

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
    setHasDragged(false);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - startX;
    setDragOffset(offset);

    // 10px 이상 움직이면 "실제 드래그"로 간주
    if (Math.abs(offset) > 10) {
      setHasDragged(true);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const shouldSlideNext = hasDragged && dragOffset < -50;
    const shouldSlidePrev = hasDragged && dragOffset > 50;

    setIsDragging(false);

    // rAF로 transition 활성화 후 애니메이션 실행
    requestAnimationFrame(() => {
      if (shouldSlideNext) {
        slideToDirection('next');
      } else if (shouldSlidePrev) {
        slideToDirection('prev');
      } else {
        // 임계값 미만: 원래 위치로 스냅백 (transition 적용)
        setDragOffset(0);
      }
    });

    setTimeout(() => {
      setHasDragged(false);
    }, 100);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  return (
    <section>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-extrabold text-foreground">
            AI 레시피 <span className="text-xs font-normal text-gray-400">· AI 조합 단계별 가이드 · 매주 새로운 추천</span>
          </h2>
        </div>
        <Link
          href="/recipes"
          className="text-xs font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-0.5"
        >
          전체 보기
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 필터 버튼 */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {RECIPE_FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => {
              setSelectedFilter(filter.id);
              setCurrentIndex(0); // 필터 변경 시 첫 번째 레시피로 이동
            }}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
              selectedFilter === filter.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 캐러셀 */}
      <div className="relative mb-6">
        {/* 이전 버튼 */}
        {filteredRecipes.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110"
            aria-label="이전 레시피"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* 레시피 캐러셀 컨테이너 */}
        <div ref={containerRef} className="px-12 overflow-hidden">
          <div
            className={`flex ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => {
              // 드래그가 발생했으면 클릭 이벤트 차단
              if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            style={{
              transform: `translateX(calc(-100% + ${dragOffset}px))`,
              transition: (isDragging || skipTransition) ? 'none' : `transform ${SLIDE_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            }}
          >
            {/* 이전 레시피 */}
            <div className="w-full flex-shrink-0 px-1 pointer-events-none opacity-50">
              <RecipeCard recipe={prevRecipe} />
            </div>

            {/* 현재 레시피 */}
            <div
              className="w-full flex-shrink-0 px-1"
              onClick={(e) => {
                if (hasDragged) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onClickCapture={(e) => {
                if (hasDragged) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <RecipeCard recipe={currentRecipe} />
            </div>

            {/* 다음 레시피 */}
            <div className="w-full flex-shrink-0 px-1 pointer-events-none opacity-50">
              <RecipeCard recipe={nextRecipe} />
            </div>
          </div>
        </div>

        {/* 다음 버튼 */}
        {filteredRecipes.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110"
            aria-label="다음 레시피"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* 인디케이터 */}
        {filteredRecipes.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {filteredRecipes.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isSliding.current || isDragging || index === currentIndex) return;
                  isSliding.current = true;

                  const direction = index > currentIndex ? -1 : 1;
                  const containerWidth = containerRef.current?.offsetWidth || 600;

                  setDragOffset(direction * containerWidth);

                  setTimeout(() => {
                    setSkipTransition(true);
                    setCurrentIndex(index);
                    setDragOffset(0);

                    requestAnimationFrame(() => {
                      setSkipTransition(false);
                      isSliding.current = false;
                    });
                  }, SLIDE_DURATION);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary w-6'
                    : 'bg-gray-300 w-2 hover:bg-gray-400'
                }`}
                aria-label={`레시피 ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 레시피 관련 커뮤니티 전체 섹션 */}
      <RecipeCommunitySection
        key={currentRecipe.slug}
        recipe={currentRecipe}
        recipeTools={recipeTools}
      />
    </section>
  );
}
