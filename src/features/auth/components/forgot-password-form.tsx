"use client";

import { useActionState } from "react";
import Link from "next/link";

import { PaddockInput } from "@/components/paddock/paddock-field";
import { requestPasswordResetAction } from "@/features/auth/actions/request-password-reset";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AuthNotice } from "@/features/auth/components/auth-notice";
import { AUTH_TEXT_LINK } from "@/features/auth/components/auth-styles";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { DevVerifyQuickLink } from "@/features/auth/components/dev-verify-quick-link";

export function ForgotPasswordForm() {
    const [state, formAction] = useActionState(
        requestPasswordResetAction,
        null,
    );

    return (
        <div className="flex flex-col">
            <AuthHeading
                serif="Forgot your"
                heavy="password"
                className="mb-3.5"
            />
            <p className="m-0 mb-7.5 text-paddock-subtle">
                Enter the email you sign in with and we will send you a link to
                choose a new one.
            </p>

            {state?.success ? (
                <div className="flex flex-col gap-4">
                    <AuthNotice tone="success">{state.message}</AuthNotice>
                    {state.resetUrl && (
                        <DevVerifyQuickLink
                            verifyUrl={state.resetUrl}
                            label="Reset password now"
                        />
                    )}
                </div>
            ) : (
                <form action={formAction} className="flex flex-col gap-4">
                    <PaddockInput
                        id="email"
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        required
                    />

                    {state?.success === false && (
                        <AuthNotice tone="danger">{state.error}</AuthNotice>
                    )}

                    <AuthSubmitButton
                        pendingText="Sending…"
                        className="mt-1.5 w-full"
                    >
                        Send reset link
                    </AuthSubmitButton>
                </form>
            )}

            <p className="mt-7 mb-0 text-sm">
                Remembered it?{" "}
                <Link href="/login" className={AUTH_TEXT_LINK}>
                    Back to log in
                </Link>
            </p>
        </div>
    );
}
