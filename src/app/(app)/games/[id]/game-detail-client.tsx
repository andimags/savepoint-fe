"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import {
    addDiaryEntry,
    addUserGame,
    clearRating,
    getGame,
    getMe,
    getMyLists,
    getRating,
    getUserGames,
    setRating,
    setUserGameStatus,
    thumbnailUrl,
    updateProfile,
    type Game,
    type GameStatus,
    type ListSummary,
    type RatingSummary,
    type UserGame,
    MANUAL_PLATFORMS,
    PLATFORM_LABELS,
} from "@/lib/api-client";
import { AddToList } from "@/components/add-to-list";
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

const STATUS_OPTIONS: { value: GameStatus; label: string }[] = [
    { value: "PLAYING", label: "Currently Playing" },
    { value: "FINISHED", label: "Finished" },
    { value: "BACKLOG", label: "Backlog" },
    { value: "DROPPED", label: "Dropped" },
];

const DIARY_PLATFORMS = MANUAL_PLATFORMS.map((p) => PLATFORM_LABELS[p]);

export function GameDetailClient({ gameId }: { gameId: string }) {
    const { data: session } = useSession();
    const token = session?.accessToken;

    const [game, setGame] = useState<Game | null>(null);
    const [rating, setRatingState] = useState<RatingSummary | null>(null);
    const [userGame, setUserGame] = useState<UserGame | null>(null);
    const [lists, setLists] = useState<ListSummary[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);

    const [diaryOpen, setDiaryOpen] = useState(false);
    const [diaryDate, setDiaryDate] = useState(() =>
        new Date().toISOString().slice(0, 10),
    );
    const [diaryPlatform, setDiaryPlatform] = useState("Steam");
    const [diaryNote, setDiaryNote] = useState("");

    const refresh = useCallback(async () => {
        if (!token) return;
        const [g, r, ug, ls, me] = await Promise.all([
            getGame(token, gameId),
            getRating(token, gameId),
            getUserGames(token, 1, 1, undefined, gameId),
            getMyLists(token),
            getMe(token),
        ]);
        setGame(g);
        setRatingState(r);
        setUserGame(ug.items[0] ?? null);
        setLists(ls);
        setIsFavorite(me.favoriteGameId === gameId);
    }, [token, gameId]);

    async function toggleFavorite() {
        if (!token) return;
        try {
            const next = !isFavorite;
            await updateProfile(token, {
                favoriteGameId: next ? gameId : null,
            });
            setIsFavorite(next);
            toast.success(
                next ? "Set as your favorite game." : "Removed from favorite.",
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update favorite.",
            );
        }
    }

    useEffect(() => {
        refresh().catch(() => toast.error("Failed to load game."));
    }, [refresh]);

    if (!game) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    async function handleRate(value: number) {
        if (!token) return;
        if (rating?.userRating === value) {
            await clearRating(token, gameId);
            toast.success("Rating removed.");
        } else {
            await setRating(token, gameId, value);
            toast.success(`Rated ${value} star${value > 1 ? "s" : ""}.`);
        }
        setRatingState(await getRating(token, gameId));
    }

    async function handleStatusChange(value: string) {
        if (!token) return;
        try {
            let entry = userGame;
            if (!entry) {
                entry = await addUserGame(token, gameId, "STEAM");
            }
            const updated = await setUserGameStatus(
                token,
                entry.id,
                value as GameStatus,
            );
            setUserGame(updated);
            toast.success("Status updated.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update status.",
            );
        }
    }

    async function handleLogDiary(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token) return;
        try {
            await addDiaryEntry(token, {
                gameId,
                playedOn: diaryDate,
                platform: diaryPlatform,
                note: diaryNote || undefined,
            });
            setDiaryOpen(false);
            setDiaryNote("");
            toast.success("Logged to diary.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to log entry.",
            );
        }
    }

    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="flex flex-col gap-6 md:flex-row">
                <div className="w-full shrink-0 overflow-hidden rounded-xl border md:w-96">
                    {game.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={thumbnailUrl(game.coverUrl) ?? game.coverUrl}
                            alt={game.name}
                            className="aspect-video w-full object-cover"
                        />
                    ) : (
                        <div className="aspect-video w-full bg-muted" />
                    )}
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
                                    <Button type="submit" className="w-full">
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
