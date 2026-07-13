import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-7', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="sp-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.72 0.18 290)" />
          <stop offset="1" stopColor="oklch(0.64 0.17 262)" />
        </linearGradient>
      </defs>
      {/* Save-point diamond */}
      <rect
        x="8.2"
        y="8.2"
        width="15.6"
        height="15.6"
        rx="3"
        transform="rotate(45 16 16)"
        stroke="url(#sp-grad)"
        strokeWidth="2.4"
      />
      <circle cx="16" cy="16" r="3.2" fill="url(#sp-grad)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}>
      <LogoMark />
      <span className="text-lg">
        Save<span className="text-gradient-brand">Point</span>
      </span>
    </span>
  );
}
