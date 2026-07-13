import { ImageResponse } from "@vercel/og";
import { auth } from "@/auth";
import { wrappedTagline } from "@/lib/api-client";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

interface Wrapped {
    totalGames: number;
    totalMinutes: number;
    reviewCount: number;
    ratingCount: number;
    source: string;
    topGenres: { genre: string; count: number }[];
    topGames: {
        id: string;
        name: string;
        coverUrl: string | null;
        playtimeMinutes: number;
    }[];
}

/**
 * Satori (the engine behind ImageResponse) fetches remote <img> URLs while rendering, and a single
 * failed fetch aborts the whole image — which is why the downloaded story could come out blank.
 * RAWG originals are also multi-megabyte. Prefetching a small cropped variant into a data URI keeps
 * rendering self-contained and lets a broken cover degrade to a placeholder instead of killing the image.
 *
 * RAWG's /media/resize/ endpoint now 307-redirects to api.rawg.io and 404s, and /media/crop/ only
 * serves the pre-generated 600x400 variant, so that is the size fetched here.
 */
function resizedCoverUrl(url: string): string {
    const marker = "/media/";
    const markerIndex = url.indexOf(marker);
    if (!url.includes("media.rawg.io") || markerIndex === -1) return url;
    if (url.includes("/media/resize/") || url.includes("/media/crop/"))
        return url;
    return `${url.slice(0, markerIndex + marker.length)}crop/600/400/${url.slice(markerIndex + marker.length)}`;
}

async function fetchCoverAsDataUri(url: string | null): Promise<string | null> {
    if (!url) return null;
    try {
        const res = await fetch(resizedCoverUrl(url), {
            headers: { "User-Agent": "Mozilla/5.0 (SavePoint Wrapped)" },
        });
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type") ?? "image/jpeg";
        const buffer = Buffer.from(await res.arrayBuffer());
        return `data:${contentType};base64,${buffer.toString("base64")}`;
    } catch {
        return null;
    }
}

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.accessToken) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") ?? String(new Date().getFullYear());
    const month = searchParams.get("month");

    const res = await fetch(
        `${API_URL}/stats/wrapped?year=${year}${month ? `&month=${month}` : ""}`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } },
    );
    if (!res.ok) {
        return new Response("Failed to load wrapped data", { status: 502 });
    }
    const wrapped = (await res.json()) as Wrapped;
    const periodLabel = month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
    const username = session.user?.username ?? "player";

    const topGames = wrapped.topGames.slice(0, 5);
    const coverDataUris = await Promise.all(
        topGames.map((game) => fetchCoverAsDataUri(game.coverUrl)),
    );

    const tagline =
        wrapped.source === "all-time"
            ? "All-time highlights"
            : wrappedTagline(wrapped.topGenres[0]?.genre, wrapped.totalGames);

    const accent = "#a78bfa";
    const brand = "#f5a97f";
    const muted = "#b3a8e0";
    const rankGradient = "linear-gradient(135deg, #8b5cf6 0%, #f5a97f 100%)";
    const tileStyle = {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        gap: 8,
        background: "rgba(255,255,255,0.04)",
        border: "2px solid rgba(255,255,255,0.08)",
        borderRadius: 34,
        padding: "38px 20px",
    };

    const stats = [
        { value: wrapped.totalGames, label: "games played" },
        { value: Math.round(wrapped.totalMinutes / 60), label: "hours gaming" },
        { value: wrapped.reviewCount, label: "reviews written" },
        { value: wrapped.ratingCount, label: "games rated" },
    ];

    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                background:
                    "linear-gradient(160deg, #17122b 0%, #0d0a1a 55%, #131028 100%)",
                color: "#f3f1fb",
                padding: "110px 80px",
                fontFamily: "sans-serif",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 20,
                }}
            >
                <div
                    style={{
                        width: 90,
                        height: 90,
                        transform: "rotate(45deg)",
                        borderRadius: 22,
                        border: "9px solid #8b5cf6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            background: "#8b5cf6",
                        }}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        fontSize: 34,
                        letterSpacing: 16,
                        textTransform: "uppercase",
                        color: muted,
                    }}
                >
                    SavePoint Wrapped
                </div>
                <div
                    style={{
                        display: "flex",
                        fontSize: 108,
                        fontWeight: 700,
                        color: accent,
                    }}
                >
                    {periodLabel}
                </div>
                <div
                    style={{ display: "flex", fontSize: 34, color: muted }}
                >{`@${username}`}</div>
                <div
                    style={{
                        display: "flex",
                        marginTop: 6,
                        padding: "12px 34px",
                        borderRadius: 999,
                        border: "2px solid rgba(139,92,246,0.4)",
                        background: "rgba(139,92,246,0.16)",
                        color: "#c4b5fd",
                        fontSize: 32,
                    }}
                >
                    {tagline}
                </div>
            </div>

            {/* Stat tiles — 2x2 grid mirroring the on-screen card */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 22,
                    width: "100%",
                }}
            >
                {[stats.slice(0, 2), stats.slice(2, 4)].map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        style={{ display: "flex", gap: 22, width: "100%" }}
                    >
                        {row.map((stat) => (
                            <div
                                key={stat.label}
                                style={{ ...tileStyle, flex: 1 }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        fontSize: 96,
                                        fontWeight: 700,
                                        color: accent,
                                    }}
                                >
                                    {String(stat.value)}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        fontSize: 32,
                                        color: muted,
                                    }}
                                >
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {wrapped.topGenres.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 14,
                            justifyContent: "center",
                            marginTop: 8,
                        }}
                    >
                        {wrapped.topGenres.slice(0, 5).map((g) => (
                            <div
                                key={g.genre}
                                style={{
                                    display: "flex",
                                    background:
                                        "linear-gradient(90deg, rgba(139,92,246,0.28), rgba(245,169,127,0.24))",
                                    color: "#e7ddff",
                                    borderRadius: 999,
                                    padding: "12px 28px",
                                    fontSize: 30,
                                }}
                            >
                                {g.genre}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top games */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    width: "100%",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        fontSize: 32,
                        letterSpacing: 12,
                        textTransform: "uppercase",
                        color: muted,
                    }}
                >
                    Top games
                </div>
                {topGames.map((game, index) => (
                    <div
                        key={game.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 24,
                            fontSize: 38,
                            background: "rgba(255,255,255,0.04)",
                            border: "2px solid rgba(255,255,255,0.08)",
                            borderRadius: 26,
                            padding: 16,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                background: rankGradient,
                                color: "#1a1330",
                                fontWeight: 700,
                                fontSize: 36,
                            }}
                        >
                            {String(index + 1)}
                        </div>
                        {coverDataUris[index] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={coverDataUris[index] as string}
                                width={150}
                                height={90}
                                style={{ borderRadius: 16, objectFit: "cover" }}
                                alt=""
                            />
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    width: 150,
                                    height: 90,
                                    borderRadius: 16,
                                    background: "#241d3d",
                                }}
                            />
                        )}
                        <div
                            style={{
                                display: "flex",
                                flex: 1,
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {game.name}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                color: brand,
                                fontSize: 34,
                                fontWeight: 700,
                            }}
                        >
                            {`${Math.round(game.playtimeMinutes / 60)}h`}
                        </div>
                    </div>
                ))}
                {topGames.length === 0 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            fontSize: 36,
                            color: muted,
                        }}
                    >
                        No games logged this period
                    </div>
                )}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 10,
                        fontSize: 26,
                        letterSpacing: 12,
                        textTransform: "uppercase",
                        color: "rgba(179,168,224,0.6)",
                    }}
                >
                    savepoint
                </div>
            </div>
        </div>,
        { width: 1080, height: 1920 },
    );
}
