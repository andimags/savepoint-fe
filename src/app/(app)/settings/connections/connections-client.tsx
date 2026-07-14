"use client";

import { useSession } from "next-auth/react";
import { PLATFORM_BRANDS } from "@/components/platform-logos";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tile } from "./connection-tile";
import { SteamCard } from "./steam-card";
import { PsnCard } from "./psn-card";

const ACTIVE_KEYS = new Set(["steam", "playstation"]);
const COMING_SOON = PLATFORM_BRANDS.filter((b) => !ACTIVE_KEYS.has(b.key));

export function ConnectionsClient() {
    const { status: sessionStatus } = useSession();

    if (sessionStatus === "loading") {
        return <Skeleton className="h-48 w-full" />;
    }

    return (
        <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3">
            <SteamCard />
            <PsnCard />

            {COMING_SOON.map((brand) => (
                <Tile
                    key={brand.key}
                    gradient={brand.gradient}
                    glyph={brand.glyph}
                    name={brand.name}
                    subtitle="Not yet available"
                    dimmed
                >
                    <Badge variant="outline">Coming soon</Badge>
                </Tile>
            ))}
        </div>
    );
}
