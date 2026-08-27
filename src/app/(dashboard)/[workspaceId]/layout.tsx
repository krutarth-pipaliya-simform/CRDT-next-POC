import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { WorkspaceNav } from "@/components/layout/workspace-nav";
import { auth } from "@/features/auth/lib/auth";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";
import { getWorkspacesForUser } from "@/features/workspace/queries/get-workspaces";

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

    const session = await auth();
    const currentUserId = session?.user?.id;
    const workspace = await getWorkspace(workspaceId);
    const userWorkspaces = await getWorkspacesForUser(currentUserId);

    if (!workspace) {
        notFound();
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col">
            <WorkspaceNav
                workspaceId={workspaceId}
                workspaceName={workspace.name}
                userRole={userRole}
                workspaces={userWorkspaces.map(
                    (ws: { id: string; name: string }) => ({
                        id: ws.id,
                        name: ws.name,
                    }),
                )}
            />
            <div className="flex-1">{children}</div>
        </div>
    );
}
