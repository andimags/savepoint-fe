"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, RefreshCw } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { PLATFORM_BRANDS } from "@/components/platform-logos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tile, SyncBadge } from "./connection-tile";
import {
    SYNCING_STATES,
    useConnectSteam,
    useResyncSteam,
    useSteamStatus,
} from "@/hooks/use-connections";

const STEAM = PLATFORM_BRANDS.find((b) => b.key === "steam")!;

export function SteamCard() {
    const { data: status } = useSteamStatus();
    const connectSteam = useConnectSteam();
    const resyncSteam = useResyncSteam();
    const [profileInput, setProfileInput] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    function openProfileDialog(prefill: string) {
        setProfileInput(prefill);
        setDialogOpen(true);
    }

    function handleConnect(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const wasConnected = status?.connected;
        connectSteam.mutate(profileInput, {
            onSuccess: () => {
                toast.success(
                    wasConnected
                        ? "Steam profile updated, re-syncing your library."
                        : "Steam connected, syncing your library.",
                );
                setDialogOpen(false);
            },
            onError: (error) =>
                toast.error(
                    getErrorMessage(error, "Could not connect Steam account."),
                ),
        });
    }

    function handleResync() {
        resyncSteam.mutate(undefined, {
            onSuccess: () => toast.success("Resync started."),
        });
    }

    const connected = status?.connected;
    const syncing = SYNCING_STATES.has(status?.syncStatus ?? "");

    return (
        <Tile
            gradient={STEAM.gradient}
            glyph={STEAM.glyph}
            name="Steam"
            subtitle={
                connected ? "Owned games & playtime" : "Import your library"
            }
        >
            {connected ? (
                <div className="flex flex-col items-center gap-2">
                    <SyncBadge syncStatus={status?.syncStatus} />
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={handleResync}
                        disabled={syncing}
                    >
                        <RefreshCw data-icon="inline-start" /> Resync
                    </Button>
                    <Button
                        variant="link"
                        size="xs"
                        className="h-auto p-0 text-xs text-muted-foreground"
                        onClick={() =>
                            openProfileDialog(status?.steamId64 ?? "")
                        }
                    >
                        <Pencil data-icon="inline-start" /> Change profile URL
                    </Button>
                </div>
            ) : (
                <Button size="sm" onClick={() => openProfileDialog("")}>
                    Connect
                </Button>
            )}
            {status?.syncError && (
                <Alert className="mt-1 text-left">
                    <AlertDescription className="text-xs">
                        {status.syncError}
                    </AlertDescription>
                </Alert>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {connected
                                ? "Change Steam profile"
                                : "Connect Steam"}
                        </DialogTitle>
                        <DialogDescription>
                            Paste your Steam profile URL, vanity name, or
                            SteamID64. Your profile&apos;s &quot;game
                            details&quot; privacy setting must be public.
                            {connected &&
                                " Saving will re-sync your library from the new profile."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleConnect} className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="steam-profile" className="sr-only">
                                Steam profile URL or SteamID
                            </Label>
                            <Input
                                id="steam-profile"
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
                            disabled={connectSteam.isPending}
                            className="w-full"
                        >
                            {connectSteam.isPending
                                ? "Saving..."
                                : connected
                                  ? "Save & re-sync"
                                  : "Connect Steam"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </Tile>
    );
}
