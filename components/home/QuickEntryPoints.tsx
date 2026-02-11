import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { PURPOSE_CATEGORIES } from '@/lib/constants';

export default function QuickEntryPoints() {
  // 상위 3개 목적만 표시
  const topPurposes = PURPOSE_CATEGORIES.slice(0, 3);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-foreground">목적별 인기 AI</h2>
        <Link
          href="/discover"
          className="text-xs font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-0.5"
        >
          전체 보기
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {topPurposes.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:shadow-md transition-all"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} shadow-sm`}>
              <DynamicIcon name={cat.icon} className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">{cat.name.split(' · ')[0]}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}
