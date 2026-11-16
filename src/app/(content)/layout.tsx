import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { ContentNav } from "@/features/cms/components/content-nav";

export interface ContentLayoutProps {
    children: ReactNode;
}

/**
 * The public content sections (blog, announcements, docs, changelog). They
 * are reachable signed out; `SiteHeader` shows the sign-in buttons then.
 */
export default function ContentLayout({ children }: ContentLayoutProps) {
    return (
        <div className="flex min-h-full w-full max-w-full min-w-0 flex-col overflow-x-hidden">
            <SiteHeader />
            <ContentNav />
            <div className="w-full max-w-full min-w-0 flex-1">{children}</div>
        </div>
    );
}
