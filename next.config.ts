import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 카테고리 통일: 삭제/병합된 slug 리다이렉트
      { source: '/category/voice', destination: '/category/music', permanent: true },
      { source: '/category/data-analysis', destination: '/category/data', permanent: true },
      { source: '/category/research', destination: '/category/data', permanent: true },
      { source: '/category/learning', destination: '/category/translation', permanent: true },
      { source: '/category/entertainment', destination: '/category/chat', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'icons.duckduckgo.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons',
      },
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
