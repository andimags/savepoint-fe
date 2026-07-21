"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    changePassword,
    getMe,
    updateProfile,
    uploadAvatar,
} from "@/lib/api/social";
import { queryKeys } from "@/lib/query-keys";
import { useToken } from "./use-token";

type ProfileUpdates = Parameters<typeof updateProfile>[1];

export function useMe() {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.me,
        queryFn: () => getMe(token!),
        enabled: !!token,
    });
}

export function useUpdateProfile() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updates: ProfileUpdates) => updateProfile(token!, updates),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.me }),
    });
}

export function useChangePassword() {
    const token = useToken();
    return useMutation({
        mutationFn: (input: { currentPassword: string; newPassword: string }) =>
            changePassword(token!, input.currentPassword, input.newPassword),
    });
}

export function useUploadAvatar() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => uploadAvatar(token!, file),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.me }),
    });
}
