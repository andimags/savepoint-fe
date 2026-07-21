import { apiFetch } from "./http";

import type { Game } from "@/types/api";

export const searchGames = (token: string, q: string) =>
    apiFetch<Game[]>(token, `/games/search?q=${encodeURIComponent(q)}`);
export const getGame = (token: string, id: string) =>
    apiFetch<Game>(token, `/games/${id}`);
export const getBrowseGames = (token: string) =>
    apiFetch<Game[]>(token, "/games/browse");
export const enrichGames = (token: string) =>
    apiFetch<{ queued: boolean }>(token, "/games/enrich", { method: "POST" });
