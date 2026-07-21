"use client";

import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    followUser,
    getActivityFeed,
    getFollowers,
    getFollowing,
    getPlayingFeed,
    getProfile,
    getProfileStats,
    searchUsers,
    unfollowUser,
} from "@/lib/api/social";
import { getUserReviews } from "@/lib/api/reviews";
import { queryKeys } from "@/lib/query-keys";
import { useToken } from "./use-token";

import type { Profile } from "@/types/api";

export function useProfile(userId: string, initialData?: Profile) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.users.profile(userId),
        queryFn: () => getProfile(token!, userId),
        enabled: !!token && !!userId,
        initialData,
    });
}

export function useProfileStats(userId: string) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.users.profileStats(userId),
        queryFn: () => getProfileStats(token!, userId),
        enabled: !!token && !!userId,
    });
}

export function useUserReviews(userId: string) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.users.reviews(userId),
        queryFn: () => getUserReviews(token!, userId),
        enabled: !!token && !!userId,
    });
}

export function useFollowers(userId: string) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.users.followers(userId),
        queryFn: () => getFollowers(token!, userId),
        enabled: !!token && !!userId,
    });
}

export function useFollowing(userId: string) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.users.following(userId),
        queryFn: () => getFollowing(token!, userId),
        enabled: !!token && !!userId,
    });
}

/**
 * Follow/unfollow a user, then refresh the affected profile and its follower/following lists so
 * counts and buttons stay in sync without the caller refetching everything by hand.
 */
export function useToggleFollow(userId: string) {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (isFollowing: boolean) =>
            isFollowing
                ? unfollowUser(token!, userId)
                : followUser(token!, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.users.profile(userId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.users.followers(userId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.users.following(userId),
            });
        },
    });
}

/**
 * Follow/unfollow any user from a list (e.g. search results) where the target id isn't known at
 * hook-call time. Invalidates all user-scoped queries so counts, buttons, and lists refresh.
 */
export function useFollowMutation() {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: { userId: string; isFollowing: boolean }) =>
            input.isFollowing
                ? unfollowUser(token!, input.userId)
                : followUser(token!, input.userId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    });
}

export function useUserSearch(query: string) {
    const token = useToken();
    const trimmed = query.trim();
    return useQuery({
        queryKey: queryKeys.users.search(trimmed),
        queryFn: () => searchUsers(token!, trimmed),
        enabled: !!token && trimmed.length > 0,
    });
}

export function usePlayingFeed() {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.feed.playing,
        queryFn: () => getPlayingFeed(token!),
        enabled: !!token,
    });
}

export function useActivityFeed() {
    const token = useToken();
    return useInfiniteQuery({
        queryKey: queryKeys.feed.activity,
        queryFn: ({ pageParam }) => getActivityFeed(token!, pageParam, 10),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.hasMore ? lastPage.page + 1 : undefined,
        enabled: !!token,
    });
}
