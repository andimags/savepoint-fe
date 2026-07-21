"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
    type Game,
    type GameStatus,
    type Platform,
    type UserGame,
} from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import {
    PLATFORM_OPTIONS,
    STATUS_FILTERS,
    STATUS_SHORT_OPTIONS,
} from "@/lib/options";
import { formatPlaytime } from "@/lib/utils";
import {
    useAddUserGame,
    useLibrary,
    useRemoveUserGame,
    useSetUserGamePlatform,
    useSetUserGameStatus,
} from "@/hooks/use-library";
import { useMyLists } from "@/hooks/use-lists";
import { useGameSearch } from "@/hooks/use-games";
import { AddToList } from "@/components/add-to-list";
import { GameCover } from "@/components/game-cover";
import { Pager } from "@/components/pager";
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

export function LibraryClient() {
    const [tab, setTab] = useState("ALL");
    const [page, setPage] = useState(1);

    const status = tab === "ALL" ? undefined : (tab as GameStatus);
    const { data, isPending } = useLibrary({ page, limit: 24, status });
    const { data: lists = [] } = useMyLists();

    const setStatus = useSetUserGameStatus();
    const setPlatform = useSetUserGamePlatform();
    const addUserGame = useAddUserGame();
    const removeUserGame = useRemoveUserGame();

    const [addOpen, setAddOpen] = useState(false);
    const [addQuery, setAddQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [addPlatform, setAddPlatform] = useState<Platform>("STEAM");
    const { data: addResults = [], isFetching: searching } =
        useGameSearch(searchTerm);

    const [pendingRemoval, setPendingRemoval] = useState<UserGame | null>(null);

    function handleStatusChange(userGame: UserGame, value: string) {
        setStatus.mutate(
            { id: userGame.id, status: value as GameStatus },
            {
                onSuccess: () => toast.success("Status updated."),
                onError: (error) =>
                    toast.error(
                        getErrorMessage(error, "Failed to update status."),
                    ),
            },
        );
    }

    function handlePlatformChange(userGame: UserGame, value: string) {
        if (value === userGame.platform) return;
        setPlatform.mutate(
            { id: userGame.id, platform: value as Platform },
            {
                onSuccess: () => toast.success("Platform updated."),
                onError: (error) =>
                    toast.error(
                        getErrorMessage(error, "Failed to update platform."),
                    ),
            },
        );
    }

    function handleAddSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearchTerm(addQuery.trim());
    }

    function handleRemoveGame() {
        if (!pendingRemoval) return;
        const removed = pendingRemoval;
        removeUserGame.mutate(removed.id, {
            onSuccess: () => {
                toast.success(
                    `${removed.game.name} removed from your library.`,
                );
                setPendingRemoval(null);
            },
            onError: (error) =>
                toast.error(getErrorMessage(error, "Failed to remove game.")),
        });
    }

    function handleAddGame(game: Game) {
        addUserGame.mutate(
            { gameId: game.id, platform: addPlatform },
            {
                onSuccess: () => {
                    toast.success(`${game.name} added to your library.`);
                    setAddOpen(false);
                    setAddQuery("");
                    setSearchTerm("");
                },
                onError: (error) =>
                    toast.error(getErrorMessage(error, "Failed to add game.")),
            },
        );
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
                        {STATUS_FILTERS.map((t) => (
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
                                    <GameCover
                                        url={game.coverUrl}
                                        className="h-10 w-16 rounded"
                                        iconClassName="size-4"
                                    />
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

            {isPending ? (
                <div className="grid grid-cols-1 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            ) : !data || data.items.length === 0 ? (
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
                                    <GameCover
                                        url={userGame.game.coverUrl}
                                        loading="lazy"
                                        className="h-14 w-24 rounded-md"
                                    />
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
                                        {STATUS_SHORT_OPTIONS.map((opt) => (
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

                    <Pager
                        page={page}
                        totalPages={data.totalPages}
                        onPageChange={setPage}
                    />
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
                            <Button
                                variant="outline"
                                disabled={removeUserGame.isPending}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleRemoveGame}
                            disabled={removeUserGame.isPending}
                        >
                            {removeUserGame.isPending ? "Removing..." : "Remove"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
