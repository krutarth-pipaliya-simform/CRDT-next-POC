import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsNav } from "@/features/workspace/components/settings-nav";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";

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

    const workspace = await getWorkspace(workspaceId);
    if (!workspace) {
        notFound();
    }

    return (
        <main className="pb-24">
            <PageHeader
                eyebrow={`${workspace.name} — Settings`}
                serif="Workspace"
                heavy="settings"
                action={<SettingsNav workspaceId={workspaceId} />}
            />

            <div className={PAGE_CONTAINER}>{children}</div>
        </main>
    );
}
