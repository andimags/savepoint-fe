import { apiFetch } from "./http";

import type { RatingSummary } from "@/types/api";

export const getRating = (token: string, gameId: string) =>
    apiFetch<RatingSummary>(token, `/games/${gameId}/rating`);
export const setRating = (token: string, gameId: string, value: number) =>
    apiFetch(token, `/games/${gameId}/rating`, {
        method: "PUT",
        body: JSON.stringify({ value }),
    });
export const clearRating = (token: string, gameId: string) =>
    apiFetch<void>(token, `/games/${gameId}/rating`, { method: "DELETE" });
