import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SyncState } from "@/lib/api-client";

export function Tile({
    gradient,
    glyph,
    name,
    subtitle,
    children,
    dimmed,
}: {
    gradient: string;
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
                className="flex size-16 items-center justify-center rounded-2xl text-white shadow-md ring-1 ring-white/10"
                style={{ backgroundImage: gradient }}
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

/** Status pill shared by every connected platform tile. */
export function SyncBadge({ syncStatus }: { syncStatus?: SyncState }) {
    return (
        <Badge
            variant={
                syncStatus === "failed"
                    ? "destructive"
                    : syncStatus === "done"
                      ? "secondary"
                      : "outline"
            }
        >
            {syncStatus === "done" ? (
                <>
                    <Check className="size-3" /> Synced
                </>
            ) : (
                syncStatus
            )}
        </Badge>
    );
}
