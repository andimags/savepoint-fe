"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
    type DiaryEntry,
    MANUAL_PLATFORMS,
    PLATFORM_LABELS,
    STATUS_LABELS,
} from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import {
    useDeleteDiaryEntry,
    useDiary,
    useUpdateDiaryEntry,
} from "@/hooks/use-diary";
import { GameCover } from "@/components/game-cover";
import { Pager } from "@/components/pager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const DIARY_PLATFORMS = MANUAL_PLATFORMS.map((p) => PLATFORM_LABELS[p]);

function monthLabel(dateStr: string): string {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
    });
}

export function DiaryClient() {
    const [page, setPage] = useState(1);
    const { data, isPending } = useDiary(page);
    const updateEntry = useUpdateDiaryEntry();
    const deleteEntry = useDeleteDiaryEntry();

    const [editing, setEditing] = useState<DiaryEntry | null>(null);
    const [editDate, setEditDate] = useState("");
    const [editPlatform, setEditPlatform] = useState("PC");
    const [editNote, setEditNote] = useState("");

    const grouped = useMemo(() => {
        if (!data) return [];
        const groups = new Map<string, DiaryEntry[]>();
        for (const entry of data.items) {
            const key = monthLabel(entry.playedOn);
            const list = groups.get(key) ?? [];
            list.push(entry);
            groups.set(key, list);
        }
        return [...groups.entries()];
    }, [data]);

    function startEdit(entry: DiaryEntry) {
        setEditing(entry);
        setEditDate(entry.playedOn);
        setEditPlatform(entry.platform);
        setEditNote(entry.note ?? "");
    }

    function handleEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editing) return;
        updateEntry.mutate(
            {
                id: editing.id,
                entry: {
                    playedOn: editDate,
                    platform: editPlatform,
                    note: editNote || undefined,
                },
            },
            {
                onSuccess: () => {
                    setEditing(null);
                    toast.success("Entry updated.");
                },
                onError: (error) =>
                    toast.error(
                        getErrorMessage(error, "Failed to update entry."),
                    ),
            },
        );
    }

    function handleDelete(entry: DiaryEntry) {
        deleteEntry.mutate(entry.id, {
            onSuccess: () => toast.success("Entry deleted."),
        });
    }

    if (isPending) return <Skeleton className="h-64 w-full" />;

    if (!data || data.items.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-muted-foreground">
                Your diary is empty. Open a game page and hit “Log to diary” to
                start tracking what you play.
            </p>
        );
    }

    return (
        <div className="space-y-8">
            {grouped.map(([month, entries]) => (
                <section key={month} className="space-y-3">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        {month}
                    </h2>
                    <div className="space-y-2">
                        {entries.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex items-center gap-3 rounded-lg border bg-card p-3"
                            >
                                <span className="w-10 shrink-0 text-center text-lg font-semibold tabular-nums">
                                    {entry.playedOn.slice(8, 10)}
                                </span>
                                <Link
                                    href={`/games/${entry.gameId}`}
                                    className="shrink-0"
                                >
                                    <GameCover
                                        url={entry.game.coverUrl}
                                        className="h-10 w-16 rounded"
                                        iconClassName="size-4"
                                    />
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`/games/${entry.gameId}`}
                                        className="block truncate text-sm font-medium hover:underline"
                                    >
                                        {entry.game.name}
                                    </Link>
                                    {entry.note && (
                                        <p className="truncate text-xs text-muted-foreground">
                                            {entry.note}
                                        </p>
                                    )}
                                </div>
                                {entry.status && (
                                    <Badge className="shrink-0 border-transparent bg-brand/15 text-brand">
                                        {STATUS_LABELS[entry.status]}
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className="hidden shrink-0 sm:inline-flex"
                                >
                                    {entry.platform}
                                </Badge>
                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => startEdit(entry)}
                                        aria-label="Edit entry"
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => handleDelete(entry)}
                                        aria-label="Delete entry"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            <Pager
                page={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
            />

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit diary entry</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editDate">Date played</Label>
                            <Input
                                id="editDate"
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Platform</Label>
                            <Select
                                value={editPlatform}
                                onValueChange={setEditPlatform}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DIARY_PLATFORMS.map((p) => (
                                        <SelectItem key={p} value={p}>
                                            {p}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editNote">Note</Label>
                            <Textarea
                                id="editNote"
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={updateEntry.isPending}
                        >
                            {updateEntry.isPending
                                ? "Saving..."
                                : "Save changes"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
