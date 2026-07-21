"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
    useCreateReview,
    useDeleteReview,
    useGameReviews,
} from "@/hooks/use-reviews";
import { useCurrentUserId } from "@/hooks/use-token";
import { ReviewCard } from "@/components/review-card";
import { Pager } from "@/components/pager";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewsSection({ gameId }: { gameId: string }) {
    const myUserId = useCurrentUserId();

    const [page, setPage] = useState(1);
    const [draft, setDraft] = useState("");

    const { data: reviews } = useGameReviews(gameId, page);
    const createReview = useCreateReview(gameId);
    const deleteReview = useDeleteReview(gameId);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!draft.trim()) return;
        createReview.mutate(draft.trim(), {
            onSuccess: () => {
                setDraft("");
                toast.success("Review posted.");
            },
            onError: (error) =>
                toast.error(getErrorMessage(error, "Failed to post review.")),
        });
    }

    function handleDelete(reviewId: string) {
        deleteReview.mutate(reviewId, {
            onSuccess: () => toast.success("Review deleted."),
        });
    }

    return (
        <section className="space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">Reviews</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
                <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write your review..."
                    rows={4}
                />
                <Button
                    type="submit"
                    disabled={createReview.isPending || !draft.trim()}
                >
                    {createReview.isPending ? "Posting..." : "Post review"}
                </Button>
            </form>

            {!reviews ? (
                <Skeleton className="h-32 w-full" />
            ) : reviews.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No reviews yet, be the first.
                </p>
            ) : (
                <div className="space-y-4">
                    {reviews.items.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            canDelete={review.author.id === myUserId}
                            onDelete={() => handleDelete(review.id)}
                        />
                    ))}
                    <Pager
                        page={page}
                        totalPages={reviews.totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </section>
    );
}
