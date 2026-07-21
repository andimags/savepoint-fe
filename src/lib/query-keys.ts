import type { GameStatus } from "@/types/api";

/**
 * Single source of truth for TanStack Query cache keys. Centralizing them keeps invalidation precise:
 * a mutation invalidates `queryKeys.games.reviews(id)` without any call site hand-writing the array,
 * and partial keys (e.g. `queryKeys.library.all`) invalidate every matching query at once.
 */
export const queryKeys = {
    me: ["me"] as const,

    games: {
        detail: (id: string) => ["games", "detail", id] as const,
        rating: (id: string) => ["games", "detail", id, "rating"] as const,
        reviews: (id: string, page: number) =>
            ["games", "detail", id, "reviews", page] as const,
        browse: ["games", "browse"] as const,
        search: (query: string) => ["games", "search", query] as const,
    },

    library: {
        all: ["library"] as const,
        list: (params: {
            status?: GameStatus;
            page?: number;
            gameId?: string;
            userId?: string;
        }) => ["library", params] as const,
    },

    lists: {
        mine: ["lists", "mine"] as const,
        ofUser: (userId: string) => ["lists", "user", userId] as const,
        detail: (id: string) => ["lists", "detail", id] as const,
    },

    diary: (page: number) => ["diary", page] as const,

    reviews: {
        comments: (reviewId: string, page: number) =>
            ["reviews", reviewId, "comments", page] as const,
    },

    users: {
        search: (query: string) => ["users", "search", query] as const,
        profile: (userId: string) => ["users", userId, "profile"] as const,
        profileStats: (userId: string) =>
            ["users", userId, "profile-stats"] as const,
        reviews: (userId: string) => ["users", userId, "reviews"] as const,
        followers: (userId: string) => ["users", userId, "followers"] as const,
        following: (userId: string) => ["users", userId, "following"] as const,
    },

    feed: {
        playing: ["feed", "playing"] as const,
        activity: ["feed", "activity"] as const,
    },

    stats: {
        overview: ["stats", "overview"] as const,
        wrapped: (year: number, month?: number) =>
            ["stats", "wrapped", year, month ?? null] as const,
    },

    recommendations: ["recommendations"] as const,

    connections: {
        steam: ["connections", "steam"] as const,
        psn: ["connections", "psn"] as const,
    },
} as const;
