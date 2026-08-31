import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { DocumentList } from "@/features/document/components/document-list";
import { getDocuments } from "@/features/document/queries/get-documents";
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
    const role = await verifyWorkspaceRole(workspaceId, [
        "ADMIN",
        "MEMBER",
        "GUEST",
    ]);
    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
        notFound();
    }

    const documents = await getDocuments(workspaceId);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full min-w-0">
            <PageHeader
                eyebrow={workspace.name}
                title="Documents"
                description="Collaborative rich text documents with real-time multiplayer CRDT sync and autosave."
            />

            <div className="mt-8">
                <DocumentList
                    documents={documents}
                    workspaceId={workspaceId}
                    workspaceName={workspace.name}
                    userRole={role}
                />
            </div>
        </main>
    );
}
