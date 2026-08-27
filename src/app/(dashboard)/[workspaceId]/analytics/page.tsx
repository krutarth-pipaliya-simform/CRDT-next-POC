import { notFound } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage({
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
            <PageHeader eyebrow="Metrics" title="Workspace Analytics" />

            <EmptyState
                title="Activity & Performance"
                description={`Real-time operational metrics and activity stats for ${workspace.name}.`}
            />
        </main>
    );
}
