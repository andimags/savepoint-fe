/**
 * RAWG's original media assets are frequently 400KB–3MB, which makes list and grid views feel
 * heavy. RAWG's CDN pre-generates a single small thumbnail at /media/crop/600/400/ (~50KB), which
 * is what we serve everywhere instead of the multi-megabyte original.
 *
 * The older /media/resize/{width}/-/ endpoint now 307-redirects to api.rawg.io and 404s, and the
 * crop endpoint only serves the exact 600x400 variant; any other dimensions 404. Covers are always
 * rendered with object-cover inside fixed-aspect boxes, so the 3:2 source ratio is transparent. Steam
 * headers are already small, so only RAWG URLs are rewritten; anything else (and already-cropped/
 * resized URLs) passes through.
 */
export function thumbnailUrl(url: string | null): string | null {
    if (!url) return url;
    const marker = "/media/";
    const markerIndex = url.indexOf(marker);
    if (!url.includes("media.rawg.io") || markerIndex === -1) return url;
    if (url.includes("/media/resize/") || url.includes("/media/crop/"))
        return url;
    const prefix = url.slice(0, markerIndex + marker.length);
    const assetPath = url.slice(markerIndex + marker.length);
    return `${prefix}crop/600/400/${assetPath}`;
}
