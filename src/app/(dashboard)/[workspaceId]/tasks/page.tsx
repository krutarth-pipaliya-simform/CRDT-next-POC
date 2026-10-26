import { notFound } from "next/navigation";

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

    // The hero lives inside the board: its search box and "New task" action
    // drive the board's own client state, so they render together.
    return (
        <main className="pb-24">
            <KanbanBoard
                initialTasks={tasks}
                workspaceId={workspaceId}
                members={members}
                canEdit={canEdit}
                eyebrow={`${workspace.name} — Tasks`}
            />
        </main>
    );
}
