"use client";

import { useActionState, useState, useTransition } from "react";
import { loginAction } from "@/features/auth/actions/login";
import { resendVerificationAction } from "@/features/auth/actions/resend-verification";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
            startTransition(async () => {
                const result = await resendVerificationAction(
                    state.unverifiedEmail as string,
                );
                if (result.success) {
                    setResendStatus({
                        type: "success",
                        message: result.message!,
                        verifyUrl: result.verifyUrl,
                    });
                } else {
                    setResendStatus({ type: "error", message: result.error! });
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
                                    <div className="flex flex-col gap-2 p-3 bg-brand-muted border-2 border-brand-border rounded-brand">
                                        <span className="font-brand-mono text-[10px] uppercase tracking-widest text-brand-subtle">
                                            Development Quick Link
                                        </span>
                                        <a
                                            href={resendStatus.verifyUrl}
                                            className="inline-flex items-center justify-center font-brand-mono font-semibold text-xs uppercase tracking-widest bg-brand-ink text-brand-surface py-2 px-3 rounded-brand hover:bg-brand-accent transition-colors"
                                        >
                                            Verify Email Now →
                                        </a>
                                    </div>
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

            <div className="flex flex-col gap-4">
                <Separator label="Or continue with" />
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() =>
                            signIn("google", { redirectTo: callbackUrl })
                        }
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 shrink-0"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span>Google</span>
                        </span>
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() =>
                            signIn("github", { redirectTo: callbackUrl })
                        }
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 shrink-0"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span>GitHub</span>
                        </span>
                    </Button>
                </div>
            </div>

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
