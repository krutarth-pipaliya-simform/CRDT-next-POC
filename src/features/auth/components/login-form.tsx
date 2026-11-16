"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockInput } from "@/components/paddock/paddock-field";
import { loginAction } from "@/features/auth/actions/login";
import { resendVerificationAction } from "@/features/auth/actions/resend-verification";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AuthNotice } from "@/features/auth/components/auth-notice";
import { AUTH_TEXT_LINK } from "@/features/auth/components/auth-styles";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { DevVerifyQuickLink } from "@/features/auth/components/dev-verify-quick-link";
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";

export function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl =
        searchParams.get("callbackUrl") || DEFAULT_LOGIN_REDIRECT;
    const [state, formAction] = useActionState(loginAction, null);
    const [isPending, startTransition] = useTransition();
    const [resendStatus, setResendStatus] = useState<{
        type: "success" | "error";
        message: string;
        verifyUrl?: string;
    } | null>(null);

    const handleResend = () => {
        if (state?.unverifiedEmail) {
            const emailToResend = state.unverifiedEmail;
            startTransition(async () => {
                const result = await resendVerificationAction(emailToResend);
                if (result.success) {
                    setResendStatus({
                        type: "success",
                        message: result.message,
                        verifyUrl: result.verifyUrl,
                    });
                } else {
                    setResendStatus({ type: "error", message: result.error });
                }
            });
        }
    };

    return (
        <div className="flex flex-col">
            <AuthHeading serif="Welcome" heavy="back" className="mb-3.5" />
            <p className="m-0 mb-7.5 text-paddock-subtle">
                Pick up wherever your team left off.
            </p>

            {state?.error === "unverified" && (
                <div
                    role="alert"
                    className="mb-5 flex flex-col gap-2.5 rounded-paddock border-[1.5px] border-paddock-ink bg-paddock-sheet px-4 py-3.5"
                >
                    <span className="font-bold">
                        Your email is not verified.
                    </span>
                    {state.unverifiedEmail ? (
                        <span className="text-sm text-paddock-subtle">
                            Open the link we sent to {state.unverifiedEmail}, or
                            send a fresh one.
                        </span>
                    ) : null}

                    {resendStatus &&
                        (resendStatus.type === "success" ? (
                            <span
                                role="status"
                                className="flex items-start gap-2 text-sm font-semibold"
                            >
                                <Check
                                    aria-hidden="true"
                                    className="mt-0.5 size-4 shrink-0"
                                    strokeWidth={2.4}
                                />
                                {resendStatus.message}
                            </span>
                        ) : (
                            <span className="text-sm font-semibold text-paddock-danger">
                                {resendStatus.message}
                            </span>
                        ))}
                    {resendStatus?.verifyUrl && (
                        <DevVerifyQuickLink
                            verifyUrl={resendStatus.verifyUrl}
                        />
                    )}

                    <PaddockButton
                        variant="outline"
                        size="sm"
                        voice="plain"
                        onClick={handleResend}
                        disabled={isPending}
                        className="self-start"
                    >
                        {isPending ? "Sending..." : "Resend verification email"}
                    </PaddockButton>
                </div>
            )}

            <form action={formAction} className="flex flex-col gap-4">
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
                    autoComplete="current-password"
                    required
                />
                <Link
                    href="/forgot-password"
                    className={`${AUTH_TEXT_LINK} -mt-1.5 self-end text-sm`}
                >
                    Forgot password?
                </Link>

                {state?.error && state.error !== "unverified" && (
                    <AuthNotice tone="danger">{state.error}</AuthNotice>
                )}

                <AuthSubmitButton
                    pendingText="Signing in…"
                    className="mt-1.5 w-full"
                >
                    Sign in
                </AuthSubmitButton>
            </form>

            <SocialAuthButtons callbackUrl={callbackUrl} />

            <p className="mt-7 mb-0 text-sm">
                New here?{" "}
                <Link href="/register" className={AUTH_TEXT_LINK}>
                    Create an account
                </Link>
            </p>
        </div>
    );
}
