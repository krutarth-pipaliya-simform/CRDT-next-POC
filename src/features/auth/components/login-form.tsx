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

export function LoginForm() {
    const [state, formAction] = useActionState(loginAction, null);
    const [isPending, startTransition] = useTransition();
    const [resendStatus, setResendStatus] = useState<{
        type: "success" | "error";
        message: string;
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
                            <Alert
                                intent={
                                    resendStatus.type === "success"
                                        ? "success"
                                        : "danger"
                                }
                            >
                                {resendStatus.message}
                            </Alert>
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
                <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => signIn("google", { redirectTo: "/" })}
                >
                    Sign in with Google
                </Button>
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
