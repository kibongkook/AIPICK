import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className, size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeMap[size], 'w-auto')}
      >
        <defs>
          <linearGradient id="logoAOuterGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1565C0"/>
            <stop offset="40%" stopColor="#1976D2"/>
            <stop offset="100%" stopColor="#2196F3"/>
          </linearGradient>
          <linearGradient id="logoAShadowGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#0D47A1"/>
            <stop offset="100%" stopColor="#1565C0"/>
          </linearGradient>
          <linearGradient id="logoIBodyGrad" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#1E88E5"/>
            <stop offset="100%" stopColor="#00BCD4"/>
          </linearGradient>
          <radialGradient id="logoIDotGrad" cx="0.4" cy="0.35" r="0.6">
            <stop offset="0%" stopColor="#00E5FF"/>
            <stop offset="100%" stopColor="#00BCD4"/>
          </radialGradient>
          <linearGradient id="logoAInnerDepth" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#0D47A1" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#1565C0" stopOpacity="0.4"/>
          </linearGradient>
        </defs>

        {/* 'a' 3D 깊이 레이어 */}
        <path
          d="M68 155 C28 155,-2 122,-2 82 C-2 42,28 9,68 9 C108 9,120 30,125 42 L120 48 C115 36,104 18,68 18 C34 18,8 48,8 82 C8 116,34 148,68 148 C88 148,104 138,113 122 L113 155 Z"
          fill="url(#logoAShadowGrad)"
        />

        {/* 'a' 메인 외곽 링 */}
        <path
          d="M68 148 C32 148,10 118,10 82 C10 46,32 16,68 16 C104 16,120 36,126 50 L126 148 L116 148 L116 126 C106 142,90 148,68 148 Z M68 120 C90 120,106 102,106 82 C106 62,90 44,68 44 C46 44,32 62,32 82 C32 102,46 120,68 120 Z"
          fill="url(#logoAOuterGrad)"
        />

        {/* 'a' 내부 3D 깊이 곡선 */}
        <path
          d="M68 120 C46 120,32 102,32 82 C32 62,46 44,68 44 C72 44,76 45,80 47 C58 50,42 66,42 84 C42 104,54 118,68 120 Z"
          fill="url(#logoAInnerDepth)"
          opacity="0.5"
        />

        {/* 'a' 상단 하이라이트 */}
        <path
          d="M68 16 C50 16,34 24,22 38 C36 22,52 14,70 14 C106 14,122 36,128 50 L126 50 C120 36,104 16,68 16 Z"
          fill="#42A5F5"
          opacity="0.3"
        />

        {/* 'i' 바디 */}
        <rect x="140" y="52" width="28" height="96" rx="14" fill="url(#logoIBodyGrad)"/>

        {/* 'i' 점 */}
        <circle cx="154" cy="22" r="16" fill="url(#logoIDotGrad)"/>

        {/* 'i' 점 하이라이트 */}
        <circle cx="149" cy="17" r="6" fill="#B2EBF2" opacity="0.5"/>
      </svg>
      <span className="text-lg font-extrabold tracking-tight text-foreground">PICK</span>
    </div>
  );
}
