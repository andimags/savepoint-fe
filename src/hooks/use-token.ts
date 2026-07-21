"use client";

import { useSession } from "next-auth/react";

/**
 * The single place client code reads the access token. Query hooks pass it to the service layer and
 * gate themselves on it, so no component touches the session or threads the token itself.
 */
export function useToken(): string | undefined {
    const { data: session } = useSession();
    return session?.accessToken;
}

/** The signed-in user's id, for identity checks (e.g. "can I delete this?"). Not the access token. */
export function useCurrentUserId(): string | undefined {
    const { data: session } = useSession();
    return session?.user?.id;
}

/** The signed-in user's username, for display. Not the access token. */
export function useCurrentUsername(): string | undefined {
    const { data: session } = useSession();
    return session?.user?.username;
}
