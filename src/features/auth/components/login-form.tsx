"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/features/auth/actions/login";
import { resendVerificationAction } from "@/features/auth/actions/resend-verification";
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
        <div className="w-full max-w-sm flex flex-col gap-12">
            <div>
                <h2 className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle mb-4">
                    Welcome Back
                </h2>
                <h1 className="text-3xl font-medium tracking-tight text-brand-ink">
                    Sign In
                </h1>
            </div>

            <form action={formAction} className="flex flex-col gap-6">
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
                />

                {state?.error && state.error !== "unverified" && (
                    <Alert intent="danger">{state.error}</Alert>
                )}

                {state?.error === "unverified" && (
                    <div className="flex flex-col gap-2">
                        <Alert intent="danger">
                            Your email is not verified.
                        </Alert>
                        {resendStatus && (
                            <div className="flex flex-col gap-2">
                                <Alert
                                    intent={
                                        resendStatus.type === "success"
                                            ? "success"
                                            : "danger"
                                    }
                                >
                                    {resendStatus.message}
                                </Alert>
                                {resendStatus.verifyUrl && (
                                    <DevVerifyQuickLink
                                        verifyUrl={resendStatus.verifyUrl}
                                    />
                                )}
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleResend}
                            disabled={isPending}
                        >
                            {isPending
                                ? "Sending..."
                                : "Resend Verification Email"}
                        </Button>
                    </div>
                )}

                <div className="pt-2">
                    <Button
                        type="submit"
                        withArrow
                        className="w-full justify-between"
                    >
                        Sign In
                    </Button>
                </div>
            </form>

            <SocialAuthButtons callbackUrl={callbackUrl} />

            <div className="font-brand-mono text-xs text-brand-subtle">
                Don&apos;t have an account?{" "}
                <Link
                    href="/register"
                    className="text-brand-accent underline underline-offset-4 hover:text-brand-ink uppercase tracking-wider"
                >
                    Sign Up
                </Link>
            </div>
        </div>
    );
}
