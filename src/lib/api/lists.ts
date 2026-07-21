import { apiFetch } from "./http";

import type { ListDetail, ListSummary } from "@/types/api";

export const getMyLists = (token: string) =>
    apiFetch<ListSummary[]>(token, "/lists/mine");
export const getUserLists = (token: string, userId: string) =>
    apiFetch<ListSummary[]>(token, `/lists/user/${userId}`);
export const getList = (token: string, id: string) =>
    apiFetch<ListDetail>(token, `/lists/${id}`);
export const createList = (
    token: string,
    title: string,
    description?: string,
) =>
    apiFetch<ListSummary>(token, "/lists", {
        method: "POST",
        body: JSON.stringify({ title, description }),
    });
export const updateList = (
    token: string,
    id: string,
    title: string,
    description?: string,
) =>
    apiFetch(token, `/lists/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, description }),
    });
export const deleteList = (token: string, id: string) =>
    apiFetch<void>(token, `/lists/${id}`, { method: "DELETE" });
export const addListItem = (token: string, listId: string, gameId: string) =>
    apiFetch(token, `/lists/${listId}/items`, {
        method: "POST",
        body: JSON.stringify({ gameId }),
    });
export const removeListItem = (token: string, listId: string, itemId: string) =>
    apiFetch<void>(token, `/lists/${listId}/items/${itemId}`, {
        method: "DELETE",
    });
