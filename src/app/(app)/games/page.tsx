import { Suspense } from "react";
import { GamesSearchClient } from "./games-search-client";
import { Skeleton } from "@/components/ui/skeleton";

export default async function GamesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Games</h1>
                <p className="text-sm text-muted-foreground">
                    Browse the game database and add titles to your library.
                </p>
            </div>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <GamesSearchClient query={q ?? ""} />
            </Suspense>
        </div>
    );
}
