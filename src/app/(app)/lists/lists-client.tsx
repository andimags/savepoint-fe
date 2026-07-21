"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ListPlus } from "lucide-react";
import { createList, getMyLists, type ListSummary } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function ListsClient() {
    const { data: session } = useSession();
    const token = session?.accessToken;

    const [lists, setLists] = useState<ListSummary[] | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const refresh = useCallback(async () => {
        if (!token) return;
        setLists(await getMyLists(token));
    }, [token]);

    useEffect(() => {
        refresh().catch(() => {});
    }, [refresh]);

    async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token || !title.trim()) return;
        try {
            await createList(
                token,
                title.trim(),
                description.trim() || undefined,
            );
            setCreateOpen(false);
            setTitle("");
            setDescription("");
            toast.success("List created.");
            await refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to create list.",
            );
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <ListPlus data-icon="inline-start" /> New list
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a list</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Best Assassin Games"
                                    required
                                    maxLength={120}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description (optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Create list
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {!lists ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            ) : lists.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                    No lists yet. Create one to start collecting games.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {lists.map((list) => (
                        <Link key={list.id} href={`/lists/${list.id}`}>
                            <Card className="h-full transition-colors hover:border-primary/50">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {list.title}
                                    </CardTitle>
                                    <CardDescription>
                                        {list.itemCount}{" "}
                                        {list.itemCount === 1
                                            ? "game"
                                            : "games"}
                                        {list.description
                                            ? ` · ${list.description}`
                                            : ""}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
