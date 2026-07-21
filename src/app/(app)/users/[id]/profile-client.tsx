"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ListMusic } from "lucide-react";
import { Heart, Pencil, Star } from "lucide-react";
import { STATUS_LABELS, type GameStatus } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { STATUS_FILTERS } from "@/lib/options";
import { formatPlaytime } from "@/lib/utils";
import { useLibrary } from "@/hooks/use-library";
import { useUserLists } from "@/hooks/use-lists";
import {
    useFollowers,
    useFollowing,
    useProfile,
    useProfileStats,
    useToggleFollow,
    useUserReviews,
} from "@/hooks/use-social";
import { GameCover } from "@/components/game-cover";
import { Pager } from "@/components/pager";
import { ReviewCard } from "@/components/review-card";
import { ProfileConnections } from "./profile-connections";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimpleUser {
    id: string;
    username: string;
}

export function ProfileClient({ userId }: { userId: string }) {
    const [activeTab, setActiveTab] = useState("games");
    const [gameStatus, setGameStatus] = useState("ALL");
    const [gamePage, setGamePage] = useState(1);

    const { data: profile } = useProfile(userId);
    const { data: stats } = useProfileStats(userId);
    const { data: reviews } = useUserReviews(userId);
    const { data: lists } = useUserLists(userId);
    const { data: followers } = useFollowers(userId);
    const { data: following } = useFollowing(userId);
    const { data: games } = useLibrary({
        userId,
        page: gamePage,
        limit: 24,
        status: gameStatus === "ALL" ? undefined : (gameStatus as GameStatus),
    });
    const toggleFollow = useToggleFollow(userId);

    if (!profile) return <Skeleton className="h-64 w-full" />;

    function handleToggleFollow() {
        if (!profile) return;
        toggleFollow.mutate(profile.isFollowing, {
            onError: (error) =>
                toast.error(getErrorMessage(error, "Failed to update follow.")),
        });
    }

    const title = profile.displayName || profile.username;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Avatar className="size-28">
                    {profile.avatarUrl && (
                        <AvatarImage src={profile.avatarUrl} alt="" />
                    )}
                    <AvatarFallback className="bg-primary/15 text-3xl text-primary">
                        {title.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    {profile.displayName && (
                        <p className="text-sm text-muted-foreground">
                            @{profile.username}
                        </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                        <button
                            type="button"
                            onClick={() => setActiveTab("games")}
                            className="rounded-sm font-medium text-foreground hover:underline focus-visible:outline-1 focus-visible:outline-ring"
                        >
                            {profile.gameCount} games
                        </button>{" "}
                        ·{" "}
                        <button
                            type="button"
                            onClick={() => setActiveTab("followers")}
                            className="rounded-sm font-medium text-foreground hover:underline focus-visible:outline-1 focus-visible:outline-ring"
                        >
                            {profile.followerCount} followers
                        </button>{" "}
                        ·{" "}
                        <button
                            type="button"
                            onClick={() => setActiveTab("following")}
                            className="rounded-sm font-medium text-foreground hover:underline focus-visible:outline-1 focus-visible:outline-ring"
                        >
                            {profile.followingCount} following
                        </button>
                    </p>
                    <ProfileConnections connections={profile.connections} />
                </div>
                {profile.isSelf ? (
                    <Button asChild variant="outline">
                        <Link href="/settings/profile">
                            <Pencil data-icon="inline-start" /> Edit profile
                        </Link>
                    </Button>
                ) : (
                    <Button
                        variant={profile.isFollowing ? "outline" : "default"}
                        onClick={handleToggleFollow}
                        disabled={toggleFollow.isPending}
                    >
                        {profile.isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                )}
            </div>

            {/* Spotlight: favorite game, genres, franchise, favorite games.
                Shown only when the user has curated favorites, so auto-derived
                fallbacks never surface a section the user never set up. */}
            {stats &&
                stats.hasFavorites &&
                (stats.favoriteGame ||
                    stats.favoriteGenres.length > 0 ||
                    (stats.curated && stats.favoriteGames.length > 0) ||
                    stats.favoriteFranchise) && (
                    <div className="grid gap-4 md:grid-cols-3">
                        {stats.favoriteGame && (
                            <Card className="overflow-hidden md:col-span-1">
                                <Link
                                    href={`/games/${stats.favoriteGame.id}`}
                                    className="group block"
                                >
                                    <div className="relative aspect-[16/9] bg-muted">
                                        {stats.favoriteGame.coverUrl && (
                                            <GameCover
                                                url={stats.favoriteGame.coverUrl}
                                                loading="lazy"
                                                className="size-full transition-transform duration-300 group-hover:scale-105"
                                            />
                                        )}
                                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-brand-foreground">
                                            <Heart className="size-3 fill-current" />{" "}
                                            Favorite game
                                        </span>
                                    </div>
                                    <div className="p-3">
                                        <p className="truncate text-sm font-medium">
                                            {stats.favoriteGame.name}
                                        </p>
                                    </div>
                                </Link>
                            </Card>
                        )}

                        {(stats.favoriteFranchise ||
                            stats.favoriteGenres.length > 0 ||
                            (stats.curated && stats.favoriteGames.length > 0)) && (
                            <Card
                                className={
                                    stats.favoriteGame
                                        ? "md:col-span-2"
                                        : "md:col-span-3"
                                }
                            >
                                <CardContent className="space-y-4 pt-4">
                                    {stats.favoriteFranchise && (
                                        <div>
                                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Favorite franchise
                                            </p>
                                            <Badge className="border-transparent bg-brand/15 text-brand">
                                                {stats.favoriteFranchise}
                                            </Badge>
                                        </div>
                                    )}
                                    {stats.favoriteGenres.length > 0 && (
                                        <div>
                                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Favorite genres
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {stats.favoriteGenres.map(
                                                    (genre) => (
                                                        <Badge
                                                            key={genre}
                                                            className="border-transparent bg-primary/15 text-primary"
                                                        >
                                                            {genre}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {(stats.curated && stats.favoriteGames.length > 0) && (
                                        <div>
                                            <p className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                <Star className="size-3.5" />{" "}
                                                Favorite games
                                            </p>
                                            <div className="grid grid-cols-5 gap-2">
                                                {stats.favoriteGames.map(
                                                    (g) => (
                                                        <Link
                                                            key={g.id}
                                                            href={`/games/${g.id}`}
                                                            className="group space-y-1"
                                                        >
                                                            <div className="aspect-[16/9] overflow-hidden rounded-md bg-muted">
                                                                {g.coverUrl && (
                                                                    <GameCover
                                                                        url={
                                                                            g.coverUrl
                                                                        }
                                                                        alt={
                                                                            g.name
                                                                        }
                                                                        loading="lazy"
                                                                        className="size-full transition-transform duration-300 group-hover:scale-105"
                                                                    />
                                                                )}
                                                            </div>
                                                            <p
                                                                className="truncate text-xs font-medium"
                                                                title={g.name}
                                                            >
                                                                {g.name}
                                                            </p>
                                                        </Link>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="games">
                        Games ({profile.gameCount})
                    </TabsTrigger>
                    <TabsTrigger value="lists">
                        Lists ({lists?.length ?? 0})
                    </TabsTrigger>
                    <TabsTrigger value="reviews">
                        Reviews ({reviews?.total ?? 0})
                    </TabsTrigger>
                    <TabsTrigger value="diary">Diary</TabsTrigger>
                    <TabsTrigger value="followers">
                        Followers ({profile.followerCount})
                    </TabsTrigger>
                    <TabsTrigger value="following">
                        Following ({profile.followingCount})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="games" className="space-y-4 pt-4">
                    <Tabs
                        value={gameStatus}
                        onValueChange={(value) => {
                            setGameStatus(value);
                            setGamePage(1);
                        }}
                    >
                        <TabsList>
                            {STATUS_FILTERS.map((filter) => (
                                <TabsTrigger
                                    key={filter.value}
                                    value={filter.value}
                                >
                                    {filter.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    {!games ? (
                        <div className="grid grid-cols-1 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : games.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {gameStatus === "ALL"
                                ? "No games in library yet."
                                : "No games with this status."}
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {games.items.map((ug) => (
                                <div
                                    key={ug.id}
                                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                                >
                                    <Link
                                        href={`/games/${ug.gameId}`}
                                        className="shrink-0"
                                    >
                                        <GameCover
                                            url={ug.game.coverUrl}
                                            loading="lazy"
                                            className="h-14 w-24 rounded-md"
                                        />
                                    </Link>
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/games/${ug.gameId}`}
                                            className="block truncate text-sm font-medium hover:underline"
                                        >
                                            {ug.game.name}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            {formatPlaytime(ug.playtimeMinutes)}
                                        </p>
                                    </div>
                                    {ug.status && (
                                        <Badge
                                            variant="secondary"
                                            className="shrink-0 text-xs"
                                        >
                                            {STATUS_LABELS[ug.status]}
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {games && (
                        <Pager
                            page={gamePage}
                            totalPages={games.totalPages}
                            onPageChange={setGamePage}
                        />
                    )}
                </TabsContent>

                <TabsContent value="lists" className="pt-4">
                    {!lists ? (
                        <Skeleton className="h-24 w-full" />
                    ) : lists.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No lists yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {lists.map((list) => (
                                <Link key={list.id} href={`/lists/${list.id}`}>
                                    <Card className="h-full transition-colors hover:border-primary/50">
                                        <CardContent className="flex items-start gap-3 pt-4">
                                            <ListMusic className="mt-0.5 size-5 shrink-0 text-primary" />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {list.title}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {list.itemCount}{" "}
                                                    {list.itemCount === 1
                                                        ? "game"
                                                        : "games"}
                                                    {list.description
                                                        ? ` · ${list.description}`
                                                        : ""}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4 pt-4">
                    {!reviews || reviews.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No reviews yet.
                        </p>
                    ) : (
                        reviews.items.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                showGame
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="diary" className="space-y-2 pt-4">
                    {!stats || stats.recentDiary.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No diary entries yet.
                        </p>
                    ) : (
                        stats.recentDiary.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex items-center gap-3 rounded-lg border bg-card p-3"
                            >
                                <span className="w-16 shrink-0 text-xs text-muted-foreground">
                                    {entry.playedOn}
                                </span>
                                <Link
                                    href={`/games/${entry.game.id}`}
                                    className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                                >
                                    {entry.game.name}
                                </Link>
                                {entry.status && (
                                    <Badge className="shrink-0 border-transparent bg-brand/15 text-brand">
                                        {STATUS_LABELS[entry.status]}
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className="hidden shrink-0 sm:inline-flex"
                                >
                                    {entry.platform}
                                </Badge>
                            </div>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="followers" className="space-y-2 pt-4">
                    <UserList
                        users={followers}
                        emptyLabel="No followers yet."
                    />
                </TabsContent>
                <TabsContent value="following" className="space-y-2 pt-4">
                    <UserList
                        users={following}
                        emptyLabel="Not following anyone yet."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function UserList({
    users,
    emptyLabel,
}: {
    users: SimpleUser[] | undefined;
    emptyLabel: string;
}) {
    if (!users) return <Skeleton className="h-16 w-full" />;
    if (users.length === 0)
        return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
    return (
        <>
            {users.map((u) => (
                <Link
                    key={u.id}
                    href={`/users/${u.id}`}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:border-primary/40"
                >
                    <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/15 text-sm text-primary">
                            {u.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{u.username}</span>
                </Link>
            ))}
        </>
    );
}
