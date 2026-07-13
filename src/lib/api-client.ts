const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * RAWG's original media assets are frequently 400KB–3MB, which makes list and grid views feel
 * heavy. RAWG's CDN pre-generates a single small thumbnail at /media/crop/600/400/ (~50KB), which
 * is what we serve everywhere instead of the multi-megabyte original.
 *
 * The older /media/resize/{width}/-/ endpoint now 307-redirects to api.rawg.io and 404s, and the
 * crop endpoint only serves the exact 600x400 variant — any other dimensions 404. Covers are always
 * rendered with object-cover inside fixed-aspect boxes, so the 3:2 source ratio is transparent. Steam
 * headers are already small, so only RAWG URLs are rewritten; anything else (and already-cropped/
 * resized URLs) passes through.
 */
export function thumbnailUrl(url: string | null): string | null {
    if (!url) return url;
    const marker = "/media/";
    const markerIndex = url.indexOf(marker);
    if (!url.includes("media.rawg.io") || markerIndex === -1) return url;
    if (url.includes("/media/resize/") || url.includes("/media/crop/"))
        return url;
    const prefix = url.slice(0, markerIndex + marker.length);
    const assetPath = url.slice(markerIndex + marker.length);
    return `${prefix}crop/600/400/${assetPath}`;
}

export interface SteamStatus {
    connected: boolean;
    steamId64?: string;
    syncStatus?: "pending" | "syncing" | "done" | "failed";
    syncError?: string | null;
}

export interface Game {
    id: string;
    steamAppId: number | null;
    rawgId: number | null;
    name: string;
    slug: string | null;
    coverUrl: string | null;
    genres: string[];
    releaseDate: string | null;
    metacritic: number | null;
    description: string | null;
}

export type GameStatus = "FINISHED" | "PLAYING" | "BACKLOG" | "DROPPED";
export type Platform =
    "STEAM" | "GOG" | "EPIC" | "XBOX" | "PLAYSTATION" | "NINTENDO" | "OTHER";

export const PLATFORM_LABELS: Record<Platform, string> = {
    STEAM: "Steam",
    GOG: "GOG",
    EPIC: "Epic Games Store",
    XBOX: "Xbox",
    PLAYSTATION: "PlayStation",
    NINTENDO: "Nintendo",
    OTHER: "Other",
};

export const MANUAL_PLATFORMS: Platform[] = [
    "STEAM",
    "GOG",
    "EPIC",
    "XBOX",
    "PLAYSTATION",
    "NINTENDO",
    "OTHER",
];

export const STATUS_LABELS: Record<GameStatus, string> = {
    PLAYING: "Currently Playing",
    FINISHED: "Finished",
    BACKLOG: "Backlog",
    DROPPED: "Dropped",
};

export const COMMON_GENRES = [
    "Action",
    "Adventure",
    "RPG",
    "Shooter",
    "Indie",
    "Strategy",
    "Simulation",
    "Platformer",
    "Puzzle",
    "Sports",
    "Racing",
    "Fighting",
    "Massively Multiplayer",
    "Casual",
    "Arcade",
];

export interface UserGame {
    id: string;
    gameId: string;
    game: Game;
    platform: Platform;
    playtimeMinutes: number;
    status: GameStatus | null;
}

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface RatingSummary {
    average: number | null;
    count: number;
    userRating: number | null;
}

export interface ReviewView {
    id: string;
    gameId: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    author: { id: string; username: string };
    rating: number | null;
    likeCount: number;
    likedByMe: boolean;
    commentCount: number;
    game?: { id: string; name: string; coverUrl: string | null };
}

export interface CommentView {
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; username: string };
}

export interface ListSummary {
    id: string;
    title: string;
    description: string | null;
    itemCount: number;
    updatedAt: string;
}

export interface ListDetail {
    id: string;
    title: string;
    description: string | null;
    owner: { id: string; username: string };
    items: { id: string; position: number; game: Game }[];
}

export interface DiaryEntry {
    id: string;
    gameId: string;
    game: Game;
    playedOn: string;
    platform: string;
    status: GameStatus | null;
    note: string | null;
}

export interface UserSearchResult {
    id: string;
    username: string;
    isFollowing: boolean;
}

export interface Profile {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    createdAt: string;
    followerCount: number;
    followingCount: number;
    gameCount: number;
    isFollowing: boolean;
    isSelf: boolean;
}

export interface Me {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    favoriteGameId: string | null;
    topGameIds: string[];
    favoriteGenres: string[];
    topFranchise: string | null;
    createdAt: string;
}

export interface GameRef {
    id: string;
    name: string;
    coverUrl: string | null;
}

export interface ProfileStats {
    favoriteGame: GameRef | null;
    favoriteGames: GameRef[];
    favoriteGenres: string[];
    favoriteFranchise: string | null;
    curated: boolean;
    recentDiary: {
        id: string;
        playedOn: string;
        status: GameStatus | null;
        platform: string;
        note: string | null;
        game: GameRef;
    }[];
}

export interface DiaryActivity {
    id: string;
    playedOn: string;
    platform: string;
    status: GameStatus | null;
    note: string | null;
    game: GameRef;
    author: { id: string; username: string };
}

export interface ListActivity {
    id: string;
    title: string;
    description: string | null;
    itemCount: number;
    author: { id: string; username: string };
}

export type ActivityItem =
    | { type: "review"; createdAt: string; review: ReviewView }
    | { type: "diary"; createdAt: string; diary: DiaryActivity }
    | { type: "list"; createdAt: string; list: ListActivity };

export interface ActivityFeed {
    items: ActivityItem[];
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface PlayingFeedItem {
    user: { id: string; username: string };
    game: { id: string; name: string; coverUrl: string | null };
    playtimeMinutes: number;
    updatedAt: string;
}

export interface StatsOverview {
    totalGames: number;
    totalPlaytimeMinutes: number;
    statusCounts: {
        finished: number;
        playing: number;
        backlog: number;
        dropped: number;
    };
    completionRate: number | null;
    genres: { genre: string; count: number; minutes: number }[];
    platforms: { platform: string; count: number; minutes: number }[];
}

export interface Wrapped {
    year: number;
    month: number | null;
    source: "diary" | "library" | "all-time";
    totalGames: number;
    totalMinutes: number;
    topGames: {
        id: string;
        name: string;
        coverUrl: string | null;
        playtimeMinutes: number;
    }[];
    topGenres: { genre: string; count: number }[];
    reviewCount: number;
    ratingCount: number;
}

/**
 * A short "player archetype" line derived from the wrapped data. Shared between the on-screen
 * wrapped card and the downloadable story image so both surfaces read identically.
 */
export function wrappedTagline(
    topGenre: string | undefined,
    totalGames: number,
): string {
    if (totalGames === 0) return "Ready for a new adventure";
    if (topGenre) return `${topGenre} aficionado`;
    return "Genre explorer";
}

export interface Recommendation {
    id: string;
    name: string;
    coverUrl: string | null;
    genres: string[];
    releaseDate: string | null;
    metacritic: number | null;
    score: number;
}

async function apiFetch<T>(
    token: string,
    path: string,
    init?: RequestInit,
): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            ...init?.headers,
            Authorization: `Bearer ${token}`,
            ...(init?.body ? { "Content-Type": "application/json" } : {}),
        },
    });
    if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
            message?: string | string[];
        } | null;
        const message = Array.isArray(body?.message)
            ? body.message.join(", ")
            : body?.message;
        throw new Error(message ?? `Request failed with status ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

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

// --- Games ---
export const searchGames = (token: string, q: string) =>
    apiFetch<Game[]>(token, `/games/search?q=${encodeURIComponent(q)}`);
export const getGame = (token: string, id: string) =>
    apiFetch<Game>(token, `/games/${id}`);
export const getBrowseGames = (token: string) =>
    apiFetch<Game[]>(token, "/games/browse");
export const enrichGames = (token: string) =>
    apiFetch<{ queued: boolean }>(token, "/games/enrich", { method: "POST" });

// --- Library ---
export const getUserGames = (
    token: string,
    page = 1,
    limit = 20,
    status?: GameStatus,
    gameId?: string,
    userId?: string,
) =>
    apiFetch<Paginated<UserGame>>(
        token,
        `/user-games?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}${gameId ? `&gameId=${gameId}` : ""}${userId ? `&userId=${userId}` : ""}`,
    );
export const addUserGame = (
    token: string,
    gameId: string,
    platform: Platform,
    status?: GameStatus,
) =>
    apiFetch<UserGame>(token, "/user-games", {
        method: "POST",
        body: JSON.stringify({ gameId, platform, status }),
    });
export const setUserGameStatus = (
    token: string,
    id: string,
    status: GameStatus | null,
) =>
    apiFetch<UserGame>(token, `/user-games/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
export const setUserGamePlatform = (
    token: string,
    id: string,
    platform: Platform,
) =>
    apiFetch<UserGame>(token, `/user-games/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ platform }),
    });
export const removeUserGame = (token: string, id: string) =>
    apiFetch<void>(token, `/user-games/${id}`, { method: "DELETE" });

// --- Ratings ---
export const getRating = (token: string, gameId: string) =>
    apiFetch<RatingSummary>(token, `/games/${gameId}/rating`);
export const setRating = (token: string, gameId: string, value: number) =>
    apiFetch(token, `/games/${gameId}/rating`, {
        method: "PUT",
        body: JSON.stringify({ value }),
    });
export const clearRating = (token: string, gameId: string) =>
    apiFetch<void>(token, `/games/${gameId}/rating`, { method: "DELETE" });

// --- Reviews ---
export const getGameReviews = (token: string, gameId: string, page = 1) =>
    apiFetch<Paginated<ReviewView>>(
        token,
        `/games/${gameId}/reviews?page=${page}`,
    );
export const getRecentReviews = (token: string, page = 1, limit = 10) =>
    apiFetch<Paginated<ReviewView>>(
        token,
        `/reviews/recent?page=${page}&limit=${limit}`,
    );
export const getUserReviews = (
    token: string,
    userId: string,
    page = 1,
    limit = 10,
) =>
    apiFetch<Paginated<ReviewView>>(
        token,
        `/users/${userId}/reviews?page=${page}&limit=${limit}`,
    );
export const createReview = (token: string, gameId: string, body: string) =>
    apiFetch<ReviewView>(token, `/games/${gameId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ body }),
    });
export const updateReview = (token: string, reviewId: string, body: string) =>
    apiFetch(token, `/reviews/${reviewId}`, {
        method: "PATCH",
        body: JSON.stringify({ body }),
    });
export const deleteReview = (token: string, reviewId: string) =>
    apiFetch<void>(token, `/reviews/${reviewId}`, { method: "DELETE" });
export const likeReview = (token: string, reviewId: string) =>
    apiFetch<void>(token, `/reviews/${reviewId}/like`, { method: "POST" });
export const unlikeReview = (token: string, reviewId: string) =>
    apiFetch<void>(token, `/reviews/${reviewId}/like`, { method: "DELETE" });
export const getReviewComments = (token: string, reviewId: string, page = 1) =>
    apiFetch<Paginated<CommentView>>(
        token,
        `/reviews/${reviewId}/comments?page=${page}&limit=50`,
    );
export const addReviewComment = (
    token: string,
    reviewId: string,
    body: string,
) =>
    apiFetch<CommentView>(token, `/reviews/${reviewId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
    });
export const deleteComment = (token: string, commentId: string) =>
    apiFetch<void>(token, `/comments/${commentId}`, { method: "DELETE" });

// --- Lists ---
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

// --- Diary ---
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

// --- Social ---
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
        const body = (await res.json().catch(() => null)) as {
            message?: string | string[];
        } | null;
        const message = Array.isArray(body?.message)
            ? body.message.join(", ")
            : body?.message;
        throw new Error(message ?? `Request failed with status ${res.status}`);
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

// --- Stats / Wrapped / Recommendations ---
export const getStatsOverview = (token: string) =>
    apiFetch<StatsOverview>(token, "/stats/overview");
export const getWrapped = (token: string, year: number, month?: number) =>
    apiFetch<Wrapped>(
        token,
        `/stats/wrapped?year=${year}${month ? `&month=${month}` : ""}`,
    );
export const getRecommendations = (token: string) =>
    apiFetch<Recommendation[]>(token, "/recommendations");
