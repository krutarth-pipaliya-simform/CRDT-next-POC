import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { SentryScope } from "@/components/layout/sentry-scope";
import { WorkspaceNav } from "@/components/layout/workspace-nav";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface WorkspaceLayoutProps {
    children: ReactNode;
    params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceLayout({
    children,
    params,
}: WorkspaceLayoutProps) {
    const { workspaceId } = await params;
    const userRole = await verifyWorkspaceRole(workspaceId, [
        "ADMIN",
        "MEMBER",
        "GUEST",
    ]);

    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
        notFound();
    }

    return (
        <div className="min-h-[calc(100vh-81px)] flex flex-col">
            <SentryScope workspaceId={workspaceId} />
            <WorkspaceNav
                workspaceId={workspaceId}
                userRole={userRole}
                members={workspace.members.map((member) => ({
                    id: member.user.id,
                    name: member.user.name || member.user.email || "Member",
                    image: member.user.image,
                }))}
            />
            <div className="flex-1 min-w-0 w-full">{children}</div>
        </div>
    );
}
