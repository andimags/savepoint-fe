"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Heart, Search, X } from "lucide-react";
import { COMMON_GENRES, type Game, type GameRef } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { useGameSearch, useGamesByIds } from "@/hooks/use-games";
import { useMe, useUpdateProfile } from "@/hooks/use-me";
import { GameCover } from "@/components/game-cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FavoritesDraft {
    topGames: GameRef[];
    favoriteGameId: string | null;
    genres: string[];
    franchise: string;
}

/**
 * Loads the profile and its top games, then hands a fully-formed initial draft to the editor. The
 * editor is only mounted once data is ready, so it can seed useState from props with no syncing
 * effect. The "copy server state into editable local state" concern lives entirely in the mount.
 */
export function FavoritesEditor() {
    const { data: me } = useMe();
    const topGameQueries = useGamesByIds(me?.topGameIds ?? []);

    const topGamesLoaded = topGameQueries.every((q) => !q.isPending);
    if (!me || !topGamesLoaded) return <Skeleton className="h-96 w-full" />;

    const initial: FavoritesDraft = {
        genres: me.favoriteGenres,
        franchise: me.topFranchise ?? "",
        favoriteGameId: me.favoriteGameId,
        topGames: topGameQueries
            .map((q) => q.data)
            .filter((g): g is Game => Boolean(g))
            .map((g) => ({ id: g.id, name: g.name, coverUrl: g.coverUrl })),
    };

    return <FavoritesForm initial={initial} />;
}

function FavoritesForm({ initial }: { initial: FavoritesDraft }) {
    const updateProfile = useUpdateProfile();

    const [topGames, setTopGames] = useState<GameRef[]>(initial.topGames);
    const [favoriteGameId, setFavoriteGameId] = useState<string | null>(
        initial.favoriteGameId,
    );
    const [genres, setGenres] = useState<string[]>(initial.genres);
    const [franchise, setFranchise] = useState(initial.franchise);

    const [query, setQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const { data: results = [], isFetching: searching } =
        useGameSearch(searchTerm);

    function addGame(game: Game) {
        if (topGames.length >= 5 || topGames.some((g) => g.id === game.id))
            return;
        setTopGames((prev) => [
            ...prev,
            { id: game.id, name: game.name, coverUrl: game.coverUrl },
        ]);
    }

    function removeGame(id: string) {
        setTopGames((prev) => prev.filter((g) => g.id !== id));
        // The single favorite must be one of the picked games.
        setFavoriteGameId((current) => (current === id ? null : current));
    }

    function toggleFavorite(id: string) {
        setFavoriteGameId((current) => (current === id ? null : id));
    }

    function moveGame(index: number, dir: -1 | 1) {
        setTopGames((prev) => {
            const next = [...prev];
            const target = index + dir;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    }

    function toggleGenre(genre: string) {
        setGenres((prev) =>
            prev.includes(genre)
                ? prev.filter((g) => g !== genre)
                : prev.length >= 8
                  ? prev
                  : [...prev, genre],
        );
    }

    function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearchTerm(query.trim());
    }

    function save() {
        updateProfile.mutate(
            {
                favoriteGameId,
                topGameIds: topGames.map((g) => g.id),
                favoriteGenres: genres,
                topFranchise: franchise.trim() || null,
            },
            {
                onSuccess: () => toast.success("Favorites saved."),
                onError: (error) =>
                    toast.error(
                        getErrorMessage(error, "Failed to save favorites."),
                    ),
            },
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Your favorites</CardTitle>
                <CardDescription>
                    Curate what shows on your profile. These override the
                    auto-generated stats.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Favorite games */}
                <div className="space-y-3">
                    <Label>Favorite games (up to 5)</Label>
                    {topGames.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Tap the heart to highlight one game as your all-time
                            favorite.
                        </p>
                    )}
                    {topGames.length > 0 && (
                        <div className="space-y-2">
                            {topGames.map((game, index) => (
                                <div
                                    key={game.id}
                                    className="flex items-center gap-2 rounded-lg border bg-card p-2"
                                >
                                    <div className="flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() => moveGame(index, -1)}
                                            disabled={index === 0}
                                            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                            aria-label="Move up"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveGame(index, 1)}
                                            disabled={
                                                index === topGames.length - 1
                                            }
                                            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                            aria-label="Move down"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    <span className="w-5 text-center text-sm font-semibold text-primary">
                                        {index + 1}
                                    </span>
                                    <GameCover
                                        url={game.coverUrl}
                                        className="h-9 w-14 rounded"
                                        iconClassName="size-4"
                                    />
                                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                        {game.name}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => toggleFavorite(game.id)}
                                        aria-label={
                                            favoriteGameId === game.id
                                                ? `Remove ${game.name} as favorite game`
                                                : `Set ${game.name} as favorite game`
                                        }
                                        aria-pressed={favoriteGameId === game.id}
                                        className={cn(
                                            "text-muted-foreground hover:text-brand",
                                            favoriteGameId === game.id &&
                                                "text-brand",
                                        )}
                                    >
                                        <Heart
                                            className={cn(
                                                "size-4",
                                                favoriteGameId === game.id &&
                                                    "fill-current",
                                            )}
                                        />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => removeGame(game.id)}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {topGames.length < 5 && (
                        <>
                            <form
                                onSubmit={handleSearch}
                                className="flex gap-2"
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search a game to add..."
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                        className="pl-8"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    disabled={searching}
                                >
                                    {searching ? "..." : "Search"}
                                </Button>
                            </form>
                            {results.length > 0 && (
                                <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-1">
                                    {results.map((game) => (
                                        <button
                                            key={game.id}
                                            type="button"
                                            onClick={() => addGame(game)}
                                            disabled={topGames.some(
                                                (g) => g.id === game.id,
                                            )}
                                            className="flex w-full items-center gap-3 rounded-md p-1.5 text-left hover:bg-accent disabled:opacity-40"
                                        >
                                            <GameCover
                                                url={game.coverUrl}
                                                className="h-8 w-12 rounded"
                                                iconClassName="size-3.5"
                                            />
                                            <span className="truncate text-sm">
                                                {game.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Favorite genres */}
                <div className="space-y-2">
                    <Label>Favorite genres (up to 8)</Label>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_GENRES.map((genre) => {
                            const active = genres.includes(genre);
                            return (
                                <button
                                    key={genre}
                                    type="button"
                                    onClick={() => toggleGenre(genre)}
                                    className={cn(
                                        "rounded-full border px-3 py-1 text-sm transition-colors",
                                        active
                                            ? "border-transparent bg-primary text-primary-foreground"
                                            : "hover:bg-accent",
                                    )}
                                >
                                    {genre}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Favorite franchise */}
                <div className="space-y-2">
                    <Label htmlFor="franchise">Favorite franchise</Label>
                    <Input
                        id="franchise"
                        value={franchise}
                        onChange={(e) => setFranchise(e.target.value)}
                        placeholder="e.g. The Legend of Zelda"
                        maxLength={60}
                    />
                </div>

                <Button onClick={save} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Saving..." : "Save favorites"}
                </Button>
            </CardContent>
        </Card>
    );
}
