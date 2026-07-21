"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    addUserGame,
    getUserGames,
    removeUserGame,
    setUserGamePlatform,
    setUserGameStatus,
} from "@/lib/api/library";
import { queryKeys } from "@/lib/query-keys";
import { useToken } from "./use-token";

import type { GameStatus, Platform } from "@/types/api";

interface LibraryParams {
    page?: number;
    limit?: number;
    status?: GameStatus;
    gameId?: string;
    userId?: string;
}

export function useLibrary(params: LibraryParams = {}) {
    const token = useToken();
    const { page = 1, limit = 20, status, gameId, userId } = params;
    return useQuery({
        queryKey: queryKeys.library.list({ status, page, gameId, userId }),
        queryFn: () =>
            getUserGames(token!, page, limit, status, gameId, userId),
        enabled: !!token,
    });
}

export function useAddUserGame() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: {
            gameId: string;
            platform: Platform;
            status?: GameStatus;
        }) => addUserGame(token!, input.gameId, input.platform, input.status),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.library.all }),
    });
}

export function useSetUserGameStatus() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: { id: string; status: GameStatus }) =>
            setUserGameStatus(token!, input.id, input.status),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.library.all }),
    });
}

export function useSetUserGamePlatform() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: { id: string; platform: Platform }) =>
            setUserGamePlatform(token!, input.id, input.platform),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.library.all }),
    });
}

export function useRemoveUserGame() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => removeUserGame(token!, id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.library.all }),
    });
}
