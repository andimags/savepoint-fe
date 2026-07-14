"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Link2 } from "lucide-react";
import { connectPsn, getPsnStatus, resyncPsn } from "@/lib/api-client";
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
import { SYNCING_STATES, useSyncStatus } from "./use-sync-status";

const PLAYSTATION = PLATFORM_BRANDS.find((b) => b.key === "playstation")!;
const SSO_COOKIE_URL = "https://ca.account.sony.com/api/v1/ssocookie";

export function PsnCard() {
    const { token, status, refresh } = useSyncStatus(getPsnStatus);
    const [npsso, setNpsso] = useState("");
    const [connecting, setConnecting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    function openDialog() {
        setNpsso("");
        setDialogOpen(true);
    }

    async function handleConnect(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token) return;
        const wasConnected = status?.connected;
        setConnecting(true);
        try {
            await connectPsn(token, npsso);
            toast.success(
                wasConnected
                    ? "PlayStation reconnected — re-syncing your library."
                    : "PlayStation connected — syncing your library.",
            );
            setDialogOpen(false);
            await refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not connect PlayStation account.",
            );
        } finally {
            setConnecting(false);
        }
    }

    async function handleResync() {
        if (!token) return;
        try {
            await resyncPsn(token);
            toast.success("Resync started.");
            await refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not start resync.",
            );
        }
    }

    const connected = status?.connected;
    const syncing = SYNCING_STATES.has(status?.syncStatus ?? "");

    return (
        <Tile
            gradient={PLAYSTATION.gradient}
            glyph={PLAYSTATION.glyph}
            name="PlayStation"
            subtitle={
                connected
                    ? (status?.onlineId ?? "Played games & playtime")
                    : "Import your library"
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
                        onClick={openDialog}
                    >
                        <Link2 data-icon="inline-start" /> Reconnect
                    </Button>
                </div>
            ) : (
                <Button size="sm" onClick={openDialog}>
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
                                ? "Reconnect PlayStation"
                                : "Connect PlayStation"}
                        </DialogTitle>
                        <DialogDescription>
                            While signed in to your PlayStation account, open{" "}
                            <a
                                href={SSO_COOKIE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium underline underline-offset-2"
                            >
                                this PlayStation page
                            </a>{" "}
                            and copy the 64-character{" "}
                            <code className="text-xs">npsso</code> value it
                            shows. Your PlayStation privacy settings must allow
                            others to see your games.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleConnect} className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="psn-npsso" className="sr-only">
                                PSN NPSSO token
                            </Label>
                            <Input
                                id="psn-npsso"
                                placeholder="Paste your npsso token"
                                value={npsso}
                                onChange={(e) => setNpsso(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={connecting}
                            className="w-full"
                        >
                            {connecting
                                ? "Saving..."
                                : connected
                                  ? "Save & re-sync"
                                  : "Connect PlayStation"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </Tile>
    );
}
