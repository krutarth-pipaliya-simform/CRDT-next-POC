import { notFound } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";

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

    return (
        <main className="max-w-7xl mx-auto px-6 py-8">
            <PageHeader eyebrow="Kanban" title="Task Board" />

            <EmptyState
                title="No active tasks"
                description={`Track deliverables, assignees, and task progress in ${workspace.name}.`}
            />
        </main>
    );
}
