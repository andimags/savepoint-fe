import { apiFetch } from "./http";

import type { Recommendation, StatsOverview, Wrapped } from "@/types/api";

export const getStatsOverview = (token: string) =>
    apiFetch<StatsOverview>(token, "/stats/overview");
export const getWrapped = (token: string, year: number, month?: number) =>
    apiFetch<Wrapped>(
        token,
        `/stats/wrapped?year=${year}${month ? `&month=${month}` : ""}`,
    );
export const getRecommendations = (token: string) =>
    apiFetch<Recommendation[]>(token, "/recommendations");
