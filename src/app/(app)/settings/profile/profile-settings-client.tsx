"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    changePassword,
    getMe,
    updateProfile,
    uploadAvatar,
    type Me,
} from "@/lib/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function ProfileSettingsClient() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const token = session?.accessToken;

    const [me, setMe] = useState<Me | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [steamUsername, setSteamUsername] = useState("");
    const [psnUsername, setPsnUsername] = useState("");
    const [savingLinkedAccounts, setSavingLinkedAccounts] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!token) return;
        getMe(token)
            .then((data) => {
                setMe(data);
                setDisplayName(data.displayName ?? "");
                setUsername(data.username);
                setSteamUsername(data.steamUsername ?? "");
                setPsnUsername(data.psnUsername ?? "");
            })
            .catch(() => toast.error("Failed to load profile."));
    }, [token]);

    async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token) return;
        setSavingProfile(true);
        try {
            const updated = await updateProfile(token, {
                displayName,
                username,
            });
            setMe(updated);
            toast.success("Profile updated.");
            // Refresh the session so the nav reflects the new username immediately
            await update({ username: updated.username });
            router.refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update profile.",
            );
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleSaveLinkedAccounts(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        if (!token) return;
        setSavingLinkedAccounts(true);
        try {
            const updated = await updateProfile(token, {
                steamUsername,
                psnUsername,
            });
            setMe(updated);
            setSteamUsername(updated.steamUsername ?? "");
            setPsnUsername(updated.psnUsername ?? "");
            toast.success("Linked account names updated.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update linked accounts.",
            );
        } finally {
            setSavingLinkedAccounts(false);
        }
    }

    async function handleAvatarChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!token || !file) return;
        setUploadingAvatar(true);
        try {
            const updated = await uploadAvatar(token, file);
            setMe(updated);
            toast.success("Profile picture updated.");
            // The nav avatar is rendered from the server layout, so refresh to pick up the new image.
            router.refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to upload picture.",
            );
        } finally {
            setUploadingAvatar(false);
        }
    }

    async function handleChangePassword(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        if (!token) return;
        setSavingPassword(true);
        try {
            await changePassword(token, currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            toast.success("Password changed.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to change password.",
            );
        } finally {
            setSavingPassword(false);
        }
    }

    if (!me) return <Skeleton className="h-64 w-full" />;

    const avatarInitials = (me.displayName || me.username)
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Profile picture</CardTitle>
                    <CardDescription>
                        Upload a picture to personalize your profile.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Avatar className="size-20">
                            {me.avatarUrl && (
                                <AvatarImage src={me.avatarUrl} alt="" />
                            )}
                            <AvatarFallback className="bg-primary/15 text-xl text-primary">
                                {avatarInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={uploadingAvatar}
                            >
                                {uploadingAvatar
                                    ? "Uploading..."
                                    : me.avatarUrl
                                      ? "Change picture"
                                      : "Upload picture"}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                JPEG, PNG, WebP, or GIF. Max 5MB.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Public profile</CardTitle>
                    <CardDescription>
                        Your display name and username are visible to others.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display name</Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="How your name appears"
                                maxLength={50}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                minLength={3}
                                maxLength={20}
                                pattern="[a-zA-Z0-9_]+"
                                title="Letters, numbers, and underscores only"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={me.email} disabled />
                        </div>
                        <Button type="submit" disabled={savingProfile}>
                            {savingProfile ? "Saving..." : "Save changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Linked accounts</CardTitle>
                    <CardDescription>
                        Choose how your Steam and PlayStation usernames appear on
                        your profile. When set, they appear next to accounts
                        you&apos;ve synced on the{" "}
                        <Link
                            href="/settings/connections"
                            className="font-medium underline underline-offset-2"
                        >
                            Connections
                        </Link>{" "}
                        page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSaveLinkedAccounts}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="steamUsername">
                                Steam username
                            </Label>
                            <Input
                                id="steamUsername"
                                value={steamUsername}
                                onChange={(e) =>
                                    setSteamUsername(e.target.value)
                                }
                                placeholder="How your Steam account appears"
                                maxLength={40}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="psnUsername">
                                PlayStation username
                            </Label>
                            <Input
                                id="psnUsername"
                                value={psnUsername}
                                onChange={(e) => setPsnUsername(e.target.value)}
                                placeholder="How your PlayStation account appears"
                                maxLength={40}
                            />
                        </div>
                        <Button type="submit" disabled={savingLinkedAccounts}>
                            {savingLinkedAccounts ? "Saving..." : "Save changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Change password</CardTitle>
                    <CardDescription>
                        Use at least 8 characters.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">
                                Current password
                            </Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={savingPassword}>
                            {savingPassword ? "Updating..." : "Change password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
