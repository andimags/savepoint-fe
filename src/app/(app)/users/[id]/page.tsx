import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { auth } from "@/auth";
import { getProfile } from "@/lib/api/social";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    // Prefetch the profile header on the server so the page paints immediately; the tabbed content
    // (games, reviews, lists, followers) hydrates client-side.
    const queryClient = getQueryClient();
    const token = session?.accessToken;
    if (token) {
        await queryClient.prefetchQuery({
            queryKey: queryKeys.users.profile(id),
            queryFn: () => getProfile(token, id),
        });
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProfileClient userId={id} />
        </HydrationBoundary>
    );
}
