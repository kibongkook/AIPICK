import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizeMap = {
    sm: 'h-7',
    md: 'h-8',
    lg: 'h-10',
  };

  const textSizeMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeMap[size], 'w-auto')}
      >
        <defs>
          <linearGradient id="logoGrad1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="logoGrad2" x1="20" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06D6A0" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#logoGrad1)" />
        <path
          d="M12 28L17.5 12H22.5L28 28H24L22.8 24H17.2L16 28H12ZM18.2 21H21.8L20 14.5L18.2 21Z"
          fill="white"
        />
        <circle cx="32" cy="12" r="4" fill="url(#logoGrad2)" />
      </svg>
      {showText && (
        <span className={cn(textSizeMap[size], 'font-extrabold tracking-tight')}>
          <span className="text-primary">AI</span>
          <span className="text-foreground">PICK</span>
        </span>
      )}
    </div>
  );
}
