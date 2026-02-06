import Link from 'next/link';
import type { Metadata } from 'next';
import { Layers, Heart, Wrench } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getCollections } from '@/lib/supabase/queries';
import { cn, getAvatarColor } from '@/lib/utils';
import CreateCollectionButton from '@/components/community/CreateCollectionButton';

export const metadata: Metadata = {
  title: `인기 컬렉션 | ${SITE_NAME}`,
  description: '사용자들이 직접 큐레이션한 AI 서비스 컬렉션을 둘러보세요.',
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Layers className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              인기 컬렉션
            </h1>
          </div>
          <p className="mt-2 text-gray-500">
            사용자들이 직접 큐레이션한 AI 서비스 컬렉션
          </p>
        </div>
        <CreateCollectionButton />
      </div>

      {/* 컬렉션 그리드 */}
      {collections.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <div className="group rounded-xl border border-border bg-white p-5 shadow-sm card-hover h-full">
                {/* 제목 & 설명 */}
                <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {collection.title}
                </h2>
                {collection.description && (
                  <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {collection.description}
                  </p>
                )}

                {/* 포함 도구 태그 (최대 3개) */}
                {collection.tools.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {collection.tools.slice(0, 3).map((tool) => (
                      <span
                        key={tool.id}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                      >
                        {tool.name}
                      </span>
                    ))}
                    {collection.tools.length > 3 && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                        +{collection.tools.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* 하단: 작성자 / 좋아요 / 도구 수 */}
                <div className="mt-4 flex items-center justify-between">
                  {/* 작성자 */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white',
                        getAvatarColor(collection.user_name)
                      )}
                    >
                      {collection.user_name.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-500 truncate">
                      {collection.user_name}
                    </span>
                  </div>

                  {/* 좋아요 & 도구 수 */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Heart className="h-3.5 w-3.5" />
                      {collection.like_count}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Wrench className="h-3.5 w-3.5" />
                      {collection.tools.length}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <Layers className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-500">
            등록된 컬렉션이 없습니다
          </p>
          <p className="mt-1 text-sm text-gray-400">
            아직 공개된 컬렉션이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
