"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Search, UserPlus } from "lucide-react";
import {
    followUser,
    getFollowers,
    getFollowing,
    searchUsers,
    unfollowUser,
    type UserSearchResult,
} from "@/lib/api-client";
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
    const { data: session } = useSession();
    const token = session?.accessToken;
    const myId = session?.user?.id;

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserSearchResult[] | null>(null);
    const [following, setFollowing] = useState<SimpleUser[]>([]);
    const [followers, setFollowers] = useState<SimpleUser[]>([]);

    const loadLists = useCallback(async () => {
        if (!token || !myId) return;
        const [fl, fr] = await Promise.all([
            getFollowing(token, myId),
            getFollowers(token, myId),
        ]);
        setFollowing(fl);
        setFollowers(fr);
    }, [token, myId]);

    useEffect(() => {
        loadLists().catch(() => {});
    }, [loadLists]);

    async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token || !query.trim()) return;
        try {
            setResults(await searchUsers(token, query.trim()));
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Search failed",
            );
        }
    }

    async function toggleFollow(user: UserSearchResult) {
        if (!token) return;
        try {
            if (user.isFollowing) {
                await unfollowUser(token, user.id);
            } else {
                await followUser(token, user.id);
            }
            setResults(
                (prev) =>
                    prev?.map((u) =>
                        u.id === user.id
                            ? { ...u, isFollowing: !u.isFollowing }
                            : u,
                    ) ?? null,
            );
            await loadLists();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update follow",
            );
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search players by username..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button type="submit">Search</Button>
            </form>

            {results !== null && (
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
                                onToggle={() => toggleFollow(user)}
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
