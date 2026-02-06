import { cn } from '@/lib/utils';

type BadgeVariant = 'free' | 'freemium' | 'paid' | 'tag' | 'quota';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  free: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  freemium: 'bg-blue-100 text-blue-700 border-blue-200',
  paid: 'bg-gray-100 text-gray-600 border-gray-200',
  tag: 'bg-slate-100 text-slate-600 border-slate-200',
  quota: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
};

export default function Badge({ variant = 'tag', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
