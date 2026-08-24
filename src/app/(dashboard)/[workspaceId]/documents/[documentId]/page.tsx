export default async function DocumentEditorPage({
    params,
}: {
    params: Promise<{ workspaceId: string; documentId: string }>;
}) {
    const { workspaceId, documentId } = await params;
    return (
        <h1>
            Document Editor: {documentId} in Workspace: {workspaceId}
        </h1>
    );
}
