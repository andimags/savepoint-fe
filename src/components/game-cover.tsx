import { Gamepad2 } from "lucide-react";
import { thumbnailUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * A game's cover art with a consistent placeholder when the URL is missing. Centralizes the
 * cover-or-fallback markup (and the single raw-<img> lint exception) that was duplicated across
 * every list, grid, and detail view. `className` sizes and rounds the box; the fallback icon
 * scales with `iconClassName`.
 */
export function GameCover({
    url,
    alt = "",
    className,
    iconClassName = "size-5",
    loading,
}: {
    url: string | null;
    alt?: string;
    className?: string;
    iconClassName?: string;
    loading?: "lazy" | "eager";
}) {
    const src = thumbnailUrl(url);

    if (!src) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-muted",
                    className,
                )}
            >
                <Gamepad2
                    className={cn("text-muted-foreground", iconClassName)}
                />
            </div>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element -- remote RAWG/Steam CDN art; see thumbnailUrl
        <img
            src={src}
            alt={alt}
            loading={loading}
            className={cn("object-cover", className)}
        />
    );
}
