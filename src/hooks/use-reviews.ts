"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    addReviewComment,
    createReview,
    deleteComment,
    deleteReview,
    getGameReviews,
    getReviewComments,
    likeReview,
    unlikeReview,
} from "@/lib/api/reviews";
import { queryKeys } from "@/lib/query-keys";
import { useToken } from "./use-token";

export function useGameReviews(gameId: string, page: number) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.games.reviews(gameId, page),
        queryFn: () => getGameReviews(token!, gameId, page),
        enabled: !!token && !!gameId,
    });
}

export function useCreateReview(gameId: string) {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: string) => createReview(token!, gameId, body),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.games.detail(gameId),
            }),
    });
}

export function useDeleteReview(gameId: string) {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reviewId: string) => deleteReview(token!, reviewId),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.games.detail(gameId),
            }),
    });
}

export function useReviewComments(
    reviewId: string,
    page: number,
    open: boolean,
) {
    const token = useToken();
    return useQuery({
        queryKey: queryKeys.reviews.comments(reviewId, page),
        queryFn: () => getReviewComments(token!, reviewId, page),
        enabled: !!token && open,
    });
}

export function useAddReviewComment(reviewId: string) {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: string) => addReviewComment(token!, reviewId, body),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.comments(reviewId, 1),
            }),
    });
}

export function useDeleteComment(reviewId: string) {
    const token = useToken();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId: string) => deleteComment(token!, commentId),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.comments(reviewId, 1),
            }),
    });
}

export function useToggleReviewLike() {
    const token = useToken();
    return useMutation({
        mutationFn: (input: { reviewId: string; liked: boolean }) =>
            input.liked
                ? unlikeReview(token!, input.reviewId)
                : likeReview(token!, input.reviewId),
    });
}
