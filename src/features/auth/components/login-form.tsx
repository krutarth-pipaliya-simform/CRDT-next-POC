"use client";

import { useActionState } from "react";
import { loginAction } from "@/features/auth/actions/login";
import { AuthInput } from "@/components/ui/auth-input";
import { AuthButton } from "@/components/ui/auth-button";
import Link from "next/link";
import { signIn } from "next-auth/react";

export function LoginForm() {
    const [state, formAction] = useActionState(loginAction, null);

    return (
        <div className="w-full max-w-sm flex flex-col gap-12">
            <div>
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#666666] mb-4">
                    Welcome Back
                </h2>
                <h1 className="text-3xl font-medium tracking-tight text-[#1A1A1A]">
                    Sign In
                </h1>
            </div>

            <form action={formAction} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="email"
                        className="font-mono text-xs uppercase tracking-wider text-[#1A1A1A]"
                    >
                        Email
                    </label>
                    <AuthInput
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="password"
                        className="font-mono text-xs uppercase tracking-wider text-[#1A1A1A]"
                    >
                        Password
                    </label>
                    <AuthInput
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                    />
                </div>

                {state?.error && (
                    <div className="p-3 border-2 border-[#E53E3E] bg-[#E53E3E]/5 text-[#E53E3E] text-xs font-mono uppercase tracking-wider">
                        {state.error}
                    </div>
                )}

                <div className="pt-2">
                    <AuthButton type="submit">Sign In</AuthButton>
                </div>
            </form>

            <div className="flex flex-col gap-4">
                <div className="h-[2px] w-full bg-[#F0F0F0] relative">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-[#FBFBFB] px-4 font-mono text-[10px] text-[#666666] uppercase tracking-widest">
                        Or continue with
                    </span>
                </div>

                <AuthButton
                    type="button"
                    variant="secondary"
                    onClick={() => signIn("google", { redirectTo: "/" })}
                >
                    Sign in with Google
                </AuthButton>
            </div>

            <div className="font-mono text-xs text-[#666666]">
                Don&apos;t have an account?{" "}
                <Link
                    href="/register"
                    className="text-[#2948FF] hover:underline uppercase tracking-wider"
                >
                    Sign Up
                </Link>
            </div>
        </div>
    );
}
