import { ProfileClient } from "./profile-client";

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ProfileClient userId={id} />;
}
