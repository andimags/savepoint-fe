"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, X } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import {
    useDeleteList,
    useList,
    useRemoveListItem,
    useUpdateList,
} from "@/hooks/use-lists";
import { useCurrentUserId } from "@/hooks/use-token";
import { GameCover } from "@/components/game-cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function ListDetailClient({ listId }: { listId: string }) {
    const router = useRouter();
    const myUserId = useCurrentUserId();

    const { data: list } = useList(listId);
    const updateList = useUpdateList(listId);
    const deleteList = useDeleteList();
    const removeItem = useRemoveListItem(listId);

    const [editOpen, setEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    if (!list) return <Skeleton className="h-64 w-full" />;

    const isOwner = list.owner.id === myUserId;

    function openEdit() {
        if (!list) return;
        setEditTitle(list.title);
        setEditDescription(list.description ?? "");
        setEditOpen(true);
    }

    function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editTitle.trim()) return;
        updateList.mutate(
            {
                title: editTitle.trim(),
                description: editDescription.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setEditOpen(false);
                    toast.success("List updated.");
                },
                onError: (error) =>
                    toast.error(
                        getErrorMessage(error, "Failed to update list."),
                    ),
            },
        );
    }

    function handleDeleteList() {
        deleteList.mutate(listId, {
            onSuccess: () => {
                toast.success("List deleted.");
                router.push("/lists");
            },
        });
    }

    function handleRemoveItem(itemId: string) {
        removeItem.mutate(itemId);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {list.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        by{" "}
                        <Link
                            href={`/users/${list.owner.id}`}
                            className="hover:underline"
                        >
                            {list.owner.username}
                        </Link>
                        {list.description && <> · {list.description}</>}
                    </p>
                </div>
                {isOwner && (
                    <div className="flex shrink-0 gap-2">
                        <Button variant="outline" size="sm" onClick={openEdit}>
                            <Pencil data-icon="inline-start" /> Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteList}
                        >
                            <Trash2 data-icon="inline-start" /> Delete list
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit list</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                required
                                maxLength={120}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">
                                Description (optional)
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) =>
                                    setEditDescription(e.target.value)
                                }
                                maxLength={2000}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={updateList.isPending}
                            >
                                {updateList.isPending
                                    ? "Saving..."
                                    : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {list.items.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                    This list is empty. Open a game page and use “Add to list”.
                </p>
            ) : (
                <div className="space-y-2">
                    {list.items.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg border bg-card p-3"
                        >
                            <span className="w-8 shrink-0 text-center text-sm font-medium text-muted-foreground">
                                {index + 1}
                            </span>
                            <Link
                                href={`/games/${item.game.id}`}
                                className="shrink-0"
                            >
                                <GameCover
                                    url={item.game.coverUrl}
                                    className="h-10 w-16 rounded"
                                    iconClassName="size-4"
                                />
                            </Link>
                            <Link
                                href={`/games/${item.game.id}`}
                                className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                            >
                                {item.game.name}
                            </Link>
                            {isOwner && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleRemoveItem(item.id)}
                                    aria-label="Remove from list"
                                >
                                    <X className="size-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
