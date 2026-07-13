"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Check, RefreshCw } from "lucide-react";
import {
    connectSteam,
    enrichGames,
    getSteamStatus,
    resyncSteam,
    type SteamStatus,
} from "@/lib/api-client";
import { PLATFORM_BRANDS } from "@/components/platform-logos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const SYNCING_STATES = new Set(["pending", "syncing"]);
const STEAM = PLATFORM_BRANDS.find((b) => b.key === "steam")!;
const COMING_SOON = PLATFORM_BRANDS.filter((b) => b.key !== "steam");

function Tile({
    color,
    glyph,
    name,
    subtitle,
    children,
    dimmed,
}: {
    color: string;
    glyph: React.ReactNode;
    name: string;
    subtitle?: string;
    children: React.ReactNode;
    dimmed?: boolean;
}) {
    return (
        <div
            className={`flex h-full flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center transition-all ${
                dimmed
                    ? "opacity-70"
                    : "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            }`}
        >
            <div
                className="flex size-16 items-center justify-center rounded-2xl text-white shadow-inner"
                style={{ backgroundColor: color }}
            >
                {glyph}
            </div>
            <div className="space-y-0.5">
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-muted-foreground">
                    {subtitle ?? "Import your library"}
                </p>
            </div>
            {/* Consistent action footer keeps every tile the same height */}
            <div className="mt-auto flex min-h-[2.25rem] w-full flex-col items-center justify-end gap-2">
                {children}
            </div>
        </div>
    );
}

export function ConnectionsClient() {
    const { data: session, status: sessionStatus } = useSession();
    const token = session?.accessToken;

    const [status, setStatus] = useState<SteamStatus | null>(null);
    const [profileInput, setProfileInput] = useState("");
    const [connecting, setConnecting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const refreshStatus = useCallback(async () => {
        if (!token) return;
        setStatus(await getSteamStatus(token));
    }, [token]);

    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    useEffect(() => {
        if (!status?.connected || !SYNCING_STATES.has(status.syncStatus ?? ""))
            return;
        const interval = setInterval(refreshStatus, 2000);
        return () => clearInterval(interval);
    }, [status?.connected, status?.syncStatus, refreshStatus]);

    async function handleConnect(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token) return;
        setConnecting(true);
        try {
            await connectSteam(token, profileInput);
            toast.success("Steam connected — syncing your library.");
            setDialogOpen(false);
            await refreshStatus();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not connect Steam account.",
            );
        } finally {
            setConnecting(false);
        }
    }

    async function handleResync() {
        if (!token) return;
        await resyncSteam(token);
        toast.success("Resync started.");
        await refreshStatus();
    }

    async function handleRefreshData() {
        if (!token) return;
        await enrichGames(token);
        toast.success(
            "Refreshing game details (genres, art) in the background.",
        );
    }

    if (sessionStatus === "loading" || (token && status === null)) {
        return <Skeleton className="h-48 w-full" />;
    }

    const connected = status?.connected;

    return (
        <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3">
            {/* Steam — active */}
            <Tile
                color={STEAM.color}
                glyph={STEAM.glyph}
                name="Steam"
                subtitle={
                    connected ? "Owned games & playtime" : "Import your library"
                }
            >
                {connected ? (
                    <div className="flex flex-col items-center gap-2">
                        <Badge
                            variant={
                                status?.syncStatus === "failed"
                                    ? "destructive"
                                    : status?.syncStatus === "done"
                                      ? "secondary"
                                      : "outline"
                            }
                        >
                            {status?.syncStatus === "done" ? (
                                <>
                                    <Check className="size-3" /> Synced
                                </>
                            ) : (
                                status?.syncStatus
                            )}
                        </Badge>
                        <div className="flex gap-1.5">
                            <Button
                                variant="outline"
                                size="xs"
                                onClick={handleResync}
                                disabled={SYNCING_STATES.has(
                                    status?.syncStatus ?? "",
                                )}
                            >
                                <RefreshCw data-icon="inline-start" /> Resync
                            </Button>
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={handleRefreshData}
                            >
                                Refresh data
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">Connect</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Connect Steam</DialogTitle>
                                <DialogDescription>
                                    Paste your Steam profile URL, vanity name,
                                    or SteamID64. Your profile&apos;s &quot;game
                                    details&quot; privacy setting must be
                                    public.
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                onSubmit={handleConnect}
                                className="space-y-3"
                            >
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="profile"
                                        className="sr-only"
                                    >
                                        Steam profile URL or SteamID
                                    </Label>
                                    <Input
                                        id="profile"
                                        placeholder="https://steamcommunity.com/id/yourname"
                                        value={profileInput}
                                        onChange={(e) =>
                                            setProfileInput(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={connecting}
                                    className="w-full"
                                >
                                    {connecting
                                        ? "Connecting..."
                                        : "Connect Steam"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
                {status?.syncError && (
                    <Alert className="mt-1 text-left">
                        <AlertDescription className="text-xs">
                            {status.syncError}
                        </AlertDescription>
                    </Alert>
                )}
            </Tile>

            {/* Coming soon */}
            {COMING_SOON.map((brand) => (
                <Tile
                    key={brand.key}
                    color={brand.color}
                    glyph={brand.glyph}
                    name={brand.name}
                    subtitle="Not yet available"
                    dimmed
                >
                    <Badge variant="outline">Coming soon</Badge>
                </Tile>
            ))}
        </div>
    );
}
