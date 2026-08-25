import { auth } from "@/features/auth/lib/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { LinkButton } from "@/components/ui/link-button";

export default async function LandingPage() {
    const session = await auth();

    return (
        <>
            <SiteHeader />
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-4xl font-bold mb-4">
                    Welcome to CRDT-next-POC
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                    The ultimate collaborative SaaS workspace. Connect, create,
                    and collaborate in real-time.
                </p>
                {session?.user ? (
                    <LinkButton href="/dashboard" variant="primary" size="lg">
                        Go to your Dashboard
                    </LinkButton>
                ) : (
                    <LinkButton href="/login" variant="primary" size="lg">
                        Log In to Get Started
                    </LinkButton>
                )}
            </div>
        </>
    );
}
