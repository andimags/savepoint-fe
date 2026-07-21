/**
 * HTTP transport for the backend API. Owns the base URL, bearer-auth header, and the single
 * error-normalization path so every domain service and every caller surfaces failures identically.
 */

export const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Turns a non-OK response into a human-readable message. The backend returns either a string
 * `message` or an array of validation strings; both collapse to one line here.
 */
export async function parseErrorMessage(res: Response): Promise<string> {
    const body = (await res.json().catch(() => null)) as {
        message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message)
        ? body.message.join(", ")
        : body?.message;
    return message ?? `Request failed with status ${res.status}`;
}

export async function apiFetch<T>(
    token: string,
    path: string,
    init?: RequestInit,
): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            ...init?.headers,
            Authorization: `Bearer ${token}`,
            ...(init?.body ? { "Content-Type": "application/json" } : {}),
        },
    });
    if (!res.ok) {
        throw new Error(await parseErrorMessage(res));
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}
