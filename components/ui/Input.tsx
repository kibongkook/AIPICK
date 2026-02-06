import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export default function Input({ icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors',
          icon && 'pl-10',
          className
        )}
        {...props}
      />
    </div>
  );
}
