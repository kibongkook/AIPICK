import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <Skeleton className="mt-3 h-7 w-40 rounded-full" />
      <div className="mt-3 flex items-center gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}
