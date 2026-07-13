import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { thumbnailUrl } from '@/lib/api-client';

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
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl(coverUrl) ?? coverUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Gamepad2 className="size-8" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium">{name}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </Link>
  );
}
