"use client";

import { useActionState } from "react";
import Link from "next/link";

import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import { PaddockInput } from "@/components/paddock/paddock-field";
import { resetPasswordAction } from "@/features/auth/actions/reset-password";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AuthNotice } from "@/features/auth/components/auth-notice";
import { AUTH_TEXT_LINK } from "@/features/auth/components/auth-styles";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";

export interface ResetPasswordFormProps {
    token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const [state, formAction] = useActionState(resetPasswordAction, null);

    return (
        <div className="flex flex-col">
            <AuthHeading
                serif="Choose a new"
                heavy="password"
                className="mb-3.5"
            />

            {state?.success ? (
                <div className="flex flex-col gap-4">
                    <AuthNotice tone="success">{state.message}</AuthNotice>
                    <PaddockLinkButton href="/login" className="self-start">
                        Log in
                    </PaddockLinkButton>
                </div>
            ) : (
                <>
                    <p className="m-0 mb-7.5 text-paddock-subtle">
                        The link works once. Other devices that are already
                        signed in stay signed in.
                    </p>
                    <form action={formAction} className="flex flex-col gap-4">
                        <input type="hidden" name="token" value={token} />
                        <PaddockInput
                            id="password"
                            name="password"
                            type="password"
                            label="New password"
                            placeholder="••••••••"
                            hint="At least 8 characters."
                            autoComplete="new-password"
                            required
                            minLength={8}
                        />
                        <PaddockInput
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            label="Confirm new password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            minLength={8}
                        />

                        {state?.success === false && (
                            <AuthNotice tone="danger">{state.error}</AuthNotice>
                        )}

                        <AuthSubmitButton
                            pendingText="Saving…"
                            className="mt-1.5 w-full"
                        >
                            Set new password
                        </AuthSubmitButton>
                    </form>

                    <p className="mt-7 mb-0 text-sm">
                        <Link
                            href="/forgot-password"
                            className={AUTH_TEXT_LINK}
                        >
                            Request a new link
                        </Link>
                    </p>
                </>
            )}
        </div>
    );
}
