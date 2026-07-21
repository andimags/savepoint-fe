"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import {
    type GameStatus,
    MANUAL_PLATFORMS,
    PLATFORM_LABELS,
} from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { STATUS_OPTIONS } from "@/lib/options";
import { useAddDiaryEntry } from "@/hooks/use-diary";
import {
    useClearRating,
    useGame,
    useRating,
    useSetRating,
} from "@/hooks/use-games";
import {
    useAddUserGame,
    useLibrary,
    useSetUserGameStatus,
} from "@/hooks/use-library";
import { useMyLists } from "@/hooks/use-lists";
import { useMe, useUpdateProfile } from "@/hooks/use-me";
import { AddToList } from "@/components/add-to-list";
import { GameCover } from "@/components/game-cover";
import { StarRating } from "@/components/star-rating";
import { ReviewsSection } from "./reviews-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const DIARY_PLATFORMS = MANUAL_PLATFORMS.map((p) => PLATFORM_LABELS[p]);

export function GameDetailClient({ gameId }: { gameId: string }) {
    const { data: game } = useGame(gameId);
    const { data: rating } = useRating(gameId);
    const { data: library } = useLibrary({ gameId, limit: 1 });
    const { data: lists = [] } = useMyLists();
    const { data: me } = useMe();

    const userGame = library?.items[0] ?? null;
    const isFavorite = me?.favoriteGameId === gameId;

    const setRating = useSetRating(gameId);
    const clearRating = useClearRating(gameId);
    const addUserGame = useAddUserGame();
    const setUserGameStatus = useSetUserGameStatus();
    const updateProfile = useUpdateProfile();
    const addDiaryEntry = useAddDiaryEntry();

    const [diaryOpen, setDiaryOpen] = useState(false);
    const [diaryDate, setDiaryDate] = useState(() =>
        new Date().toISOString().slice(0, 10),
    );
    const [diaryPlatform, setDiaryPlatform] = useState("Steam");
    const [diaryNote, setDiaryNote] = useState("");

    function toggleFavorite() {
        const next = !isFavorite;
        updateProfile.mutate(
            { favoriteGameId: next ? gameId : null },
            {
                onSuccess: () =>
                    toast.success(
                        next
                            ? "Set as your favorite game."
                            : "Removed from favorite.",
                    ),
                onError: (error) =>
                    toast.error(
                        getErrorMessage(error, "Failed to update favorite."),
                    ),
            },
        );
    }

    function handleRate(value: number) {
        if (rating?.userRating === value) {
            clearRating.mutate(undefined, {
                onSuccess: () => toast.success("Rating removed."),
            });
            return;
        }
        setRating.mutate(value, {
            onSuccess: () =>
                toast.success(`Rated ${value} star${value > 1 ? "s" : ""}.`),
        });
    }

    async function handleStatusChange(value: string) {
        try {
            let entry = userGame;
            if (!entry) {
                entry = await addUserGame.mutateAsync({
                    gameId,
                    platform: "STEAM",
                });
            }
            await setUserGameStatus.mutateAsync({
                id: entry.id,
                status: value as GameStatus,
            });
            toast.success("Status updated.");
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to update status."));
        }
    }

    function handleLogDiary(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addDiaryEntry.mutate(
            {
                gameId,
                playedOn: diaryDate,
                platform: diaryPlatform,
                note: diaryNote || undefined,
            },
            {
                onSuccess: () => {
                    setDiaryOpen(false);
                    setDiaryNote("");
                    toast.success("Logged to diary.");
                },
                onError: (error) =>
                    toast.error(
                        getErrorMessage(error, "Failed to log entry."),
                    ),
            },
        );
    }

    if (!game) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="flex flex-col gap-6 md:flex-row">
                <div className="w-full shrink-0 overflow-hidden rounded-xl border md:w-96">
                    <GameCover
                        url={game.coverUrl}
                        alt={game.name}
                        className="aspect-video w-full"
                        iconClassName="size-10"
                    />
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            {game.name}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {game.releaseDate?.slice(0, 4)}
                            {game.metacritic != null && (
                                <> · Metacritic {game.metacritic}</>
                            )}
                        </p>
                    </div>
                    {game.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {game.genres.map((genre) => (
                                <Badge key={genre} variant="secondary">
                                    {genre}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <StarRating
                            value={rating?.userRating ?? null}
                            onChange={handleRate}
                        />
                        <span className="text-sm text-muted-foreground">
                            {rating?.average != null
                                ? `${rating.average} avg (${rating.count})`
                                : "No ratings yet"}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={userGame?.status ?? ""}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Set status" />
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

                        <Dialog open={diaryOpen} onOpenChange={setDiaryOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Log to diary</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Log {game.name}</DialogTitle>
                                </DialogHeader>
                                <form
                                    onSubmit={handleLogDiary}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="playedOn">
                                            Date played
                                        </Label>
                                        <Input
                                            id="playedOn"
                                            type="date"
                                            value={diaryDate}
                                            onChange={(e) =>
                                                setDiaryDate(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Platform</Label>
                                        <Select
                                            value={diaryPlatform}
                                            onValueChange={setDiaryPlatform}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DIARY_PLATFORMS.map((p) => (
                                                    <SelectItem
                                                        key={p}
                                                        value={p}
                                                    >
                                                        {p}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="note">
                                            Note (optional)
                                        </Label>
                                        <Textarea
                                            id="note"
                                            value={diaryNote}
                                            onChange={(e) =>
                                                setDiaryNote(e.target.value)
                                            }
                                            placeholder="Beat the final boss..."
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={addDiaryEntry.isPending}
                                    >
                                        Log entry
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <AddToList
                            gameId={gameId}
                            lists={lists}
                            size="default"
                            variant="outline"
                        />

                        <Button
                            variant={isFavorite ? "secondary" : "outline"}
                            onClick={toggleFavorite}
                            aria-pressed={isFavorite}
                        >
                            <Heart
                                data-icon="inline-start"
                                className={
                                    isFavorite ? "fill-brand text-brand" : ""
                                }
                            />
                            {isFavorite ? "Favorite" : "Set favorite"}
                        </Button>
                    </div>

                    {game.description && (
                        <p className="line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                            {game.description}
                        </p>
                    )}
                </div>
            </div>

            <Separator />

            <ReviewsSection gameId={gameId} />
        </div>
    );
}
