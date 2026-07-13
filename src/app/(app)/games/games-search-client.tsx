"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Gamepad2, Search } from "lucide-react";
import {
    getBrowseGames,
    searchGames,
    thumbnailUrl,
    type Game,
} from "@/lib/api-client";
import { AddToLibrary } from "@/components/add-to-library";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function GamesSearchClient({ query }: { query: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const token = session?.accessToken;
    const [input, setInput] = useState(query);
    const [games, setGames] = useState<Game[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setInput(query);
    }, [query]);

    useEffect(() => {
        if (!token) return;
        setGames(null);
        setError(null);
        // With a query → search; without → show a popular browse set so the page is never empty.
        const load = query ? searchGames(token, query) : getBrowseGames(token);
        load.then(setGames).catch((e: unknown) =>
            setError(e instanceof Error ? e.message : "Failed to load games"),
        );
    }, [token, query]);

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
                <p className="text-sm text-destructive">{error}</p>
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
                                {game.coverUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={
                                            thumbnailUrl(game.coverUrl) ??
                                            game.coverUrl
                                        }
                                        alt=""
                                        loading="lazy"
                                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-muted-foreground">
                                        <Gamepad2 className="size-8" />
                                    </div>
                                )}
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
                                        {game.releaseDate?.slice(0, 4) ?? "—"}
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
