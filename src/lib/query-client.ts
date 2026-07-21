import {
    QueryClient,
    defaultShouldDehydrateQuery,
    isServer,
} from "@tanstack/react-query";

/**
 * Shared QueryClient defaults for both the browser singleton and the per-request server client used
 * during prefetch. `staleTime` of 30s cuts the duplicate requests the old per-component fetches made;
 * focus refetching is off to preserve the app's previous "load once, refresh on mutation" behavior.
 */
function makeQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
            dehydrate: {
                // Also ship in-flight queries so a server prefetch that hasn't resolved still
                // hydrates on the client instead of refetching from scratch.
                shouldDehydrateQuery: (query) =>
                    defaultShouldDehydrateQuery(query) ||
                    query.state.status === "pending",
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

/**
 * A fresh client per server request (so state never leaks between users), and a lazily-created
 * singleton in the browser (so the cache survives navigations).
 */
export function getQueryClient(): QueryClient {
    if (isServer) return makeQueryClient();
    browserQueryClient ??= makeQueryClient();
    return browserQueryClient;
}
