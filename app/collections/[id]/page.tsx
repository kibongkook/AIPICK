import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Heart, Calendar } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getCollectionById, getCollections } from '@/lib/supabase/queries';
import { cn, getAvatarColor } from '@/lib/utils';
import ServiceCard from '@/components/service/ServiceCard';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const collection = getCollectionById(id);
  if (!collection) return { title: '컬렉션을 찾을 수 없습니다' };
  return {
    title: `${collection.title} | ${SITE_NAME}`,
    description: collection.description || `${collection.title} - AI 서비스 컬렉션`,
  };
}

export function generateStaticParams() {
  return getCollections().map((c) => ({ id: c.id }));
}

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params;
  const collection = getCollectionById(id);
  if (!collection) notFound();

  const createdDate = new Date(collection.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 뒤로가기 */}
      <Link
        href="/collections"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        컬렉션 목록으로
      </Link>

      {/* 컬렉션 헤더 */}
      <div className="mb-8 rounded-xl border border-border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {collection.title}
        </h1>

        {collection.description && (
          <p className="mt-3 text-gray-500 leading-relaxed">
            {collection.description}
          </p>
        )}

        {/* 메타 정보 */}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {/* 작성자 */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white',
                getAvatarColor(collection.user_name)
              )}
            >
              {collection.user_name.charAt(0)}
            </div>
            <span className="font-medium text-foreground">
              {collection.user_name}
            </span>
          </div>

          <span className="text-gray-300">|</span>

          {/* 좋아요 */}
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-red-400" />
            <span>좋아요 {collection.like_count}개</span>
          </div>

          <span className="text-gray-300">|</span>

          {/* 작성일 */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{createdDate}</span>
          </div>
        </div>
      </div>

      {/* 포함 서비스 */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">
          포함된 서비스 ({collection.tools.length}개)
        </h2>

        {collection.tools.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {collection.tools.map((tool) => (
              <ServiceCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-xl border border-border bg-white">
            <p className="text-gray-400">이 컬렉션에 포함된 서비스가 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
