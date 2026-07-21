"use client";

import { useState } from "react";
import { Download, Gamepad2, Clock, PenLine, Star } from "lucide-react";
import { wrappedTagline } from "@/lib/api-client";
import { useWrapped } from "@/hooks/use-stats";
import { useCurrentUsername } from "@/hooks/use-token";
import { GameCover } from "@/components/game-cover";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export function WrappedClient() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState<number | "all">("all");

    const { data: wrapped } = useWrapped(
        year,
        month === "all" ? undefined : month,
    );
    const username = useCurrentUsername();

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const periodLabel =
        month === "all" ? String(year) : `${MONTHS[month - 1]} ${year}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={String(year)}
                    onValueChange={(v) => setYear(Number(v))}
                >
                    <SelectTrigger className="w-28">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={String(month)}
                    onValueChange={(v) =>
                        setMonth(v === "all" ? "all" : Number(v))
                    }
                >
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Whole year</SelectItem>
                        {MONTHS.map((m, i) => (
                            <SelectItem key={m} value={String(i + 1)}>
                                {m}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button asChild variant="outline" size="sm" className="ml-auto">
                    <a
                        href={`/api/wrapped-image?year=${year}${month !== "all" ? `&month=${month}` : ""}`}
                        download={`savepoint-wrapped-${year}${month !== "all" ? `-${month}` : ""}.png`}
                    >
                        <Download data-icon="inline-start" /> Download story
                        image
                    </a>
                </Button>
            </div>

            {!wrapped ? (
                <Skeleton className="mx-auto h-[640px] w-full max-w-sm rounded-3xl" />
            ) : (
                <Card className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border-primary/10 p-0 shadow-xl">
                    <CardContent className="relative overflow-hidden bg-app-glow px-7 py-9">
                        {/* Decorative gradient orbs give the story card its poster-like depth. */}
                        <div className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-primary/25 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-20 -right-12 size-48 rounded-full bg-brand/20 blur-3xl" />

                        <div className="relative space-y-8">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <LogoMark className="size-10" />
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                                    SavePoint Wrapped
                                </p>
                                <p className="text-4xl font-bold tracking-tight text-gradient-brand">
                                    {periodLabel}
                                </p>
                                {username && (
                                    <p className="text-sm text-muted-foreground">
                                        @{username}
                                    </p>
                                )}
                                <span className="mt-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                    {wrapped.source === "all-time"
                                        ? "All-time highlights"
                                        : wrappedTagline(
                                              wrapped.topGenres[0]?.genre,
                                              wrapped.totalGames,
                                          )}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    {
                                        icon: Gamepad2,
                                        value: wrapped.totalGames,
                                        label: "games played",
                                    },
                                    {
                                        icon: Clock,
                                        value: Math.round(
                                            wrapped.totalMinutes / 60,
                                        ),
                                        label: "hours gaming",
                                    },
                                    {
                                        icon: PenLine,
                                        value: wrapped.reviewCount,
                                        label: "reviews written",
                                    },
                                    {
                                        icon: Star,
                                        value: wrapped.ratingCount,
                                        label: "games rated",
                                    },
                                ].map(({ icon: Icon, value, label }) => (
                                    <div
                                        key={label}
                                        className="flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card/60 py-4"
                                    >
                                        <Icon className="size-4 text-brand" />
                                        <p className="text-3xl font-bold text-gradient-brand">
                                            {value}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {wrapped.topGenres.length > 0 && (
                                <div className="space-y-2 text-center">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                        Top genres
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-1.5">
                                        {wrapped.topGenres
                                            .slice(0, 5)
                                            .map((g) => (
                                                <span
                                                    key={g.genre}
                                                    className="rounded-full bg-gradient-to-r from-primary/20 to-brand/20 px-3 py-1 text-xs font-medium text-primary"
                                                >
                                                    {g.genre}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {wrapped.topGames.length > 0 && (
                                <div className="space-y-2.5">
                                    <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                        Top games
                                    </p>
                                    {wrapped.topGames.map((game, index) => (
                                        <div
                                            key={game.id}
                                            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-2"
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand text-sm font-bold text-primary-foreground">
                                                {index + 1}
                                            </span>
                                            <GameCover
                                                url={game.coverUrl}
                                                className="h-11 w-16 shrink-0 rounded-lg"
                                                iconClassName="size-4"
                                            />
                                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                                {game.name}
                                            </span>
                                            <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                                                {Math.round(
                                                    game.playtimeMinutes / 60,
                                                )}
                                                h
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {wrapped.totalGames === 0 && (
                                <p className="text-center text-sm text-muted-foreground">
                                    No activity logged for this period yet.
                                </p>
                            )}

                            <p className="text-center text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground/70">
                                savepoint
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
