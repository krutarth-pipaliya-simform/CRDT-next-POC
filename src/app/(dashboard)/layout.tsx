import type { ReactNode } from "react";

import { SentryScope } from "@/components/layout/sentry-scope";
import { SiteHeader } from "@/components/layout/site-header";
import { auth } from "@/features/auth/lib/auth";
import { toNotificationPayload } from "@/features/notification/lib/serialize";
import { getNotifications } from "@/features/notification/queries/get-notifications";
import { NotificationStoreProvider } from "@/features/notification/stores/notification-store-provider";

export interface DashboardLayoutProps {
    children: ReactNode;
}

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    // The session is read here only for monitoring: pages and actions still
    // check it themselves. The id is all Sentry gets.
    // One inbox store for the whole signed-in shell: the header bell and a
    // page's activity feed are siblings, so it has to sit above both.
    const [session, inbox] = await Promise.all([auth(), getNotifications()]);

    return (
        <NotificationStoreProvider
            initialNotifications={inbox.notifications.map(
                toNotificationPayload,
            )}
            initialUnreadCount={inbox.unreadCount}
        >
            <div className="flex flex-col min-h-full w-full max-w-full overflow-x-hidden">
                <SentryScope userId={session?.user?.id} />
                <SiteHeader />
                <div className="dashboard-layout flex-1 w-full max-w-full overflow-x-hidden min-w-0">
                    {children}
                </div>
            </div>
        </NotificationStoreProvider>
    );
}
