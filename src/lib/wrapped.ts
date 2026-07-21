/**
 * A short "player archetype" line derived from the wrapped data. Shared between the on-screen
 * wrapped card and the downloadable story image so both surfaces read identically.
 */
export function wrappedTagline(
    topGenre: string | undefined,
    totalGames: number,
): string {
    if (totalGames === 0) return "Ready for a new adventure";
    if (topGenre) return `${topGenre} aficionado`;
    return "Genre explorer";
}
