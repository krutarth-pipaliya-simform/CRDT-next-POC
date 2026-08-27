import Link from "next/link";

import { UserDropdown } from "@/components/layout/user-dropdown";
import { LinkButton } from "@/components/ui/link-button";
import { auth } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";

export async function SiteHeader() {
    const session = await auth();
    let navUser = session?.user;

    if (navUser?.id) {
        // Fetch fresh user data so the avatar updates immediately after an upload
        const dbUser = await db.user.findUnique({
            where: { id: navUser.id },
            select: { name: true, image: true, email: true },
        });
        if (dbUser) {
            navUser = { ...navUser, ...dbUser };
        }
    }

    return (
        <nav
            aria-label="Main site navigation"
            className="p-4 border-b border-brand-border mb-4 flex items-center gap-4 bg-brand-surface text-brand-ink flex-wrap"
        >
            <Link href="/" className="font-bold text-xl">
                App Logo
            </Link>

            {navUser ? (
                <>
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-brand-ink hover:text-brand-accent transition-colors"
                    >
                        Dashboard
                    </Link>
                    <div className="flex-1" />
                    <UserDropdown user={navUser} />
                </>
            ) : (
                <>
                    <div className="flex-1" />
                    <LinkButton href="/login" variant="primary" size="sm">
                        Log In
                    </LinkButton>
                </>
            )}
        </nav>
    );
}
