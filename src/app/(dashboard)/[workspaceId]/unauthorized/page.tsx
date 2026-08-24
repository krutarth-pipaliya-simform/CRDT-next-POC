export default async function WorkspaceUnauthorizedPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    return <h1>Unauthorized Access to Workspace: {workspaceId}</h1>;
}
