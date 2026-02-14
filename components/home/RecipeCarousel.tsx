'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { AI_RECIPES } from '@/data/recipes';
import RecipeCard from '@/components/recipe/RecipeCard';
import RecipeCommunitySection from './RecipeCommunitySection';
import type { CommunityPost } from '@/types';

interface RecipeCarouselProps {
  communityPosts: CommunityPost[];
}

export default function RecipeCarousel({ communityPosts: initialPosts }: RecipeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (AI_RECIPES.length === 0) return null;

  const currentRecipe = AI_RECIPES[currentIndex];
  const prevIndex = (currentIndex - 1 + AI_RECIPES.length) % AI_RECIPES.length;
  const nextIndex = (currentIndex + 1) % AI_RECIPES.length;
  const prevRecipe = AI_RECIPES[prevIndex];
  const nextRecipe = AI_RECIPES[nextIndex];

  // 현재 레시피에서 사용하는 도구 목록 추출
  const recipeTools = Array.from(
    new Set(
      currentRecipe.steps
        .map(step => step.tool_slug)
        .concat(currentRecipe.steps.flatMap(step => step.alt_tools || []))
    )
  );

  const handlePrev = () => {
    if (isDragging) return;  // 드래그 중에만 차단, 빠른 클릭 허용
    setCurrentIndex(prev => (prev - 1 + AI_RECIPES.length) % AI_RECIPES.length);
  };

  const handleNext = () => {
    if (isDragging) return;
    setCurrentIndex(prev => (prev + 1) % AI_RECIPES.length);
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
    setIsDragging(false);

    // Threshold: 50px 이상 드래그하면 다음/이전으로 이동
    if (hasDragged) {
      if (dragOffset < -50) {
        setIsAnimating(true);
        setCurrentIndex(prev => (prev + 1) % AI_RECIPES.length);
        setTimeout(() => setIsAnimating(false), 600);
      } else if (dragOffset > 50) {
        setIsAnimating(true);
        setCurrentIndex(prev => (prev - 1 + AI_RECIPES.length) % AI_RECIPES.length);
        setTimeout(() => setIsAnimating(false), 600);
      }
    }

    setDragOffset(0);

    // hasDragged 플래그를 약간 지연 후 리셋 (클릭 이벤트 차단 후)
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
          <h2 className="text-lg font-extrabold text-foreground">AI 레시피</h2>
        </div>
        <Link
          href="/recipes"
          className="text-xs font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-0.5"
        >
          전체 보기
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <p className="text-xs text-gray-400 mb-4 -mt-2">
        여러 AI를 조합해 원하는 결과물을 만드는 단계별 가이드
      </p>

      {/* 캐러셀 */}
      <div className="relative mb-6">
        {/* 이전 버튼 */}
        {AI_RECIPES.length > 1 && (
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
              transition: (isDragging || isAnimating) ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
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
        {AI_RECIPES.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110"
            aria-label="다음 레시피"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* 인디케이터 */}
        {AI_RECIPES.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {AI_RECIPES.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating || isDragging || index === currentIndex) return;
                  setIsAnimating(true);

                  const direction = index > currentIndex ? -1 : 1;
                  const containerWidth = containerRef.current?.offsetWidth || 600;
                  setDragOffset(direction * containerWidth);

                  // 약간의 딜레이 후 인덱스 변경
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setDragOffset(0);
                    setTimeout(() => setIsAnimating(false), 600);
                  }, 50);
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
