import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DocumentEditorPage({
    params,
}: {
    params: Promise<{ workspaceId: string; documentId: string }>;
}) {
    const { workspaceId, documentId } = await params;
    await verifyWorkspaceRole(workspaceId, ["ADMIN", "MEMBER", "GUEST"]);
    return (
        <h1>
            Document Editor: {documentId} in Workspace: {workspaceId}
        </h1>
    );
}
