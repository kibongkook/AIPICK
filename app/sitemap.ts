import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getTools, getCategories, getJobCategories, getEduLevels, getNews, getGuides, getCollections } from '@/lib/supabase/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/rankings`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/education`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/discover`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  // 서비스 상세 페이지
  const toolPages: MetadataRoute.Sitemap = (await getTools()).map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(tool.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 카테고리 페이지
  const categoryPages: MetadataRoute.Sitemap = (await getCategories()).map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 직군별 페이지
  const jobPages: MetadataRoute.Sitemap = (await getJobCategories()).map((job) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // 학년별 페이지
  const eduPages: MetadataRoute.Sitemap = (await getEduLevels()).map((edu) => ({
    url: `${baseUrl}/education/${edu.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // 가이드 페이지
  const guidePages: MetadataRoute.Sitemap = (await getGuides()).map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 컬렉션 페이지
  const collectionPages: MetadataRoute.Sitemap = (await getCollections()).map((col) => ({
    url: `${baseUrl}/collections/${col.id}`,
    lastModified: new Date(col.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...toolPages,
    ...categoryPages,
    ...jobPages,
    ...eduPages,
    ...guidePages,
    ...collectionPages,
  ];
}
