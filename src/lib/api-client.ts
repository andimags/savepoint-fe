/**
 * Barrel for the API layer. The transport lives in `./api/http`, endpoint functions are grouped by
 * domain under `./api/*`, DTO shapes live in `@/types/api`, and pure helpers (`thumbnailUrl`,
 * `wrappedTagline`) live beside them in `lib`. Re-exported here so existing `@/lib/api-client`
 * imports keep working while the internals stay small and domain-focused.
 */

export * from "@/types/api";

export { thumbnailUrl } from "./media";
export { wrappedTagline } from "./wrapped";

export * from "./api/connections";
export * from "./api/games";
export * from "./api/library";
export * from "./api/ratings";
export * from "./api/reviews";
export * from "./api/lists";
export * from "./api/diary";
export * from "./api/social";
export * from "./api/stats";
