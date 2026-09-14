import Link from "next/link";

import { verifyToken } from "@/features/auth/lib/tokens";

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Next.js 16 breaking change: searchParams must be awaited
    const awaitedParams = await searchParams;
    const token = awaitedParams.token;

    if (!token || typeof token !== "string") {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-brand-surface border-2 border-brand-ink rounded-brand shadow-brand-card">
                <h1 className="text-2xl font-bold text-brand-danger">
                    Missing Token
                </h1>
                <p className="text-brand-subtle">
                    No verification token was provided in the URL.
                </p>
                <Link
                    href="/login"
                    className="px-4 py-2 bg-brand-ink text-brand-surface rounded-brand hover:bg-brand-accent transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        );
    }

    const result = await verifyToken(token);

    if (result.error) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-brand-surface border-2 border-brand-ink rounded-brand shadow-brand-card">
                <h1 className="text-2xl font-bold text-brand-danger">
                    Verification Failed
                </h1>
                <p className="text-brand-subtle">{result.error}</p>
                <Link
                    href="/login"
                    className="px-4 py-2 bg-brand-ink text-brand-surface rounded-brand hover:bg-brand-accent transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-brand-surface border-2 border-brand-ink rounded-brand shadow-brand-card">
            <h1 className="text-2xl font-bold text-brand-success">
                Email Verified!
            </h1>
            <p className="text-brand-subtle">{result.success}</p>
            <Link
                href="/login"
                className="px-4 py-2 bg-brand-ink text-brand-surface rounded-brand hover:bg-brand-accent transition-colors"
            >
                Proceed to Login
            </Link>
        </div>
    );
}
