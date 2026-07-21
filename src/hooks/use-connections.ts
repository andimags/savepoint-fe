"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    connectPsn,
    connectSteam,
    getPsnStatus,
    getSteamStatus,
    resyncPsn,
    resyncSteam,
} from "@/lib/api/connections";
import { queryKeys } from "@/lib/query-keys";
import { useToken } from "./use-token";

export const SYNCING_STATES = new Set(["pending", "syncing"]);

/**
 * Polls every 2s while a platform sync is in flight so the tile reflects progress without a manual
 * refresh, and stops polling once the sync settles. Replaces the old useSyncStatus effect.
 */
export function useSteamStatus() {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.connections.steam,
        queryFn: () => getSteamStatus(token!),
        enabled: !!token,
        refetchInterval: (query) => {
            const status = query.state.data;
            return status?.connected &&
                SYNCING_STATES.has(status.syncStatus ?? "")
                ? 2000
                : false;
        },
    });
}

export function usePsnStatus() {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.connections.psn,
        queryFn: () => getPsnStatus(token!),
        enabled: !!token,
        refetchInterval: (query) => {
            const status = query.state.data;
            return status?.connected &&
                SYNCING_STATES.has(status.syncStatus ?? "")
                ? 2000
                : false;
        },
    });
}

export function useConnectSteam() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (profileUrlOrId: string) =>
            connectSteam(token!, profileUrlOrId),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.connections.steam,
            }),
    });
}

export function useResyncSteam() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => resyncSteam(token!),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.connections.steam,
            }),
    });
}

export function useConnectPsn() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (npsso: string) => connectPsn(token!, npsso),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.connections.psn,
            }),
    });
}

export function useResyncPsn() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => resyncPsn(token!),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.connections.psn,
            }),
    });
}
