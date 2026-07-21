import { apiFetch } from "./http";

import type { GameStatus, Paginated, Platform, UserGame } from "@/types/api";

export const getUserGames = (
    token: string,
    page = 1,
    limit = 20,
    status?: GameStatus,
    gameId?: string,
    userId?: string,
) =>
    apiFetch<Paginated<UserGame>>(
        token,
        `/user-games?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}${gameId ? `&gameId=${gameId}` : ""}${userId ? `&userId=${userId}` : ""}`,
    );
export const addUserGame = (
    token: string,
    gameId: string,
    platform: Platform,
    status?: GameStatus,
) =>
    apiFetch<UserGame>(token, "/user-games", {
        method: "POST",
        body: JSON.stringify({ gameId, platform, status }),
    });
export const setUserGameStatus = (
    token: string,
    id: string,
    status: GameStatus,
) =>
    apiFetch<UserGame>(token, `/user-games/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
export const setUserGamePlatform = (
    token: string,
    id: string,
    platform: Platform,
) =>
    apiFetch<UserGame>(token, `/user-games/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ platform }),
    });
export const removeUserGame = (token: string, id: string) =>
    apiFetch<void>(token, `/user-games/${id}`, { method: "DELETE" });
