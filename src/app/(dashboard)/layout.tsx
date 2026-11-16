import type { ReactNode } from "react";

import { SentryScope } from "@/components/layout/sentry-scope";
import { SiteHeader } from "@/components/layout/site-header";
import { auth } from "@/features/auth/lib/auth";

export interface DashboardLayoutProps {
    children: ReactNode;
}

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    // Only for monitoring: pages and actions still check the session
    // themselves. The id is all Sentry gets.
    const session = await auth();

    return (
        <div className="flex flex-col min-h-full w-full max-w-full overflow-x-hidden">
            <SentryScope userId={session?.user?.id} />
            <SiteHeader />
            <div className="dashboard-layout flex-1 w-full max-w-full overflow-x-hidden min-w-0">
                {children}
            </div>
        </div>
    );
}
