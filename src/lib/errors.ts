/**
 * Narrows an unknown caught value to a user-facing message. Every mutation handler surfaces API
 * failures through this so the fallback wording is the only thing each call site has to decide.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}
