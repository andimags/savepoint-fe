import { apiFetch } from "./http";

import type { CommentView, Paginated, ReviewView } from "@/types/api";

export const getGameReviews = (token: string, gameId: string, page = 1) =>
    apiFetch<Paginated<ReviewView>>(
        token,
        `/games/${gameId}/reviews?page=${page}`,
    );
export const getRecentReviews = (token: string, page = 1, limit = 10) =>
    apiFetch<Paginated<ReviewView>>(
        token,
        `/reviews/recent?page=${page}&limit=${limit}`,
    );
export const getUserReviews = (
    token: string,
    userId: string,
    page = 1,
    limit = 10,
) =>
    apiFetch<Paginated<ReviewView>>(
        token,
        `/users/${userId}/reviews?page=${page}&limit=${limit}`,
    );
export const createReview = (token: string, gameId: string, body: string) =>
    apiFetch<ReviewView>(token, `/games/${gameId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ body }),
    });
export const updateReview = (token: string, reviewId: string, body: string) =>
    apiFetch(token, `/reviews/${reviewId}`, {
        method: "PATCH",
        body: JSON.stringify({ body }),
    });
export const deleteReview = (token: string, reviewId: string) =>
    apiFetch<void>(token, `/reviews/${reviewId}`, { method: "DELETE" });
export const likeReview = (token: string, reviewId: string) =>
    apiFetch<void>(token, `/reviews/${reviewId}/like`, { method: "POST" });
export const unlikeReview = (token: string, reviewId: string) =>
    apiFetch<void>(token, `/reviews/${reviewId}/like`, { method: "DELETE" });
export const getReviewComments = (token: string, reviewId: string, page = 1) =>
    apiFetch<Paginated<CommentView>>(
        token,
        `/reviews/${reviewId}/comments?page=${page}&limit=50`,
    );
export const addReviewComment = (
    token: string,
    reviewId: string,
    body: string,
) =>
    apiFetch<CommentView>(token, `/reviews/${reviewId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
    });
export const deleteComment = (token: string, commentId: string) =>
    apiFetch<void>(token, `/comments/${commentId}`, { method: "DELETE" });
