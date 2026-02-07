import Link from 'next/link';
import { SITE_NAME, CATEGORIES } from '@/lib/constants';
import Logo from '@/components/ui/Logo';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* 브랜드 */}
          <div>
            <Link href="/">
              <Logo size="md" />
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              당신과 같은 전문가들이<br />
              매일 확인하는 AI 큐레이션.
            </p>
          </div>

          {/* 카테고리 */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">카테고리</h3>
            <ul className="mt-3 space-y-2">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">서비스</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/discover" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  AI 찾기
                </Link>
              </li>
              <li>
                <Link href="/rankings" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  AI 랭킹
                </Link>
              </li>
              <li>
                <Link href="/trending" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  주간 트렌딩
                </Link>
              </li>
              <li>
                <Link href="/recommend" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  맞춤 AI 추천
                </Link>
              </li>
            </ul>
          </div>

          {/* 콘텐츠 */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">콘텐츠</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/news" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  AI 뉴스
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  활용 가이드
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  컬렉션
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-500">문의: contact@aipick.kr</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {CURRENT_YEAR} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
