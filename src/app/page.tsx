import Link from "next/link";
import { auth } from "@/features/auth/lib/auth";

export default async function LandingPage() {
    const session = await auth();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-4xl font-bold mb-4">
                Welcome to CRDT-next-POC
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                The ultimate collaborative SaaS workspace. Connect, create, and
                collaborate in real-time.
            </p>
            {session?.user ? (
                <Link
                    href="/dashboard"
                    className="bg-brand-accent text-white px-6 py-3 rounded-md font-medium hover:opacity-90"
                >
                    Go to your Dashboard
                </Link>
            ) : (
                <Link
                    href="/login"
                    className="bg-brand-accent text-white px-6 py-3 rounded-md font-medium hover:opacity-90"
                >
                    Log In to Get Started
                </Link>
            )}
        </div>
    );
}
