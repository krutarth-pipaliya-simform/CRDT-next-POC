import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { KanbanBoard } from "@/features/task/components/kanban-board";
import { getWorkspaceTasks } from "@/features/task/queries/get-workspace-tasks";
import {
    getWorkspaceRole,
    verifyWorkspaceRole,
} from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";
import { getWorkspaceMembers } from "@/features/workspace/queries/get-workspace-members";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TasksPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    await verifyWorkspaceRole(workspaceId, ["ADMIN", "MEMBER", "GUEST"]);

    const workspace = await getWorkspace(workspaceId);
    if (!workspace) {
        notFound();
    }

    const role = await getWorkspaceRole(workspaceId);
    const canEdit = role === "ADMIN" || role === "MEMBER";

    const [tasks, members] = await Promise.all([
        getWorkspaceTasks(workspaceId),
        getWorkspaceMembers(workspaceId),
    ]);

    return (
        <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-6">
                <PageHeader eyebrow="Workflow" title="Task Board" />
            </div>

            <KanbanBoard
                initialTasks={tasks}
                workspaceId={workspaceId}
                members={members}
                canEdit={canEdit}
            />
        </main>
    );
}
