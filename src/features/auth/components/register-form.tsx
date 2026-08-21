"use client";

import { useActionState } from "react";
import { registerAction } from "@/features/auth/actions/register";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";
import { signIn } from "next-auth/react";

export function RegisterForm() {
    const [state, formAction] = useActionState(registerAction, null);

    return (
        <div className="w-full max-w-sm flex flex-col gap-12">
            <div>
                <h2 className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle mb-4">
                    Create Account
                </h2>
                <h1 className="text-3xl font-medium tracking-tight text-brand-ink">
                    Sign Up
                </h1>
            </div>

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

                {state?.error && <Alert intent="danger">{state.error}</Alert>}

                <div className="pt-2">
                    <Button
                        type="submit"
                        withArrow
                        className="w-full justify-between"
                    >
                        Sign Up
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
                    Sign up with Google
                </Button>
            </div>

            <div className="font-brand-mono text-xs text-brand-subtle">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="text-brand-accent underline underline-offset-4 hover:text-brand-ink uppercase tracking-wider"
                >
                    Sign In
                </Link>
            </div>
        </div>
    );
}
