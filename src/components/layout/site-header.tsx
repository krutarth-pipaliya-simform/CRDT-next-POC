import Link from "next/link";

import { UserDropdown } from "@/components/layout/user-dropdown";
import { LinkButton } from "@/components/ui/link-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { auth } from "@/features/auth/lib/auth";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { toNotificationPayload } from "@/features/notification/lib/serialize";
import { getNotifications } from "@/features/notification/queries/get-notifications";
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

    const inbox = navUser?.id
        ? await getNotifications()
        : { notifications: [], unreadCount: 0 };

    return (
        <nav
            aria-label="Main site navigation"
            className="h-14 px-4 sm:px-6 border-b border-brand-border flex items-center gap-4 bg-brand-surface text-brand-ink shrink-0"
        >
            <Link
                href="/"
                className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.015em] shrink-0"
            >
                {/* Two marks resolving into one — the product's whole claim,
                    at 16px. */}
                <span aria-hidden="true" className="relative w-4 h-4 shrink-0">
                    <span className="absolute left-0 top-0 w-2.5 h-2.5 border-2 border-brand-ink" />
                    <span className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-brand-ink" />
                </span>
                Converge
            </Link>

            {navUser ? (
                <>
                    <Link
                        href="/dashboard"
                        className="text-sm text-brand-subtle hover:text-brand-ink transition-colors"
                    >
                        Dashboard
                    </Link>
                    <div className="flex-1" />
                    <ThemeToggle />
                    <NotificationBell
                        initialNotifications={inbox.notifications.map(
                            toNotificationPayload,
                        )}
                        initialUnreadCount={inbox.unreadCount}
                    />
                    <UserDropdown user={navUser} />
                </>
            ) : (
                <>
                    <div className="flex-1" />
                    <ThemeToggle />
                    <Link
                        href="/login"
                        className="text-sm text-brand-subtle hover:text-brand-ink transition-colors"
                    >
                        Log in
                    </Link>
                    <LinkButton href="/register" variant="primary" size="sm">
                        Start writing
                    </LinkButton>
                </>
            )}
        </nav>
    );
}
