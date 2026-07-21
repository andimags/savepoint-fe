"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Me } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import {
    changePasswordSchema,
    linkedAccountsSchema,
    profileSchema,
    type ChangePasswordValues,
    type LinkedAccountsValues,
    type ProfileValues,
} from "@/lib/schemas/auth";
import {
    useChangePassword,
    useMe,
    useUpdateProfile,
    useUploadAvatar,
} from "@/hooks/use-me";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function ProfileSettingsClient() {
    const { data: me } = useMe();

    if (!me) return <Skeleton className="h-64 w-full" />;

    return (
        <div className="space-y-6">
            <AvatarCard me={me} />
            <PublicProfileForm me={me} />
            <LinkedAccountsForm me={me} />
            <ChangePasswordForm />
        </div>
    );
}

function AvatarCard({ me }: { me: Me }) {
    const router = useRouter();
    const uploadAvatar = useUploadAvatar();
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const avatarInitials = (me.displayName || me.username)
        .slice(0, 2)
        .toUpperCase();

    function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        uploadAvatar.mutate(file, {
            onSuccess: () => {
                toast.success("Profile picture updated.");
                // The nav avatar renders from the server layout, so refresh to pick up the image.
                router.refresh();
            },
            onError: (error) =>
                toast.error(getErrorMessage(error, "Failed to upload picture.")),
        });
    }

    return (
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
                            disabled={uploadAvatar.isPending}
                        >
                            {uploadAvatar.isPending
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
    );
}

function PublicProfileForm({ me }: { me: Me }) {
    const router = useRouter();
    const { update } = useSession();
    const updateProfile = useUpdateProfile();

    const form = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: me.displayName ?? "",
            username: me.username,
        },
    });

    function onSubmit(values: ProfileValues) {
        updateProfile.mutate(
            { displayName: values.displayName, username: values.username },
            {
                onSuccess: async (updated) => {
                    form.reset({
                        displayName: updated.displayName ?? "",
                        username: updated.username,
                    });
                    toast.success("Profile updated.");
                    // Reflect the new username in the nav without a re-login.
                    await update({ username: updated.username });
                    router.refresh();
                },
                onError: (error) =>
                    toast.error(
                        getErrorMessage(error, "Failed to update profile."),
                    ),
            },
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Public profile</CardTitle>
                <CardDescription>
                    Your display name and username are visible to others.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                        noValidate
                    >
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="How your name appears"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={me.email} disabled />
                        </div>
                        <Button
                            type="submit"
                            disabled={updateProfile.isPending}
                        >
                            {updateProfile.isPending
                                ? "Saving..."
                                : "Save changes"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function LinkedAccountsForm({ me }: { me: Me }) {
    const updateProfile = useUpdateProfile();

    const form = useForm<LinkedAccountsValues>({
        resolver: zodResolver(linkedAccountsSchema),
        defaultValues: {
            steamUsername: me.steamUsername ?? "",
            psnUsername: me.psnUsername ?? "",
        },
    });

    function onSubmit(values: LinkedAccountsValues) {
        updateProfile.mutate(
            {
                steamUsername: values.steamUsername,
                psnUsername: values.psnUsername,
            },
            {
                onSuccess: (updated) => {
                    form.reset({
                        steamUsername: updated.steamUsername ?? "",
                        psnUsername: updated.psnUsername ?? "",
                    });
                    toast.success("Linked account names updated.");
                },
                onError: (error) =>
                    toast.error(
                        getErrorMessage(
                            error,
                            "Failed to update linked accounts.",
                        ),
                    ),
            },
        );
    }

    return (
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
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                        noValidate
                    >
                        <FormField
                            control={form.control}
                            name="steamUsername"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Steam username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="How your Steam account appears"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="psnUsername"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PlayStation username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="How your PlayStation account appears"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={updateProfile.isPending}
                        >
                            {updateProfile.isPending
                                ? "Saving..."
                                : "Save changes"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function ChangePasswordForm() {
    const changePassword = useChangePassword();

    const form = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { currentPassword: "", newPassword: "" },
    });

    function onSubmit(values: ChangePasswordValues) {
        changePassword.mutate(values, {
            onSuccess: () => {
                form.reset({ currentPassword: "", newPassword: "" });
                toast.success("Password changed.");
            },
            onError: (error) =>
                toast.error(getErrorMessage(error, "Failed to change password.")),
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Change password</CardTitle>
                <CardDescription>Use at least 8 characters.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                        noValidate
                    >
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            autoComplete="current-password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            autoComplete="new-password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={changePassword.isPending}
                        >
                            {changePassword.isPending
                                ? "Updating..."
                                : "Change password"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
