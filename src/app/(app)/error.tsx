"use client";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for the app. Catches render/data errors thrown by any page in the
 * group so a single failing section shows a recoverable message instead of a blank screen.
 */
export default function AppError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">
                    We couldn&apos;t load this page. Please try again.
                </p>
            </div>
            <Button onClick={reset}>Try again</Button>
        </div>
    );
}
