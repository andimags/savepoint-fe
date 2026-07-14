"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Gamepad2, Plus, Trash2 } from "lucide-react";
import {
    addUserGame,
    getMyLists,
    getUserGames,
    removeUserGame,
    searchGames,
    setUserGamePlatform,
    setUserGameStatus,
    type Game,
    type GameStatus,
    type ListSummary,
    type Paginated,
    type Platform,
    type UserGame,
    MANUAL_PLATFORMS,
    PLATFORM_LABELS,
    thumbnailUrl,
} from "@/lib/api-client";
import { AddToList } from "@/components/add-to-list";
import { formatPlaytime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const STATUS_TABS: { value: string; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "PLAYING", label: "Playing" },
    { value: "FINISHED", label: "Finished" },
    { value: "BACKLOG", label: "Backlog" },
    { value: "DROPPED", label: "Dropped" },
];

const STATUS_OPTIONS: { value: GameStatus; label: string }[] = [
    { value: "PLAYING", label: "Playing" },
    { value: "FINISHED", label: "Finished" },
    { value: "BACKLOG", label: "Backlog" },
    { value: "DROPPED", label: "Dropped" },
];

const PLATFORM_OPTIONS: { value: Platform; label: string }[] =
    MANUAL_PLATFORMS.map((p) => ({
        value: p,
        label: PLATFORM_LABELS[p],
    }));

export function LibraryClient() {
    const { data: session } = useSession();
    const token = session?.accessToken;

    const [tab, setTab] = useState("ALL");
    const [page, setPage] = useState(1);
    const [data, setData] = useState<Paginated<UserGame> | null>(null);
    const [lists, setLists] = useState<ListSummary[]>([]);

    const [addOpen, setAddOpen] = useState(false);
    const [addQuery, setAddQuery] = useState("");
    const [addResults, setAddResults] = useState<Game[]>([]);
    const [addPlatform, setAddPlatform] = useState<Platform>("STEAM");
    const [searching, setSearching] = useState(false);

    const [pendingRemoval, setPendingRemoval] = useState<UserGame | null>(null);
    const [removing, setRemoving] = useState(false);

    const refresh = useCallback(async () => {
        if (!token) return;
        const status = tab === "ALL" ? undefined : (tab as GameStatus);
        setData(await getUserGames(token, page, 24, status));
    }, [token, page, tab]);

    useEffect(() => {
        refresh().catch(() => {});
    }, [refresh]);

    useEffect(() => {
        if (!token) return;
        getMyLists(token)
            .then(setLists)
            .catch(() => setLists([]));
    }, [token]);

    async function handleStatusChange(userGame: UserGame, value: string) {
        if (!token) return;
        try {
            await setUserGameStatus(token, userGame.id, value as GameStatus);
            toast.success("Status updated.");
            await refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update status.",
            );
        }
    }

    async function handlePlatformChange(userGame: UserGame, value: string) {
        if (!token || value === userGame.platform) return;
        try {
            await setUserGamePlatform(token, userGame.id, value as Platform);
            toast.success("Platform updated.");
            await refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update platform.",
            );
        }
    }

    async function handleAddSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token || !addQuery.trim()) return;
        setSearching(true);
        try {
            setAddResults(await searchGames(token, addQuery.trim()));
        } finally {
            setSearching(false);
        }
    }

    async function handleRemoveGame() {
        if (!token || !pendingRemoval) return;
        setRemoving(true);
        try {
            await removeUserGame(token, pendingRemoval.id);
            toast.success(
                `${pendingRemoval.game.name} removed from your library.`,
            );
            setPendingRemoval(null);
            await refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to remove game.",
            );
        } finally {
            setRemoving(false);
        }
    }

    async function handleAddGame(game: Game) {
        if (!token) return;
        try {
            await addUserGame(token, game.id, addPlatform);
            toast.success(`${game.name} added to your library.`);
            setAddOpen(false);
            setAddQuery("");
            setAddResults([]);
            await refresh();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to add game.",
            );
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs
                    value={tab}
                    onValueChange={(value) => {
                        setTab(value);
                        setPage(1);
                    }}
                >
                    <TabsList>
                        {STATUS_TABS.map((t) => (
                            <TabsTrigger key={t.value} value={t.value}>
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus data-icon="inline-start" /> Add game
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add a game manually</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddSearch} className="flex gap-2">
                            <Input
                                value={addQuery}
                                onChange={(e) => setAddQuery(e.target.value)}
                                placeholder="Search games..."
                                autoFocus
                            />
                            <Button type="submit" disabled={searching}>
                                {searching ? "..." : "Search"}
                            </Button>
                        </form>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Platform:
                            </span>
                            <Select
                                value={addPlatform}
                                onValueChange={(v) =>
                                    setAddPlatform(v as Platform)
                                }
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PLATFORM_OPTIONS.map((p) => (
                                        <SelectItem
                                            key={p.value}
                                            value={p.value}
                                        >
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="max-h-72 space-y-1 overflow-y-auto">
                            {addResults.map((game) => (
                                <button
                                    key={game.id}
                                    type="button"
                                    onClick={() => handleAddGame(game)}
                                    className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent"
                                >
                                    {game.coverUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={
                                                thumbnailUrl(game.coverUrl) ??
                                                game.coverUrl
                                            }
                                            alt=""
                                            className="h-10 w-16 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-16 items-center justify-center rounded bg-muted">
                                            <Gamepad2 className="size-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {game.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {game.releaseDate?.slice(0, 4) ??
                                                "Unknown year"}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {!data ? (
                <div className="grid grid-cols-1 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            ) : data.items.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                    Nothing here yet. Add games manually or connect Steam in
                    Settings → Connections.
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3">
                        {data.items.map((userGame) => (
                            <div
                                key={userGame.id}
                                className="flex items-center gap-3 rounded-lg border bg-card p-3"
                            >
                                <Link
                                    href={`/games/${userGame.gameId}`}
                                    className="shrink-0"
                                >
                                    {userGame.game.coverUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={
                                                thumbnailUrl(
                                                    userGame.game.coverUrl,
                                                ) ?? userGame.game.coverUrl
                                            }
                                            alt=""
                                            loading="lazy"
                                            className="h-14 w-24 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-14 w-24 items-center justify-center rounded-md bg-muted">
                                            <Gamepad2 className="size-5 text-muted-foreground" />
                                        </div>
                                    )}
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`/games/${userGame.gameId}`}
                                        className="block truncate text-sm font-medium hover:underline"
                                    >
                                        {userGame.game.name}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                        {formatPlaytime(
                                            userGame.playtimeMinutes,
                                        )}
                                    </p>
                                </div>
                                <Select
                                    value={userGame.platform}
                                    onValueChange={(value) =>
                                        handlePlatformChange(userGame, value)
                                    }
                                >
                                    <SelectTrigger
                                        size="sm"
                                        className="w-32 shrink-0"
                                    >
                                        <SelectValue placeholder="Platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PLATFORM_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={userGame.status}
                                    onValueChange={(value) =>
                                        handleStatusChange(userGame, value)
                                    }
                                >
                                    <SelectTrigger
                                        size="sm"
                                        className="w-32 shrink-0"
                                    >
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <AddToList
                                    gameId={userGame.gameId}
                                    lists={lists}
                                    size="icon-sm"
                                    variant="ghost"
                                    iconOnly
                                    className="shrink-0"
                                />
                                <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                    aria-label={`Remove ${userGame.game.name} from library`}
                                    onClick={() => setPendingRemoval(userGame)}
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {data.page} of {data.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= data.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            <Dialog
                open={pendingRemoval !== null}
                onOpenChange={(open) => !open && setPendingRemoval(null)}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Remove from library?</DialogTitle>
                        <DialogDescription>
                            {pendingRemoval
                                ? `${pendingRemoval.game.name} will be removed from your library. This does not delete your reviews or ratings.`
                                : null}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={removing}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleRemoveGame}
                            disabled={removing}
                        >
                            {removing ? "Removing..." : "Remove"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
