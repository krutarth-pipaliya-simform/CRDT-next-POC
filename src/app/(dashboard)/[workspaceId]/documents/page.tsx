import { notFound } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DocumentsPage({
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
            <PageHeader eyebrow="Documents" title="Workspace Documents" />

            <EmptyState
                title="No documents yet"
                description={`Create collaborative CRDT documents in ${workspace.name} with real-time multiplayer synchronization.`}
            />
        </main>
    );
}
