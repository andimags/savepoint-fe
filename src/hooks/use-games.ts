"use client";

import {
    useMutation,
    useQueries,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { getBrowseGames, getGame, searchGames } from "@/lib/api/games";
import { clearRating, getRating, setRating } from "@/lib/api/ratings";
import { queryKeys } from "@/lib/query-keys";
import { useToken } from "./use-token";

import type { Game } from "@/types/api";

export function useGame(id: string, initialData?: Game) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.games.detail(id),
        queryFn: () => getGame(token!, id),
        enabled: !!token && !!id,
        initialData,
    });
}

/** Fetches several games by id in parallel, reusing any already cached by useGame. */
export function useGamesByIds(ids: string[]) {
    const token = useToken();
    return useQueries({
        queries: ids.map((id) => ({
            queryKey: queryKeys.games.detail(id),
            queryFn: () => getGame(token!, id),
            enabled: !!token && !!id,
        })),
    });
}

export function useBrowseGames(enabled = true) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.games.browse,
        queryFn: () => getBrowseGames(token!),
        enabled: !!token && enabled,
    });
}

export function useGameSearch(query: string) {
    const token = useToken();
    const trimmed = query.trim();
    return useQuery({
        queryKey: queryKeys.games.search(trimmed),
        queryFn: () => searchGames(token!, trimmed),
        enabled: !!token && trimmed.length > 0,
    });
}

export function useRating(gameId: string) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.games.rating(gameId),
        queryFn: () => getRating(token!, gameId),
        enabled: !!token && !!gameId,
    });
}

export function useSetRating(gameId: string) {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (value: number) => setRating(token!, gameId, value),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.games.rating(gameId),
            }),
    });
}

export function useClearRating(gameId: string) {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => clearRating(token!, gameId),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.games.rating(gameId),
            }),
    });
}
