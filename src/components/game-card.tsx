import Link from "next/link";
import { GameCover } from "@/components/game-cover";

export function GameCard({
    id,
    name,
    coverUrl,
    subtitle,
}: {
    id: string;
    name: string;
    coverUrl: string | null;
    subtitle?: string;
}) {
    return (
        <Link
            href={`/games/${id}`}
            className="group overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary/50"
        >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                <GameCover
                    url={coverUrl}
                    loading="lazy"
                    className="size-full transition-transform duration-300 group-hover:scale-105"
                    iconClassName="size-8"
                />
            </div>
            <div className="p-3">
                <p className="truncate text-sm font-medium">{name}</p>
                {subtitle && (
                    <p className="truncate text-xs text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>
        </Link>
    );
}
