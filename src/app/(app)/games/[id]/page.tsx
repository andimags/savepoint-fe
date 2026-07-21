import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { auth } from "@/auth";
import { getGame } from "@/lib/api/games";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { GameDetailClient } from "./game-detail-client";

export default async function GameDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    // Prefetch the game on the server so the detail view paints without a client-side waterfall;
    // the remaining per-user queries (rating, library, lists) hydrate client-side.
    const queryClient = getQueryClient();
    const token = session?.accessToken;
    if (token) {
        await queryClient.prefetchQuery({
            queryKey: queryKeys.games.detail(id),
            queryFn: () => getGame(token, id),
        });
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <GameDetailClient gameId={id} />
        </HydrationBoundary>
    );
}
