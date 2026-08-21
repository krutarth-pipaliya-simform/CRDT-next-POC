"use client";

import { useActionState } from "react";
import { registerAction } from "@/features/auth/actions/register";
import { AuthInput } from "@/components/ui/auth-input";
import { AuthButton } from "@/components/ui/auth-button";
import Link from "next/link";
import { signIn } from "next-auth/react";

export function RegisterForm() {
    const [state, formAction] = useActionState(registerAction, null);

    return (
        <div className="w-full max-w-sm flex flex-col gap-12">
            <div>
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#666666] mb-4">
                    Create Account
                </h2>
                <h1 className="text-3xl font-medium tracking-tight text-[#1A1A1A]">
                    Sign Up
                </h1>
            </div>

            <form action={formAction} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-[#1A1A1A]">
                        Name
                    </label>
                    <AuthInput
                        name="name"
                        type="text"
                        placeholder="Jane Doe"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-[#1A1A1A]">
                        Email
                    </label>
                    <AuthInput
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-[#1A1A1A]">
                        Password
                    </label>
                    <AuthInput
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={8}
                    />
                </div>

                {state?.error && (
                    <div className="p-3 border-2 border-[#E53E3E] bg-[#E53E3E]/5 text-[#E53E3E] text-xs font-mono uppercase tracking-wider">
                        {state.error}
                    </div>
                )}

                <div className="pt-2">
                    <AuthButton type="submit">Sign Up</AuthButton>
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
                    Sign up with Google
                </AuthButton>
            </div>

            <div className="font-mono text-xs text-[#666666]">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="text-[#2948FF] hover:underline uppercase tracking-wider"
                >
                    Log In
                </Link>
            </div>
        </div>
    );
}
