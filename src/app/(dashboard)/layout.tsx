import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";

export interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex flex-col min-h-full w-full max-w-full overflow-x-hidden">
            <SiteHeader />
            <div className="dashboard-layout flex-1 w-full max-w-full overflow-x-hidden min-w-0">
                {children}
            </div>
        </div>
    );
}
