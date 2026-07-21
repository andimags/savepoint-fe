import Link from "next/link";
import { redirect } from "next/navigation";
import {
    Star,
    Trophy,
    Users,
    BookMarked,
    BarChart3,
    Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Logo, LogoMark } from "@/components/logo";
import { PLATFORM_BRANDS } from "@/components/platform-logos";

const FEATURES = [
    {
        icon: Star,
        title: "Rate & review",
        body: "Score every game 1–5 and write full reviews.",
    },
    {
        icon: BookMarked,
        title: "Track & log",
        body: "A diary of everything you play, auto-updated.",
    },
    {
        icon: Users,
        title: "Follow friends",
        body: "See what your friends are playing right now.",
    },
    {
        icon: BarChart3,
        title: "Stats & Wrapped",
        body: "Genre breakdowns and a shareable yearly recap.",
    },
];

export default async function Home() {
    const session = await auth();
    if (session) {
        redirect("/home");
    }

    return (
        <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-app-glow">
            {/* Decorative floating gaming accents */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <Trophy className="absolute left-[8%] top-[22%] size-10 rotate-12 text-brand/20" />
                <Star className="absolute right-[12%] top-[16%] size-8 -rotate-12 text-primary/25" />
                <Sparkles className="absolute bottom-[26%] left-[14%] size-7 text-chart-3/25" />
                <LogoMark className="absolute bottom-[16%] right-[10%] size-12 opacity-10" />
            </div>

            <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
                <Logo />
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/login">Log in</Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/register">Sign up</Link>
                    </Button>
                </div>
            </header>

            <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-7 px-4 py-16 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <Sparkles className="size-3.5" /> Your gaming life, all in
                    one save file
                </span>

                <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
                    Press <span className="text-gradient-brand">start</span> on
                    your
                    <br /> gaming journal.
                </h1>

                <p className="max-w-xl text-balance text-lg text-muted-foreground">
                    Rate, review, and remember every game you play. Import your
                    library, track your backlog, and share your stats. 🎮
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button asChild size="lg" className="gap-2">
                        <Link href="/register">
                            <Trophy className="size-4" /> Start your library
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/login">Log in</Link>
                    </Button>
                </div>

                {/* Platform icons */}
                <div className="flex flex-col items-center gap-3 pt-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        Bring your games from
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {PLATFORM_BRANDS.map((brand) => (
                            <div
                                key={brand.key}
                                title={brand.name}
                                className="flex size-12 items-center justify-center rounded-2xl text-white shadow-md ring-1 ring-white/10 transition-transform hover:-translate-y-0.5 hover:scale-105"
                                style={{ backgroundImage: brand.gradient }}
                            >
                                {brand.glyph}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Steam and PlayStation available now, more platforms
                        coming soon.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="grid w-full grid-cols-2 gap-3 pt-8 sm:grid-cols-4">
                    {FEATURES.map((f) => (
                        <div
                            key={f.title}
                            className="flex flex-col items-center gap-2 rounded-xl border bg-card/60 p-4 text-center backdrop-blur"
                        >
                            <f.icon className="size-5 text-primary" />
                            <p className="text-sm font-semibold">{f.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {f.body}
                            </p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
                <p>
                    Developed by{" "}
                    <span className="font-medium text-foreground">
                        andimags
                    </span>{" "}
                    · SavePoint v1.0.0 (stable)
                </p>
            </footer>
        </div>
    );
}
