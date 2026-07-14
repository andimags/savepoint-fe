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
    // Only surface a connection when the user has named the platform on their
    // edit-profile page. An unset name means it stays hidden, even if the
    // account is synced.
    const namedConnections = connections.filter(
        (connection) => connection.username?.trim(),
    );
    if (namedConnections.length === 0) return null;

    return (
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            {namedConnections.map((connection) => (
                <ConnectionItem
                    key={connection.platform}
                    connection={connection}
                />
            ))}
        </div>
    );
}

function ConnectionItem({ connection }: { connection: ProfileConnection }) {
    const brand = PLATFORM_BRANDS.find(
        (b) => b.key === BRAND_KEY_BY_PLATFORM[connection.platform],
    );
    if (!brand) return null;

    const label = connection.username ?? brand.name;
    const href =
        connection.platform === "STEAM" && connection.steamId64
            ? steamProfileUrl(connection.steamId64)
            : null;

    const content = (
        <>
            <span
                className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white shadow-sm [&>svg]:size-4"
                style={{ backgroundImage: brand.gradient }}
            >
                {brand.glyph}
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {brand.name}
                </span>
                <span className="truncate text-sm font-medium group-hover:text-primary">
                    {label}
                </span>
            </span>
        </>
    );

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={`${brand.name} · ${label}`}
                className="group inline-flex max-w-[14rem] items-center gap-2.5 transition-colors"
            >
                {content}
            </a>
        );
    }

    return (
        <span
            className="group inline-flex max-w-[14rem] items-center gap-2.5"
            title={`${brand.name} · ${label}`}
        >
            {content}
        </span>
    );
}
