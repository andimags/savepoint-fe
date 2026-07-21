"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { href: "/home", label: "Home" },
    { href: "/games", label: "Games" },
    { href: "/library", label: "Library" },
    { href: "/diary", label: "Diary" },
    { href: "/lists", label: "Lists" },
    { href: "/friends", label: "Friends" },
    { href: "/stats", label: "Stats" },
];

export function AppShell({
    userId,
    username,
    avatarUrl,
    children,
}: {
    userId: string;
    username: string;
    avatarUrl?: string | null;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const q = query.trim();
        if (q) router.push(`/games?q=${encodeURIComponent(q)}`);
    }

    return (
        <div className="min-h-screen bg-app-glow">
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:gap-6">
                    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() =>
                                            setMobileNavOpen(false)
                                        }
                                        className={cn(
                                            "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                                            pathname.startsWith(link.href) &&
                                                "bg-accent text-foreground",
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <Link href="/home" className="shrink-0">
                        <Logo />
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                                    pathname.startsWith(link.href) &&
                                        "bg-accent text-foreground",
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <form
                        onSubmit={handleSearch}
                        className="ml-auto w-full min-w-0 max-w-xs"
                    >
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search games..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="h-8 pl-8"
                            />
                        </div>
                    </form>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <Avatar className="size-8">
                                {avatarUrl && (
                                    <AvatarImage src={avatarUrl} alt="" />
                                )}
                                <AvatarFallback className="bg-primary/15 text-sm text-primary">
                                    {username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="truncate">
                                {username}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => router.push(`/users/${userId}`)}
                            >
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() =>
                                    router.push("/settings/profile")
                                }
                            >
                                Edit profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => router.push("/wrapped")}
                            >
                                Wrapped
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() =>
                                    router.push("/settings/connections")
                                }
                            >
                                Connections
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => signOut({ redirectTo: "/" })}
                            >
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
    );
}
