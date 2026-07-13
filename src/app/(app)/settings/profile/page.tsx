import { ProfileSettingsClient } from "./profile-settings-client";
import { FavoritesEditor } from "./favorites-editor";

export default function ProfileSettingsPage() {
    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Profile settings
                </h1>
                <p className="text-sm text-muted-foreground">
                    Update how you appear on SavePoint and manage your account.
                </p>
            </div>
            <ProfileSettingsClient />
            <FavoritesEditor />
        </div>
    );
}
