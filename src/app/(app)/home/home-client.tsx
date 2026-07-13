"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Gamepad2 } from "lucide-react";
import { BookMarked, ListPlus } from "lucide-react";
import {
    getActivityFeed,
    getPlayingFeed,
    getRecommendations,
    thumbnailUrl,
    STATUS_LABELS,
    type ActivityItem,
    type PlayingFeedItem,
    type Recommendation,
} from "@/lib/api-client";
import { GameCard } from "@/components/game-card";
import { ReviewCard } from "@/components/review-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const PAGE_SIZE = 10;

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
                    {list.description ? ` — ${list.description}` : ""}
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

export function HomeClient() {
    const { data: session } = useSession();
    const token = session?.accessToken;

    const [friendsFeed, setFriendsFeed] = useState<PlayingFeedItem[] | null>(
        null,
    );
    const [recs, setRecs] = useState<Recommendation[] | null>(null);

    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!token) return;
        getPlayingFeed(token)
            .then(setFriendsFeed)
            .catch(() => setFriendsFeed([]));
        getRecommendations(token)
            .then(setRecs)
            .catch(() => setRecs([]));
    }, [token]);

    const loadMore = useCallback(async () => {
        if (!token || loading || !hasMore) return;
        setLoading(true);
        try {
            const data = await getActivityFeed(token, page, PAGE_SIZE);
            setActivity((prev) => {
                const seen = new Set(prev.map(activityKey));
                const next = data.items.filter(
                    (i) => !seen.has(activityKey(i)),
                );
                return [...prev, ...next];
            });
            setHasMore(data.hasMore);
            setPage((p) => p + 1);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [token, page, loading, hasMore]);

    // Initial load
    useEffect(() => {
        if (token && !initialized) loadMore();
    }, [token, initialized, loadMore]);

    // Infinite scroll observer
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: "400px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    return (
        <div className="space-y-8">
            {/* Friends currently playing — slim strip */}
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
                                {item.game.coverUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={
                                            thumbnailUrl(item.game.coverUrl) ??
                                            item.game.coverUrl
                                        }
                                        alt=""
                                        className="h-9 w-14 rounded object-cover"
                                    />
                                ) : (
                                    <div className="flex h-9 w-14 items-center justify-center rounded bg-muted">
                                        <Gamepad2 className="size-4 text-muted-foreground" />
                                    </div>
                                )}
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

            {/* Recommendations — slim strip */}
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

            {/* Activity feed — infinite scroll */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Activity
                </h2>

                {!initialized ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                ) : activity.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        No activity yet. Log a game or write a review to get
                        things started.
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
                {hasMore && initialized && (
                    <div ref={sentinelRef} className="py-4">
                        {loading && <Skeleton className="h-24 w-full" />}
                    </div>
                )}
                {!hasMore && activity.length > 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                        You&apos;re all caught up.
                    </p>
                )}
            </section>
        </div>
    );
}
