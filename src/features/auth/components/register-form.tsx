"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerAction } from "@/features/auth/actions/register";
import { DevVerifyQuickLink } from "@/features/auth/components/dev-verify-quick-link";
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons";

export function RegisterForm() {
    const [state, formAction] = useActionState(registerAction, null);

    return (
        <div className="w-full max-w-sm flex flex-col gap-8">
            <div>
                <h1 className="text-[30px] font-semibold tracking-[-0.024em] text-brand-ink">
                    Create your account
                </h1>
                <p className="text-sm text-brand-subtle mt-1.5">
                    Then invite the people you write with.
                </p>
            </div>

            {state?.success ? (
                <div className="flex flex-col gap-6">
                    <Alert intent="success">{state.message}</Alert>
                    {state.verifyUrl && (
                        <DevVerifyQuickLink verifyUrl={state.verifyUrl} />
                    )}
                    <div className="text-sm text-brand-subtle">
                        <Link
                            href="/login"
                            className="text-brand-accent underline underline-offset-4 hover:text-brand-ink"
                        >
                            Back to sign in
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <form action={formAction} className="flex flex-col gap-6">
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            label="Name"
                            placeholder="Jane Doe"
                            required
                        />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            label="Email"
                            placeholder="name@example.com"
                            required
                        />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                        />

                        {state?.error && (
                            <Alert intent="danger">{state.error}</Alert>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full justify-between"
                            >
                                Create account
                            </Button>
                        </div>
                    </form>

                    <SocialAuthButtons callbackUrl="/" />

                    <div className="text-sm text-brand-subtle">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-brand-accent underline underline-offset-4 hover:text-brand-ink"
                        >
                            Sign in
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
