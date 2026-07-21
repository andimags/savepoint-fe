"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { type GameStatus, type Platform } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { PLATFORM_OPTIONS, STATUS_OPTIONS } from "@/lib/options";
import { useAddUserGame } from "@/hooks/use-library";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function AddToLibrary({
    gameId,
    gameName,
    size = "sm",
    variant = "default",
    className,
}: {
    gameId: string;
    gameName: string;
    size?: "sm" | "default";
    variant?: "default" | "outline" | "secondary";
    className?: string;
}) {
    const addUserGame = useAddUserGame();

    const [open, setOpen] = useState(false);
    const [platform, setPlatform] = useState<Platform>("STEAM");
    const [status, setStatus] = useState<GameStatus>("BACKLOG");

    function handleAdd() {
        addUserGame.mutate(
            { gameId, platform, status },
            {
                onSuccess: () => {
                    toast.success(`Added ${gameName} to your library.`);
                    setOpen(false);
                },
                onError: (error) =>
                    toast.error(getErrorMessage(error, "Failed to add game.")),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size={size} variant={variant} className={className}>
                    <Plus data-icon="inline-start" /> Add to library
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add {gameName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select
                            value={platform}
                            onValueChange={(v) => setPlatform(v as Platform)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PLATFORM_OPTIONS.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as GameStatus)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={handleAdd}
                        disabled={addUserGame.isPending}
                        className="w-full"
                    >
                        {addUserGame.isPending ? "Adding..." : "Add to library"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
