import {
    MANUAL_PLATFORMS,
    PLATFORM_LABELS,
    STATUS_LABELS,
    type GameStatus,
    type Platform,
} from "@/types/api";

/**
 * Select/tab option arrays derived from the label maps in one place, so the status and platform
 * choices can't drift between the library, profile, and game-detail views that all render them.
 */

export const STATUS_ORDER: GameStatus[] = [
    "PLAYING",
    "FINISHED",
    "BACKLOG",
    "DROPPED",
];

// Long-form labels ("Currently Playing") used where the full status name reads better.
export const STATUS_OPTIONS: { value: GameStatus; label: string }[] =
    STATUS_ORDER.map((value) => ({ value, label: STATUS_LABELS[value] }));

// Short labels used by compact tabs and filters.
export const STATUS_SHORT_LABELS: Record<GameStatus, string> = {
    PLAYING: "Playing",
    FINISHED: "Finished",
    BACKLOG: "Backlog",
    DROPPED: "Dropped",
};

export const STATUS_SHORT_OPTIONS: { value: GameStatus; label: string }[] =
    STATUS_ORDER.map((value) => ({
        value,
        label: STATUS_SHORT_LABELS[value],
    }));

export const STATUS_FILTERS: { value: string; label: string }[] = [
    { value: "ALL", label: "All" },
    ...STATUS_SHORT_OPTIONS,
];

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] =
    MANUAL_PLATFORMS.map((value) => ({ value, label: PLATFORM_LABELS[value] }));
