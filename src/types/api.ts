/**
 * Shared API vocabulary: the DTO shapes returned by the backend plus the small set of domain
 * constants (platform/status labels, genre list) that annotate the union types they sit beside.
 * Keeping each union next to its label map is intentional: splitting `Platform` from
 * `PLATFORM_LABELS` across files would hurt cohesion more than the few runtime values cost here.
 */

export type SyncState = "pending" | "syncing" | "done" | "failed";

export interface SteamStatus {
    connected: boolean;
    steamId64?: string;
    syncStatus?: SyncState;
    syncError?: string | null;
}

export interface PsnStatus {
    connected: boolean;
    onlineId?: string | null;
    syncStatus?: SyncState;
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
    status: GameStatus;
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

export interface ProfileConnection {
    platform: "STEAM" | "PSN";
    // The user's edit-profile display name for this platform. Null when unset,
    // in which case the client hides the badge entirely.
    username: string | null;
    // Present for Steam only, used to link to the public Steam community profile.
    steamId64: string | null;
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
    connections: ProfileConnection[];
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
    steamUsername: string | null;
    psnUsername: string | null;
    createdAt: string;
}

export interface GameRef {
    id: string;
    name: string;
    coverUrl: string | null;
}

export interface ProfileStats {
    hasFavorites: boolean;
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

export interface LibraryActivity {
    id: string;
    status: GameStatus;
    platform: Platform;
    game: GameRef;
    author: { id: string; username: string };
}

export type ActivityItem =
    | { type: "review"; createdAt: string; review: ReviewView }
    | { type: "diary"; createdAt: string; diary: DiaryActivity }
    | { type: "list"; createdAt: string; list: ListActivity }
    | { type: "library"; createdAt: string; library: LibraryActivity };

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

export interface Recommendation {
    id: string;
    name: string;
    coverUrl: string | null;
    genres: string[];
    releaseDate: string | null;
    metacritic: number | null;
    score: number;
}
