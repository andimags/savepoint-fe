"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { useBrowseGames, useGameSearch } from "@/hooks/use-games";
import { AddToLibrary } from "@/components/add-to-library";
import { GameCover } from "@/components/game-cover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function GamesSearchClient({ query }: { query: string }) {
    const router = useRouter();
    const [input, setInput] = useState(query);

    // With a query → search; without → show a popular browse set so the page is never empty.
    const search = useGameSearch(query);
    const browse = useBrowseGames(!query);
    const active = query ? search : browse;
    const games = active.data;
    const error = active.error;

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const q = input.trim();
        if (q) router.push(`/games?q=${encodeURIComponent(q)}`);
    }

    return (
        <div className="space-y-6">
            <form onSubmit={submit} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search the game database..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button type="submit">Search</Button>
            </form>

            <h2 className="text-sm font-medium text-muted-foreground">
                {query ? `Results for “${query}”` : "Popular right now"}
            </h2>

            {error ? (
                <p className="text-sm text-destructive">
                    {getErrorMessage(error, "Failed to load games")}
                </p>
            ) : !games ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[16/12] w-full" />
                    ))}
                </div>
            ) : games.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No games found for &ldquo;{query}&rdquo;.
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {games.map((game) => (
                        <div
                            key={game.id}
                            className="flex flex-col overflow-hidden rounded-xl border bg-card"
                        >
                            <Link
                                href={`/games/${game.id}`}
                                className="group relative block aspect-[16/9] bg-muted"
                            >
                                <GameCover
                                    url={game.coverUrl}
                                    loading="lazy"
                                    className="size-full transition-transform duration-300 group-hover:scale-105"
                                    iconClassName="size-8"
                                />
                            </Link>
                            <div className="flex flex-1 flex-col gap-2 p-3">
                                <Link
                                    href={`/games/${game.id}`}
                                    className="min-w-0"
                                >
                                    <p className="truncate text-sm font-medium hover:underline">
                                        {game.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {game.releaseDate?.slice(0, 4) ?? "-"}
                                        {game.genres.length > 0 &&
                                            ` · ${game.genres.slice(0, 2).join(", ")}`}
                                    </p>
                                </Link>
                                <AddToLibrary
                                    gameId={game.id}
                                    gameName={game.name}
                                    size="sm"
                                    variant="secondary"
                                    className="mt-auto w-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
