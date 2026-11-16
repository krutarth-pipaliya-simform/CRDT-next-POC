import { notFound } from "next/navigation";

import { DocumentList } from "@/features/document/components/document-list";
import { getWorkspaceDocuments } from "@/features/document/queries/get-workspace-documents";
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

    const documents = await getWorkspaceDocuments(workspaceId);

    // The hero lives in <DocumentList>, because its "New document" action
    // opens a dialog that list owns.
    return (
        <main className="w-full min-w-0 pb-24">
            <DocumentList
                documents={documents}
                workspaceId={workspaceId}
                workspaceName={workspace.name}
                userRole={role}
            />
        </main>
    );
}
