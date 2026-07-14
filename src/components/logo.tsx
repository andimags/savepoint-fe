import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("size-7", className)}
            aria-hidden
        >
            <defs>
                <linearGradient
                    id="sp-grad"
                    x1="5"
                    y1="3"
                    x2="27"
                    y2="29"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="oklch(0.74 0.18 292)" />
                    <stop offset="1" stopColor="oklch(0.62 0.17 258)" />
                </linearGradient>
                <linearGradient
                    id="sp-shine"
                    x1="6"
                    y1="4"
                    x2="16"
                    y2="18"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="white" stopOpacity="0.35" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Rounded gradient tile with a soft top highlight */}
            <rect
                x="3"
                y="3"
                width="26"
                height="26"
                rx="8"
                fill="url(#sp-grad)"
            />
            <rect
                x="3"
                y="3"
                width="26"
                height="26"
                rx="8"
                fill="url(#sp-shine)"
            />

            {/* Playful gamepad silhouette with grips that dip into the corners */}
            <path
                d="M10.8 12.6h10.4c2.7 0 4.8 2.4 4.4 5.1l-.6 4.3c-.32 2.2-3.1 3-4.5 1.3l-1.3-1.6c-.42-.5-1.03-.8-1.68-.8h-3.5c-.65 0-1.26.3-1.68.8l-1.3 1.6c-1.4 1.7-4.18.9-4.5-1.3l-.6-4.3C6 15 8.1 12.6 10.8 12.6z"
                fill="white"
            />
            {/* D-pad on the left */}
            <rect
                x="12.75"
                y="15.1"
                width="1.5"
                height="4.8"
                rx="0.55"
                fill="url(#sp-grad)"
            />
            <rect
                x="11.1"
                y="16.75"
                width="4.8"
                height="1.5"
                rx="0.55"
                fill="url(#sp-grad)"
            />
            {/* Two face buttons on the right */}
            <circle cx="19.35" cy="16.7" r="1.05" fill="url(#sp-grad)" />
            <circle cx="21.55" cy="18.5" r="1.05" fill="url(#sp-grad)" />
        </svg>
    );
}

export function Logo({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                "flex items-center gap-2 font-semibold tracking-tight",
                className,
            )}
        >
            <LogoMark />
            <span className="text-lg">
                Save<span className="text-gradient-brand">Point</span>
            </span>
        </span>
    );
}
