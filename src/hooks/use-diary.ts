"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    addDiaryEntry,
    deleteDiaryEntry,
    getDiary,
    updateDiaryEntry,
} from "@/lib/api/diary";
import { queryKeys } from "@/lib/query-keys";
import { useToken } from "./use-token";

type NewDiaryEntry = Parameters<typeof addDiaryEntry>[1];
type DiaryEntryUpdate = Parameters<typeof updateDiaryEntry>[2];

export function useDiary(page: number) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.diary(page),
        queryFn: () => getDiary(token!, page),
        enabled: !!token,
    });
}

export function useAddDiaryEntry() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (entry: NewDiaryEntry) => addDiaryEntry(token!, entry),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary"] }),
    });
}

export function useUpdateDiaryEntry() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: { id: string; entry: DiaryEntryUpdate }) =>
            updateDiaryEntry(token!, input.id, input.entry),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary"] }),
    });
}

export function useDeleteDiaryEntry() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteDiaryEntry(token!, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary"] }),
    });
}
