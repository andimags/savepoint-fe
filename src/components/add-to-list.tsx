"use client";

import { toast } from "sonner";
import { ListPlus } from "lucide-react";
import { type ListSummary } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { useAddListItem } from "@/hooks/use-lists";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Adds a game to one of the current user's lists. Lists are supplied by the caller so a page can
 * fetch them once and reuse the control across many game rows without a request per row.
 */
export function AddToList({
    gameId,
    lists,
    size = "sm",
    variant = "outline",
    label = "Add to list",
    iconOnly = false,
    className,
}: {
    gameId: string;
    lists: ListSummary[];
    size?: "sm" | "icon-sm" | "default";
    variant?: "default" | "outline" | "secondary" | "ghost";
    label?: string;
    iconOnly?: boolean;
    className?: string;
}) {
    const addListItem = useAddListItem();

    function handleAddToList(listId: string, listTitle: string) {
        addListItem.mutate(
            { listId, gameId },
            {
                onSuccess: () => toast.success(`Added to ${listTitle}.`),
                onError: (error) =>
                    toast.error(
                        getErrorMessage(error, "Failed to add to list."),
                    ),
            },
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size={size}
                    variant={variant}
                    className={className}
                    disabled={addListItem.isPending}
                    aria-label={iconOnly ? label : undefined}
                >
                    <ListPlus
                        data-icon={iconOnly ? undefined : "inline-start"}
                    />
                    {!iconOnly && label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {lists.length === 0 ? (
                    <DropdownMenuItem disabled>
                        No lists yet, create one first
                    </DropdownMenuItem>
                ) : (
                    lists.map((list) => (
                        <DropdownMenuItem
                            key={list.id}
                            onSelect={() =>
                                handleAddToList(list.id, list.title)
                            }
                        >
                            {list.title}
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
