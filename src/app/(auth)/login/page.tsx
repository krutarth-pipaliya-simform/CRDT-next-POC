import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
    title: "Authenticate | CRDT-Next-POC",
    description: "Login to the CRDT workspace",
};

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="w-full max-w-sm h-96 animate-pulse bg-brand-muted rounded-brand" />
            }
        >
            <LoginForm />
        </Suspense>
    );
}
