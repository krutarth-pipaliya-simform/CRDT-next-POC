import type { ReactNode } from "react";

import { SettingsNav } from "@/features/workspace/components/settings-nav";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface SettingsLayoutProps {
    children: ReactNode;
    params: Promise<{ workspaceId: string }>;
}

export default async function SettingsLayout({
    children,
    params,
}: SettingsLayoutProps) {
    const { workspaceId } = await params;
    // Only Admin can access settings (FR-6)
    await verifyWorkspaceRole(workspaceId, ["ADMIN"]);

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
            <h1 className="text-[30px] font-semibold tracking-[-0.024em] text-brand-ink mb-6">
                Settings
            </h1>

            <SettingsNav workspaceId={workspaceId} />

            <div>{children}</div>
        </main>
    );
}
