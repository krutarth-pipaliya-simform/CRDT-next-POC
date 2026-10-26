import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthSplitScreen } from "@/features/auth/components/auth-split-screen";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
    title: "Log in",
    description: "Log in to your Converge workspace",
};

export default function LoginPage() {
    return (
        <AuthSplitScreen>
            <Suspense
                fallback={
                    <div className="h-96 w-full rounded-paddock bg-paddock-rule motion-safe:animate-pulse" />
                }
            >
                <LoginForm />
            </Suspense>
        </AuthSplitScreen>
    );
}
