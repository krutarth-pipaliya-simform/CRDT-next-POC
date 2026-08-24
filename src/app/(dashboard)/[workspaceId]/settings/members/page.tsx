export default async function MembersSettingsPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    return <h1>Members Settings for Workspace: {workspaceId}</h1>;
}
