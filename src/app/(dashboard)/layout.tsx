import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";

export interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <>
            <SiteHeader />
            <div className="dashboard-layout flex-1">{children}</div>
        </>
    );
}
