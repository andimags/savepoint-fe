import { PLATFORM_BRANDS } from "@/components/platform-logos";
import type { ProfileConnection } from "@/lib/api-client";

const BRAND_KEY_BY_PLATFORM: Record<ProfileConnection["platform"], string> = {
    STEAM: "steam",
    PSN: "playstation",
};

// Steam profiles are publicly reachable by the 64-bit id; PSN has no equivalent
// public link, so those pills render as plain text.
function steamProfileUrl(steamId64: string): string {
    return `https://steamcommunity.com/profiles/${steamId64}`;
}

export function ProfileConnections({
    connections,
}: {
    connections: ProfileConnection[];
}) {
    // Only surface a badge when the user has named the platform on their
    // edit-profile page. An unset name means the badge stays hidden, even if the
    // account is synced.
    const namedConnections = connections.filter(
        (connection) => connection.username?.trim(),
    );
    if (namedConnections.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap items-center gap-2">
            {namedConnections.map((connection) => (
                <ConnectionPill
                    key={connection.platform}
                    connection={connection}
                />
            ))}
        </div>
    );
}

function ConnectionPill({ connection }: { connection: ProfileConnection }) {
    const brand = PLATFORM_BRANDS.find(
        (b) => b.key === BRAND_KEY_BY_PLATFORM[connection.platform],
    );
    if (!brand) return null;

    const label = connection.username ?? brand.name;
    const href =
        connection.platform === "STEAM" && connection.steamId64
            ? steamProfileUrl(connection.steamId64)
            : null;

    const className =
        "inline-flex max-w-[12rem] items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-medium";
    const content = (
        <>
            <span
                className="flex size-5 shrink-0 items-center justify-center rounded-md text-white [&>svg]:size-3"
                style={{ backgroundImage: brand.gradient }}
            >
                {brand.glyph}
            </span>
            <span className="truncate">{label}</span>
        </>
    );

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={`${brand.name} · ${label}`}
                className={`${className} transition-colors hover:border-primary/50`}
            >
                {content}
            </a>
        );
    }

    return (
        <span className={className} title={`${brand.name} · ${label}`}>
            {content}
        </span>
    );
}
