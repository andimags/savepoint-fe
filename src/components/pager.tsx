import { Button } from "@/components/ui/button";

/**
 * Previous/next pagination shared by every paginated list. Renders nothing for a single page so
 * callers can drop it in unconditionally.
 */
export function Pager({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between">
            <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                Previous
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </div>
    );
}
