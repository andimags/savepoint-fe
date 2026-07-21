import { apiFetch } from "./http";

import type { DiaryEntry, Paginated } from "@/types/api";

export const getDiary = (token: string, page = 1, limit = 50) =>
    apiFetch<Paginated<DiaryEntry>>(
        token,
        `/diary?page=${page}&limit=${limit}`,
    );
export const addDiaryEntry = (
    token: string,
    entry: {
        gameId: string;
        playedOn: string;
        platform: string;
        note?: string;
    },
) =>
    apiFetch<DiaryEntry>(token, "/diary", {
        method: "POST",
        body: JSON.stringify(entry),
    });
export const updateDiaryEntry = (
    token: string,
    id: string,
    entry: { playedOn?: string; platform?: string; note?: string },
) =>
    apiFetch<DiaryEntry>(token, `/diary/${id}`, {
        method: "PATCH",
        body: JSON.stringify(entry),
    });
export const deleteDiaryEntry = (token: string, id: string) =>
    apiFetch<void>(token, `/diary/${id}`, { method: "DELETE" });
