"use client";

import { useQuery } from "@tanstack/react-query";

import { getRecommendations } from "@/lib/api/stats";
import { getStatsOverview, getWrapped } from "@/lib/api/stats";
import { queryKeys } from "@/lib/query-keys";
import { useToken } from "./use-token";

export function useStatsOverview() {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.stats.overview,
        queryFn: () => getStatsOverview(token!),
        enabled: !!token,
    });
}

export function useWrapped(year: number, month?: number) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.stats.wrapped(year, month),
        queryFn: () => getWrapped(token!, year, month),
        enabled: !!token,
    });
}

export function useRecommendations() {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.recommendations,
        queryFn: () => getRecommendations(token!),
        enabled: !!token,
    });
}
