'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, BookOpen } from 'lucide-react';
import RecipeCard from './RecipeCard';
import type { AIRecipe } from '@/types';

interface RelatedRecipeCarouselProps {
  recipes: AIRecipe[];
  categorySlug: string;
}

export default function RelatedRecipeCarousel({ recipes, categorySlug }: RelatedRecipeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (recipes.length === 0) return null;

  const currentRecipe = recipes[currentIndex];
  const prevIndex = (currentIndex - 1 + recipes.length) % recipes.length;
  const nextIndex = (currentIndex + 1) % recipes.length;
  const prevRecipe = recipes[prevIndex];
  const nextRecipe = recipes[nextIndex];

  const handlePrev = () => {
    if (isDragging || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => (prev - 1 + recipes.length) % recipes.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleNext = () => {
    if (isDragging || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => (prev + 1) % recipes.length);
    setTimeout(() => setIsAnimating(false), 600);
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
    if (Math.abs(offset) > 10) {
      setHasDragged(true);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (hasDragged) {
      if (dragOffset < -50) {
        setIsAnimating(true);
        setCurrentIndex(prev => (prev + 1) % recipes.length);
        setTimeout(() => setIsAnimating(false), 600);
      } else if (dragOffset > 50) {
        setIsAnimating(true);
        setCurrentIndex(prev => (prev - 1 + recipes.length) % recipes.length);
        setTimeout(() => setIsAnimating(false), 600);
      }
    }

    setDragOffset(0);
    setTimeout(() => setHasDragged(false), 100);
  };

  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleDragEnd();
  const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); handleDragStart(e.clientX); };
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging) return; e.preventDefault(); handleDragMove(e.clientX); };
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => { if (isDragging) handleDragEnd(); };

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-extrabold text-foreground">관련 레시피</h2>
        </div>
        <Link
          href={`/recipes?category=${categorySlug}`}
          className="text-xs font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-0.5"
        >
          더 보기
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 캐러셀 */}
      <div className="relative">
        {/* 이전 버튼 */}
        {recipes.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110"
            aria-label="이전 레시피"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* 캐러셀 컨테이너 */}
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
                if (hasDragged) { e.preventDefault(); e.stopPropagation(); }
              }}
              onClickCapture={(e) => {
                if (hasDragged) { e.preventDefault(); e.stopPropagation(); }
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
        {recipes.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110"
            aria-label="다음 레시피"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* 인디케이터 */}
        {recipes.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {recipes.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating || isDragging || index === currentIndex) return;
                  setIsAnimating(true);
                  const direction = index > currentIndex ? -1 : 1;
                  const containerWidth = containerRef.current?.offsetWidth || 600;
                  setDragOffset(direction * containerWidth);
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
    </div>
  );
}
