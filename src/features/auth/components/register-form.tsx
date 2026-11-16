"use client";

import { useActionState } from "react";
import Link from "next/link";

import { PaddockInput } from "@/components/paddock/paddock-field";
import { registerAction } from "@/features/auth/actions/register";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AuthNotice } from "@/features/auth/components/auth-notice";
import { AUTH_TEXT_LINK } from "@/features/auth/components/auth-styles";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { DevVerifyQuickLink } from "@/features/auth/components/dev-verify-quick-link";
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons";

export function RegisterForm() {
    const [state, formAction] = useActionState(registerAction, null);

    return (
        <div className="flex flex-col">
            <AuthHeading
                serif="Create your"
                heavy="account"
                className="mb-3.5"
            />
            <p className="m-0 mb-7.5 text-paddock-subtle">
                Then invite the people you write with.
            </p>

            {state?.success ? (
                <div className="flex flex-col gap-4">
                    <AuthNotice tone="success">{state.message}</AuthNotice>
                    {state.verifyUrl && (
                        <DevVerifyQuickLink verifyUrl={state.verifyUrl} />
                    )}
                    <p className="m-0 text-sm">
                        <Link href="/login" className={AUTH_TEXT_LINK}>
                            Back to log in
                        </Link>
                    </p>
                </div>
            ) : (
                <>
                    <form action={formAction} className="flex flex-col gap-4">
                        <PaddockInput
                            id="name"
                            name="name"
                            type="text"
                            label="Name"
                            placeholder="Jane Doe"
                            autoComplete="name"
                            required
                        />
                        <PaddockInput
                            id="email"
                            name="email"
                            type="email"
                            label="Email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            required
                        />
                        <PaddockInput
                            id="password"
                            name="password"
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            hint="At least 8 characters."
                            autoComplete="new-password"
                            required
                            minLength={8}
                        />

                        {state?.error && (
                            <AuthNotice tone="danger">{state.error}</AuthNotice>
                        )}

                        <AuthSubmitButton className="mt-1.5 w-full">
                            Create account
                        </AuthSubmitButton>
                    </form>

                    <SocialAuthButtons callbackUrl="/" />

                    <p className="mt-7 mb-0 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className={AUTH_TEXT_LINK}>
                            Log in
                        </Link>
                    </p>
                </>
            )}
        </div>
    );
}
