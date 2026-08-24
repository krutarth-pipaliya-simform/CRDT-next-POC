export default async function DocumentsPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    return <h1>Documents for Workspace: {workspaceId}</h1>;
}
