import { GameDetailClient } from "./game-detail-client";

export default async function GameDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <GameDetailClient gameId={id} />;
}
