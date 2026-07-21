"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { BookMarked, Library, ListPlus } from "lucide-react";
import { STATUS_LABELS, type ActivityItem } from "@/lib/api-client";
import {
    useActivityFeed,
    usePlayingFeed,
} from "@/hooks/use-social";
import { useRecommendations } from "@/hooks/use-stats";
import { GameCard } from "@/components/game-card";
import { GameCover } from "@/components/game-cover";
import { ReviewCard } from "@/components/review-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ACTIVITY_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
});

function formatActivityTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return ACTIVITY_TIME_FORMAT.format(date);
}

function activityKey(item: ActivityItem): string {
    if (item.type === "review") return `r-${item.review.id}`;
    if (item.type === "diary") return `d-${item.diary.id}`;
    if (item.type === "library") return `g-${item.library.id}`;
    return `l-${item.list.id}`;
}

function DiaryActivityCard({
    item,
}: {
    item: Extract<ActivityItem, { type: "diary" }>;
}) {
    const { diary } = item;
    const loggedAt = formatActivityTime(item.createdAt);
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <Avatar className="size-8">
                <AvatarFallback className="bg-brand/15 text-xs text-brand">
                    {diary.author.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-sm">
                <Link
                    href={`/users/${diary.author.id}`}
                    className="font-medium hover:underline"
                >
                    {diary.author.username}
                </Link>{" "}
                <span className="text-muted-foreground">
                    {diary.status
                        ? `marked as ${STATUS_LABELS[diary.status]}`
                        : "logged"}
                </span>{" "}
                <Link
                    href={`/games/${diary.game.id}`}
                    className="font-medium hover:underline"
                >
                    {diary.game.name}
                </Link>
                {diary.note && (
                    <p className="truncate text-xs text-muted-foreground">
                        {diary.note}
                    </p>
                )}
                {loggedAt && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {loggedAt}
                    </p>
                )}
            </div>
            <BookMarked className="size-4 shrink-0 text-brand" />
        </div>
    );
}

function ListActivityCard({
    item,
}: {
    item: Extract<ActivityItem, { type: "list" }>;
}) {
    const { list } = item;
    const createdAt = formatActivityTime(item.createdAt);
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <Avatar className="size-8">
                <AvatarFallback className="bg-primary/15 text-xs text-primary">
                    {list.author.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-sm">
                <Link
                    href={`/users/${list.author.id}`}
                    className="font-medium hover:underline"
                >
                    {list.author.username}
                </Link>{" "}
                <span className="text-muted-foreground">created a list</span>{" "}
                <Link
                    href={`/lists/${list.id}`}
                    className="font-medium hover:underline"
                >
                    {list.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                    {list.itemCount} {list.itemCount === 1 ? "game" : "games"}
                    {list.description ? ` · ${list.description}` : ""}
                </p>
                {createdAt && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {createdAt}
                    </p>
                )}
            </div>
            <ListPlus className="size-4 shrink-0 text-primary" />
        </div>
    );
}

function LibraryActivityCard({
    item,
}: {
    item: Extract<ActivityItem, { type: "library" }>;
}) {
    const { library } = item;
    const addedAt = formatActivityTime(item.createdAt);
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <Avatar className="size-8">
                <AvatarFallback className="bg-primary/15 text-xs text-primary">
                    {library.author.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <GameCover
                url={library.game.coverUrl}
                className="h-9 w-14 shrink-0 rounded"
                iconClassName="size-4"
            />
            <div className="min-w-0 flex-1 text-sm">
                <Link
                    href={`/users/${library.author.id}`}
                    className="font-medium hover:underline"
                >
                    {library.author.username}
                </Link>{" "}
                <span className="text-muted-foreground">
                    added to their library
                </span>{" "}
                <Link
                    href={`/games/${library.game.id}`}
                    className="font-medium hover:underline"
                >
                    {library.game.name}
                </Link>
                {addedAt && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {addedAt}
                    </p>
                )}
            </div>
            <Library className="size-4 shrink-0 text-primary" />
        </div>
    );
}

export function HomeClient() {
    const { data: friendsFeed } = usePlayingFeed();
    const { data: recs } = useRecommendations();
    const {
        data: activityData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending: activityPending,
    } = useActivityFeed();

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // Flatten paginated activity, dropping any items that repeat across page boundaries.
    const activity = useMemo(() => {
        const seen = new Set<string>();
        const items: ActivityItem[] = [];
        for (const page of activityData?.pages ?? []) {
            for (const item of page.items) {
                const key = activityKey(item);
                if (seen.has(key)) continue;
                seen.add(key);
                items.push(item);
            }
        }
        return items;
    }, [activityData]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            { rootMargin: "400px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    return (
        <div className="space-y-8">
            {/* Friends currently playing: slim strip */}
            {friendsFeed && friendsFeed.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Friends are playing
                    </h2>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {friendsFeed.map((item, i) => (
                            <Link
                                key={`${item.user.id}-${item.game.id}-${i}`}
                                href={`/games/${item.game.id}`}
                                className="flex w-44 shrink-0 items-center gap-2 rounded-lg border bg-card p-2"
                            >
                                <GameCover
                                    url={item.game.coverUrl}
                                    className="h-9 w-14 rounded"
                                    iconClassName="size-4"
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-medium">
                                        {item.game.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        @{item.user.username}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Recommendations: slim strip */}
            {recs && recs.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Recommended for you
                    </h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {recs.slice(0, 6).map((rec) => (
                            <GameCard
                                key={rec.id}
                                id={rec.id}
                                name={rec.name}
                                coverUrl={rec.coverUrl}
                                subtitle={rec.genres.slice(0, 2).join(", ")}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Activity feed: infinite scroll */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Activity
                </h2>

                {activityPending ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                ) : activity.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        No activity yet. Add a game, log an entry, or follow
                        people to fill your feed.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {activity.map((item) => {
                            if (item.type === "review") {
                                return (
                                    <ReviewCard
                                        key={`r-${item.review.id}`}
                                        review={item.review}
                                        showGame
                                    />
                                );
                            }
                            if (item.type === "diary") {
                                return (
                                    <DiaryActivityCard
                                        key={`d-${item.diary.id}`}
                                        item={item}
                                    />
                                );
                            }
                            if (item.type === "library") {
                                return (
                                    <LibraryActivityCard
                                        key={`g-${item.library.id}`}
                                        item={item}
                                    />
                                );
                            }
                            return (
                                <ListActivityCard
                                    key={`l-${item.list.id}`}
                                    item={item}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Sentinel + loading state */}
                {hasNextPage && !activityPending && (
                    <div ref={sentinelRef} className="py-4">
                        {isFetchingNextPage && (
                            <Skeleton className="h-24 w-full" />
                        )}
                    </div>
                )}
                {!hasNextPage && activity.length > 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                        You&apos;re all caught up.
                    </p>
                )}
            </section>
        </div>
    );
}
