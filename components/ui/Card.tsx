import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-white p-5 shadow-sm',
        hover && 'card-hover cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
