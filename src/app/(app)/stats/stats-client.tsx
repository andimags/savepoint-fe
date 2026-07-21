"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { getStatsOverview, type StatsOverview } from "@/lib/api-client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

function formatHours(minutes: number): string {
    return `${Math.round(minutes / 60)}h`;
}

export function StatsClient() {
    const { data: session } = useSession();
    const token = session?.accessToken;
    const [stats, setStats] = useState<StatsOverview | null>(null);
    const isMobile = useMediaQuery("(max-width: 639px)");

    useEffect(() => {
        if (!token) return;
        getStatsOverview(token)
            .then(setStats)
            .catch(() => {});
    }, [token]);

    if (!stats) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const genreChartData = stats.genres.map((g) => ({
        genre: g.genre,
        hours: Math.round(g.minutes / 60),
        count: g.count,
    }));

    const platformChartData = stats.platforms.map((p, i) => ({
        platform: p.platform,
        count: p.count,
        fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

    const genreConfig: ChartConfig = {
        hours: { label: "Hours", color: "var(--chart-1)" },
    };
    const platformConfig: ChartConfig = Object.fromEntries(
        stats.platforms.map((p, i) => [
            p.platform,
            { label: p.platform, color: CHART_COLORS[i % CHART_COLORS.length] },
        ]),
    );

    return (
        <div className="space-y-6">
            {/* Overview cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Games" value={String(stats.totalGames)} />
                <StatCard
                    label="Hours played"
                    value={String(Math.round(stats.totalPlaytimeMinutes / 60))}
                />
                <StatCard
                    label="Completion rate"
                    value={
                        stats.completionRate != null
                            ? `${Math.round(stats.completionRate * 100)}%`
                            : "—"
                    }
                />
                <StatCard
                    label="Finished"
                    value={String(stats.statusCounts.finished)}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Genre chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Most-played genres
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {genreChartData.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No genre data yet — game details fill in as your
                                library syncs with RAWG.
                            </p>
                        ) : (
                            <ChartContainer
                                config={genreConfig}
                                className="h-80 w-full"
                            >
                                <BarChart
                                    data={genreChartData}
                                    layout="vertical"
                                    margin={{ left: 12, right: 16 }}
                                    barCategoryGap={6}
                                >
                                    <XAxis
                                        type="number"
                                        tickFormatter={(v: number) => `${v}h`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="genre"
                                        width={isMobile ? 80 : 130}
                                        interval={0}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="hours"
                                        fill="var(--chart-1)"
                                        radius={4}
                                        minPointSize={2}
                                    />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Platform chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Platform breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {platformChartData.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No games yet.
                            </p>
                        ) : (
                            <ChartContainer
                                config={platformConfig}
                                className="h-72 w-full"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent nameKey="platform" />
                                        }
                                    />
                                    <Pie
                                        data={platformChartData}
                                        dataKey="count"
                                        nameKey="platform"
                                        innerRadius={60}
                                        strokeWidth={2}
                                    >
                                        {platformChartData.map((entry) => (
                                            <Cell
                                                key={entry.platform}
                                                fill={entry.fill}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Status breakdown */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="Playing"
                    value={String(stats.statusCounts.playing)}
                />
                <StatCard
                    label="Backlog"
                    value={String(stats.statusCounts.backlog)}
                />
                <StatCard
                    label="Dropped"
                    value={String(stats.statusCounts.dropped)}
                />
                <StatCard
                    label="Avg hours / game"
                    value={
                        stats.totalGames > 0
                            ? formatHours(
                                  stats.totalPlaytimeMinutes / stats.totalGames,
                              )
                            : "—"
                    }
                />
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <Card>
            <CardContent className="pt-4">
                <p className="text-3xl font-semibold tracking-tight">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
        </Card>
    );
}
