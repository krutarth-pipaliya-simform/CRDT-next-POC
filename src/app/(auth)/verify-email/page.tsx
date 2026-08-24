import { verifyToken } from "@/features/auth/lib/tokens";
import Link from "next/link";

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
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-red-600">
                    Missing Token
                </h1>
                <p className="text-gray-600">
                    No verification token was provided in the URL.
                </p>
                <Link
                    href="/login"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        );
    }

    const result = await verifyToken(token);

    if (result.error) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-red-600">
                    Verification Failed
                </h1>
                <p className="text-gray-600">{result.error}</p>
                <Link
                    href="/login"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-green-600">
                Email Verified!
            </h1>
            <p className="text-gray-600">{result.success}</p>
            <Link
                href="/login"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
                Proceed to Login
            </Link>
        </div>
    );
}
