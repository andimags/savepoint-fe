"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const SYNCING_STATES = new Set(["pending", "syncing"]);

interface SyncStatusShape {
    connected: boolean;
    syncStatus?: "pending" | "syncing" | "done" | "failed";
}

/**
 * Loads a platform connection's status and polls every 2s while a sync is in flight,
 * so the tile reflects progress without a manual refresh. `fetchStatus` must be a stable
 * reference (e.g. a module-level api-client function) to keep the polling effect steady.
 */
export function useSyncStatus<T extends SyncStatusShape>(
    fetchStatus: (token: string) => Promise<T>,
) {
    const { data: session } = useSession();
    const token = session?.accessToken;
    const [status, setStatus] = useState<T | null>(null);

    const refresh = useCallback(async () => {
        if (!token) return;
        setStatus(await fetchStatus(token));
    }, [token, fetchStatus]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        if (!status?.connected || !SYNCING_STATES.has(status.syncStatus ?? ""))
            return;
        const interval = setInterval(refresh, 2000);
        return () => clearInterval(interval);
    }, [status?.connected, status?.syncStatus, refresh]);

    return { token, status, refresh };
}
