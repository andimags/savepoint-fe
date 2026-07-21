"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Search, UserPlus } from "lucide-react";
import { type UserSearchResult } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import {
    useFollowers,
    useFollowing,
    useFollowMutation,
    useUserSearch,
} from "@/hooks/use-social";
import { useCurrentUserId } from "@/hooks/use-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimpleUser {
    id: string;
    username: string;
}

function UserRow({
    user,
    following,
    onToggle,
}: {
    user: SimpleUser;
    following: boolean;
    onToggle?: () => void;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <Avatar className="size-9">
                <AvatarFallback className="bg-primary/15 text-sm text-primary">
                    {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <Link
                href={`/users/${user.id}`}
                className="min-w-0 flex-1 truncate font-medium hover:underline"
            >
                {user.username}
            </Link>
            {onToggle && (
                <Button
                    variant={following ? "outline" : "default"}
                    size="sm"
                    onClick={onToggle}
                >
                    {following ? "Unfollow" : "Follow"}
                </Button>
            )}
        </div>
    );
}

export function FriendsClient() {
    const myId = useCurrentUserId();

    const [input, setInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const { data: results } = useUserSearch(searchTerm);
    const { data: following = [] } = useFollowing(myId ?? "");
    const { data: followers = [] } = useFollowers(myId ?? "");
    const toggleFollow = useFollowMutation();

    function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearchTerm(input.trim());
    }

    function handleToggleFollow(user: UserSearchResult) {
        toggleFollow.mutate(
            { userId: user.id, isFollowing: user.isFollowing },
            {
                onError: (error) =>
                    toast.error(
                        getErrorMessage(error, "Failed to update follow"),
                    ),
            },
        );
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search players by username..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button type="submit">Search</Button>
            </form>

            {searchTerm !== "" && results && (
                <div className="space-y-2">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        {results.length} result{results.length === 1 ? "" : "s"}
                    </h2>
                    {results.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No players found.
                        </p>
                    ) : (
                        results.map((user) => (
                            <UserRow
                                key={user.id}
                                user={user}
                                following={user.isFollowing}
                                onToggle={() => handleToggleFollow(user)}
                            />
                        ))
                    )}
                </div>
            )}

            <Tabs defaultValue="following">
                <TabsList>
                    <TabsTrigger value="following">
                        Following ({following.length})
                    </TabsTrigger>
                    <TabsTrigger value="followers">
                        Followers ({followers.length})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="following" className="space-y-2 pt-2">
                    {following.length === 0 ? (
                        <EmptyState />
                    ) : (
                        following.map((u) => (
                            <UserRow key={u.id} user={u} following />
                        ))
                    )}
                </TabsContent>
                <TabsContent value="followers" className="space-y-2 pt-2">
                    {followers.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No followers yet.
                        </p>
                    ) : (
                        followers.map((u) => (
                            <UserRow key={u.id} user={u} following />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <UserPlus className="size-6" />
            You&apos;re not following anyone yet. Search above to find players.
        </div>
    );
}
