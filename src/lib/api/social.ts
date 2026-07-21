import { API_URL, apiFetch, parseErrorMessage } from "./http";

import type {
    ActivityFeed,
    Me,
    PlayingFeedItem,
    Profile,
    ProfileStats,
    UserSearchResult,
} from "@/types/api";

export const getMe = (token: string) => apiFetch<Me>(token, "/users/me");
export const updateProfile = (
    token: string,
    updates: {
        displayName?: string;
        username?: string;
        favoriteGameId?: string | null;
        topGameIds?: string[];
        favoriteGenres?: string[];
        topFranchise?: string | null;
        steamUsername?: string | null;
        psnUsername?: string | null;
    },
) =>
    apiFetch<Me>(token, "/users/me", {
        method: "PATCH",
        body: JSON.stringify(updates),
    });
export const changePassword = (
    token: string,
    currentPassword: string,
    newPassword: string,
) =>
    apiFetch<void>(token, "/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
    });
export const uploadAvatar = async (token: string, file: File): Promise<Me> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/users/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
    });
    if (!res.ok) {
        throw new Error(await parseErrorMessage(res));
    }
    return res.json() as Promise<Me>;
};

export const searchUsers = (token: string, q: string) =>
    apiFetch<UserSearchResult[]>(
        token,
        `/users/search?q=${encodeURIComponent(q)}`,
    );
export const getProfile = (token: string, userId: string) =>
    apiFetch<Profile>(token, `/users/${userId}`);
export const followUser = (token: string, userId: string) =>
    apiFetch<void>(token, `/users/${userId}/follow`, { method: "POST" });
export const unfollowUser = (token: string, userId: string) =>
    apiFetch<void>(token, `/users/${userId}/follow`, { method: "DELETE" });
export const getFollowers = (token: string, userId: string) =>
    apiFetch<{ id: string; username: string }[]>(
        token,
        `/users/${userId}/followers`,
    );
export const getFollowing = (token: string, userId: string) =>
    apiFetch<{ id: string; username: string }[]>(
        token,
        `/users/${userId}/following`,
    );
export const getPlayingFeed = (token: string) =>
    apiFetch<PlayingFeedItem[]>(token, "/feed/playing");
export const getActivityFeed = (token: string, page = 1, limit = 10) =>
    apiFetch<ActivityFeed>(token, `/feed/activity?page=${page}&limit=${limit}`);
export const getProfileStats = (token: string, userId: string) =>
    apiFetch<ProfileStats>(token, `/users/${userId}/profile-stats`);
