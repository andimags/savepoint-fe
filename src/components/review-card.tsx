"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type ReviewView } from "@/lib/api-client";
import {
    useAddReviewComment,
    useDeleteComment,
    useReviewComments,
    useToggleReviewLike,
} from "@/hooks/use-reviews";
import { useCurrentUserId } from "@/hooks/use-token";
import { StarRating } from "@/components/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ReviewCard({
    review,
    canDelete = false,
    onDelete,
    showGame = false,
}: {
    review: ReviewView;
    canDelete?: boolean;
    onDelete?: () => void;
    showGame?: boolean;
}) {
    const myUserId = useCurrentUserId();

    const [liked, setLiked] = useState(review.likedByMe);
    const [likeCount, setLikeCount] = useState(review.likeCount);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentDraft, setCommentDraft] = useState("");

    const toggleLikeMutation = useToggleReviewLike();
    const addComment = useAddReviewComment(review.id);
    const deleteCommentMutation = useDeleteComment(review.id);
    const { data: commentsData } = useReviewComments(
        review.id,
        1,
        commentsOpen,
    );

    const comments = commentsData?.items ?? null;
    const commentCount = commentsData?.total ?? review.commentCount;

    function toggleLike() {
        // Optimistic: flip immediately, revert if the request fails.
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikeCount((c) => c + (wasLiked ? -1 : 1));
        toggleLikeMutation.mutate(
            { reviewId: review.id, liked: wasLiked },
            {
                onError: () => {
                    setLiked(wasLiked);
                    setLikeCount((c) => c + (wasLiked ? 1 : -1));
                    toast.error("Failed to update like.");
                },
            },
        );
    }

    function submitComment(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!commentDraft.trim()) return;
        addComment.mutate(commentDraft.trim(), {
            onSuccess: () => setCommentDraft(""),
            onError: () => toast.error("Failed to post comment."),
        });
    }

    return (
        <Card>
            <CardContent className="space-y-3 pt-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                            <AvatarFallback className="bg-primary/15 text-xs text-primary">
                                {review.author.username
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <Link
                                href={`/users/${review.author.id}`}
                                className="text-sm font-medium hover:underline"
                            >
                                {review.author.username}
                            </Link>
                            {showGame && review.game && (
                                <>
                                    <span className="text-sm text-muted-foreground">
                                        {" "}
                                        on{" "}
                                    </span>
                                    <Link
                                        href={`/games/${review.game.id}`}
                                        className="text-sm font-medium hover:underline"
                                    >
                                        {review.game.name}
                                    </Link>
                                </>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {new Date(
                                    review.createdAt,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {review.rating != null && (
                            <StarRating
                                value={review.rating}
                                readOnly
                                size="sm"
                            />
                        )}
                        {canDelete && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onDelete}
                                aria-label="Delete review"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <p className="whitespace-pre-line text-sm leading-relaxed">
                    {review.body}
                </p>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleLike}
                        className={cn(
                            "flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                            liked && "text-brand hover:text-brand",
                        )}
                    >
                        <Heart
                            className={cn("size-4", liked && "fill-brand")}
                        />
                        {likeCount}
                    </button>
                    <button
                        type="button"
                        onClick={() => setCommentsOpen((open) => !open)}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <MessageSquare className="size-4" />
                        {commentCount}
                    </button>
                </div>

                {commentsOpen && (
                    <div className="space-y-3 border-t pt-3">
                        {comments?.map((comment) => (
                            <div
                                key={comment.id}
                                className="flex items-start justify-between gap-2"
                            >
                                <p className="text-sm">
                                    <Link
                                        href={`/users/${comment.author.id}`}
                                        className="font-medium hover:underline"
                                    >
                                        {comment.author.username}
                                    </Link>{" "}
                                    <span className="text-muted-foreground">
                                        {comment.body}
                                    </span>
                                </p>
                                {comment.author.id === myUserId && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteCommentMutation.mutate(
                                                comment.id,
                                            )
                                        }
                                        className="text-muted-foreground hover:text-destructive"
                                        aria-label="Delete comment"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <form onSubmit={submitComment} className="flex gap-2">
                            <Input
                                value={commentDraft}
                                onChange={(e) =>
                                    setCommentDraft(e.target.value)
                                }
                                placeholder="Add a comment..."
                                className="h-8"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!commentDraft.trim()}
                            >
                                Post
                            </Button>
                        </form>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
