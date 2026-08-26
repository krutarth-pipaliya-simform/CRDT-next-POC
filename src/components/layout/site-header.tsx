import Link from "next/link";
import { auth } from "@/features/auth/lib/auth";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { LinkButton } from "@/components/ui/link-button";

export async function SiteHeader() {
    const session = await auth();
    let navUser = session?.user;

    if (navUser?.id) {
        // Fetch fresh user data so the avatar updates immediately after an upload
        const { rawDb } = await import("@/lib/db");
        const dbUser = await rawDb.user.findUnique({
            where: { id: navUser.id },
            select: { name: true, image: true, email: true },
        });
        if (dbUser) {
            navUser = { ...navUser, ...dbUser };
        }
    }

    return (
        <nav
            style={{
                padding: "1rem",
                borderBottom: "1px solid var(--color-brand-border)",
                marginBottom: "1rem",
                display: "flex",
                gap: "1rem",
                backgroundColor: "var(--color-brand-surface)",
                color: "var(--color-brand-ink)",
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            <Link href="/" className="font-bold text-xl">
                App Logo
            </Link>

            {session?.user ? (
                <>
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-brand-ink hover:text-brand-accent transition-colors"
                    >
                        Dashboard
                    </Link>
                    <div style={{ flexGrow: 1 }}></div>
                    <UserDropdown user={navUser!} />
                </>
            ) : (
                <>
                    <div style={{ flexGrow: 1 }}></div>
                    <LinkButton href="/login" variant="primary" size="sm">
                        Log In
                    </LinkButton>
                </>
            )}
        </nav>
    );
}
