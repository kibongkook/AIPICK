'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen, Target, TrendingUp, MessageCircle, Newspaper, GitCompare,
  ChevronDown, ChevronRight, Home, Menu, X,
  HelpCircle, Lightbulb, Star, MessageSquare, Bookmark, FolderOpen, Flame
} from 'lucide-react';
import { SIDEBAR_MENU_SECTIONS, SIDEBAR_USER_MENU, SITE_NAME } from '@/lib/constants';
import { useAuth } from '@/lib/auth/AuthContext';

const ICON_MAP = {
  BookOpen,
  Target,
  TrendingUp,
  MessageCircle,
  Newspaper,
  GitCompare,
  Home,
  HelpCircle,
  Lightbulb,
  Star,
  MessageSquare,
  Bookmark,
  FolderOpen,
  Flame,
} as const;

interface MainSidebarProps {
  className?: string;
}

export default function MainSidebar({ className = '' }: MainSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['AI 레시피', 'AI 찾기', '커뮤니티'])
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const SidebarContent = () => (
    <>
      {/* 로고 */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
            {SITE_NAME}
          </div>
        </Link>
      </div>

      {/* 홈 버튼 */}
      <div className="p-2">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === '/'
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="text-sm">홈</span>
        </Link>
      </div>

      <div className="h-px bg-border my-2" />

      {/* 메뉴 섹션들 */}
      <nav className="flex-1 overflow-y-auto p-2">
        {SIDEBAR_MENU_SECTIONS.map((section) => {
          const IconComponent = ICON_MAP[section.icon as keyof typeof ICON_MAP];
          const isExpanded = expandedSections.has(section.title);
          const hasItems = 'items' in section && (section as any).items && (section as any).items.length > 0;

          // 단일 링크 섹션
          if ('href' in section && section.href) {
            const sectionColor = 'color' in section ? section.color : '';
            return (
              <Link
                key={section.title}
                href={section.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 ${
                  isActive(section.href)
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {IconComponent && <IconComponent className={`h-4 w-4 ${sectionColor}`} />}
                <span className="text-sm font-medium">{section.title}</span>
              </Link>
            );
          }

          // 확장 가능한 섹션 (현재 모든 항목이 단일 링크이므로 도달하지 않음)
          const sectionAny = section as any;
          return (
            <div key={sectionAny.title} className="mb-1">
              <button
                onClick={() => toggleSection(sectionAny.title)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span className="text-sm font-medium">{sectionAny.title}</span>
                </div>
                {hasItems && (
                  <div>
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </div>
                )}
              </button>

              {hasItems && isExpanded && (
                <div className="mt-1 ml-6 space-y-1">
                  {sectionAny.items.map((item: any) => {
                    const ItemIcon = item.icon && ICON_MAP[item.icon as keyof typeof ICON_MAP];

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {ItemIcon && <ItemIcon className="h-3 w-3" />}
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-gray-100 text-gray-600'}`}>
                            {item.badge}
                          </span>
                        )}

                        {item.count !== undefined && (
                          <span className="text-[10px] text-gray-400">
                            {item.count}개
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 사용자 메뉴 */}
      {user && (
        <>
          <div className="h-px bg-border my-2" />
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              내 활동
            </div>
            <div className="space-y-1">
              {SIDEBAR_USER_MENU.map((item) => {
                const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP];

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {IconComponent && <IconComponent className="h-3 w-3" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 로그인 버튼 */}
      {!user && (
        <div className="p-4 border-t border-border">
          <Link
            href="/auth/login"
            className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            로그인
          </Link>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-border"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* 모바일 오버레이 */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-border z-40
          flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 ease-in-out
          w-64
          ${className}
        `}
      >
        <SidebarContent />
      </aside>

      {/* 데스크탑 스페이서 */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}
