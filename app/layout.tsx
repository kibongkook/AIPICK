import type { Metadata } from 'next';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - 나에게 맞는 AI를 찾아보세요`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['AI 추천', 'AI 서비스', '무료 AI', 'AI 큐레이션', 'AIPICK'],
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
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
