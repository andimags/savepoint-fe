/**
 * Recognizable, non-trademarked SVG brand marks for platform tiles and the landing page.
 * Drawn as simple icon-style glyphs; each renders white on its brand-colored tile.
 */

export interface PlatformBrand {
    key: string;
    name: string;
    color: string;
    glyph: React.ReactNode;
}

const box = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
};

export const PLATFORM_BRANDS: PlatformBrand[] = [
    {
        key: "steam",
        name: "Steam",
        color: "#1b2838",
        glyph: (
            <svg {...box} fill="currentColor">
                <path d="M12 2a10 10 0 0 0-9.9 8.6l5.3 2.2a2.8 2.8 0 0 1 1.7-.5l2.4-3.5v-.05a3.75 3.75 0 1 1 3.75 3.75h-.08l-3.44 2.46a2.8 2.8 0 0 1-5.56.4l-3.8-1.57A10 10 0 1 0 12 2z" />
                <circle cx="15.2" cy="9.05" r="2.15" fill="#1b2838" />
                <path
                    d="M6.9 17.6a2.15 2.15 0 0 0 2.72-1.15l-.9-.37a1.6 1.6 0 0 1-2.07.9L4 15.9a2.15 2.15 0 0 0 2.9 1.7z"
                    opacity="0"
                />
            </svg>
        ),
    },
    {
        key: "playstation",
        name: "PlayStation",
        color: "#0070d1",
        glyph: (
            <svg {...box} fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="6.5" cy="6.5" r="2.2" />
                <path d="M12 4.3 14.2 8h-4.4z" />
                <path d="M4.3 15.5h4.4v4.4H4.3z" />
                <path d="M15 15.5l3 3-3 3-3-3z" transform="translate(0 -1)" />
            </svg>
        ),
    },
    {
        key: "xbox",
        name: "Xbox",
        color: "#107c10",
        glyph: (
            <svg {...box} fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="12" r="9.2" />
                <path d="M6 20c2.2-4.4 4-6.6 6-8.7 2 2.1 3.8 4.3 6 8.7M6.2 4.8C8.8 6 10.4 7.6 12 9.2c1.6-1.6 3.2-3.2 5.8-4.4" />
            </svg>
        ),
    },
    {
        key: "gog",
        name: "GOG",
        color: "#7c2a8f",
        glyph: (
            <svg {...box}>
                <text
                    x="12"
                    y="15.5"
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="800"
                    fill="currentColor"
                    fontFamily="sans-serif"
                    letterSpacing="-0.5"
                >
                    GOG
                </text>
            </svg>
        ),
    },
    {
        key: "epic",
        name: "Epic Games",
        color: "#2f2f37",
        glyph: (
            <svg {...box} fill="currentColor">
                <path d="M6 3h12a1.5 1.5 0 0 1 1.5 1.5v10.2c0 .6-.3 1.1-.8 1.4L12 21l-6.7-4.9a1.7 1.7 0 0 1-.8-1.4V4.5A1.5 1.5 0 0 1 6 3z" />
                <path
                    d="M9.5 7h5v1.8h-3.1v1.4h2.7V12h-2.7v1.5h3.2V15H9.5z"
                    fill="#2f2f37"
                />
            </svg>
        ),
    },
    {
        key: "nintendo",
        name: "Nintendo Switch",
        color: "#e60012",
        glyph: (
            <svg {...box} fill="currentColor">
                <rect x="4" y="3.5" width="7.2" height="17" rx="3.4" />
                <circle cx="7.6" cy="8" r="1.5" fill="#e60012" />
                <rect
                    x="12.8"
                    y="3.5"
                    width="7.2"
                    height="17"
                    rx="3.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <circle cx="16.4" cy="16" r="1.3" />
            </svg>
        ),
    },
];
