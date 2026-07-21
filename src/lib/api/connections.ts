import { apiFetch } from "./http";

import type { PsnStatus, SteamStatus } from "@/types/api";

// --- Steam connection ---
export const getSteamStatus = (token: string) =>
    apiFetch<SteamStatus>(token, "/platform-connections/steam/status");
export const connectSteam = (token: string, profileUrlOrId: string) =>
    apiFetch(token, "/platform-connections/steam", {
        method: "POST",
        body: JSON.stringify({ profileUrlOrId }),
    });
export const resyncSteam = (token: string) =>
    apiFetch(token, "/platform-connections/steam/resync", { method: "POST" });

// --- PlayStation Network connection ---
export const getPsnStatus = (token: string) =>
    apiFetch<PsnStatus>(token, "/platform-connections/psn/status");
export const connectPsn = (token: string, npsso: string) =>
    apiFetch<PsnStatus>(token, "/platform-connections/psn", {
        method: "POST",
        body: JSON.stringify({ npsso }),
    });
export const resyncPsn = (token: string) =>
    apiFetch<PsnStatus>(token, "/platform-connections/psn/resync", {
        method: "POST",
    });
