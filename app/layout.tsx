import type { Metadata, Viewport } from 'next';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import { AuthProvider } from '@/lib/auth/AuthContext';
import MainSidebar from '@/components/layout/MainSidebar';
import TopBar from '@/components/layout/TopBar';
import Footer from '@/components/layout/Footer';
import BottomTabBar from '@/components/layout/BottomTabBar';
import { WebsiteJsonLd } from '@/components/seo/JsonLd';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#3B82F6',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - 나에게 맞는 AI를 찾아보세요`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['AI 추천', 'AI 서비스', '무료 AI', 'AI 큐레이션', 'AIPICK'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: `${SITE_NAME} - 나에게 맞는 AI를 찾아보세요`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - 나에게 맞는 AI를 찾아보세요`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased min-h-screen bg-gray-50">
        <WebsiteJsonLd />
        <AuthProvider>
          {/* Reddit 스타일 레이아웃: 사이드바 + 메인 영역 */}
          <div className="flex min-h-screen">
            {/* 왼쪽 사이드바 (고정) */}
            <MainSidebar />

            {/* 오른쪽 메인 영역 */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* 상단 바 (검색 + 탭) */}
              <TopBar />

              {/* 메인 콘텐츠 */}
              <main className="flex-1 pb-14 md:pb-0">
                {children}
              </main>

              {/* 푸터 */}
              <Footer />
            </div>
          </div>

          {/* 모바일 하단 탭바 */}
          <BottomTabBar />
        </AuthProvider>
      </body>
    </html>
  );
}
