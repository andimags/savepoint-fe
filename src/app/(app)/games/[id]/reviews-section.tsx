'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  createReview,
  deleteReview,
  getGameReviews,
  type Paginated,
  type ReviewView,
} from '@/lib/api-client';
import { ReviewCard } from '@/components/review-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

export function ReviewsSection({ gameId }: { gameId: string }) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const myUserId = session?.user?.id;

  const [reviews, setReviews] = useState<Paginated<ReviewView> | null>(null);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    setReviews(await getGameReviews(token, gameId, page));
  }, [token, gameId, page]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !draft.trim()) return;
    setSubmitting(true);
    try {
      await createReview(token, gameId, draft.trim());
      setDraft('');
      toast.success('Review posted.');
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to post review.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!token) return;
    await deleteReview(token, reviewId);
    toast.success('Review deleted.');
    await refresh();
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
        <Button type="submit" disabled={submitting || !draft.trim()}>
          {submitting ? 'Posting...' : 'Post review'}
        </Button>
      </form>

      {!reviews ? (
        <Skeleton className="h-32 w-full" />
      ) : reviews.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet — be the first.</p>
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
          {reviews.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {reviews.page} of {reviews.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= reviews.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
