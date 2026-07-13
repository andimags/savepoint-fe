"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type RegisterState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/logo";

const initialState: RegisterState = {};

export default function RegisterPage() {
    const [state, formAction, pending] = useActionState(
        registerAction,
        initialState,
    );

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-app-glow px-4">
            <Link href="/">
                <Logo />
            </Link>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-xl">
                        Create your account
                    </CardTitle>
                    <CardDescription>
                        Track what you play, one save at a time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                required
                                minLength={3}
                                maxLength={20}
                                pattern="[a-zA-Z0-9_]+"
                                title="Letters, numbers, and underscores only"
                                autoComplete="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                        </div>
                        {state?.error && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {state.error}
                                </AlertDescription>
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            disabled={pending}
                            className="w-full"
                        >
                            {pending ? "Creating account..." : "Sign up"}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-primary hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
