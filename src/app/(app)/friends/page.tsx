import { FriendsClient } from "./friends-client";

export default function FriendsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
            <FriendsClient />
        </div>
    );
}
