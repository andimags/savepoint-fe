"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    addListItem,
    createList,
    deleteList,
    getList,
    getMyLists,
    getUserLists,
    removeListItem,
    updateList,
} from "@/lib/api/lists";
import { queryKeys } from "@/lib/query-keys";
import { useToken } from "./use-token";

export function useMyLists() {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.lists.mine,
        queryFn: () => getMyLists(token!),
        enabled: !!token,
    });
}

export function useUserLists(userId: string) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.lists.ofUser(userId),
        queryFn: () => getUserLists(token!, userId),
        enabled: !!token && !!userId,
    });
}

export function useList(id: string) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.lists.detail(id),
        queryFn: () => getList(token!, id),
        enabled: !!token && !!id,
    });
}

export function useCreateList() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: { title: string; description?: string }) =>
            createList(token!, input.title, input.description),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.lists.mine }),
    });
}

export function useUpdateList(id: string) {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: { title: string; description?: string }) =>
            updateList(token!, id, input.title, input.description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lists.mine });
            queryClient.invalidateQueries({
                queryKey: queryKeys.lists.detail(id),
            });
        },
    });
}

export function useDeleteList() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteList(token!, id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.lists.mine }),
    });
}

export function useAddListItem() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: { listId: string; gameId: string }) =>
            addListItem(token!, input.listId, input.gameId),
        onSuccess: (_data, input) =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.lists.detail(input.listId),
            }),
    });
}

export function useRemoveListItem(listId: string) {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (itemId: string) => removeListItem(token!, listId, itemId),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.lists.detail(listId),
            }),
    });
}
