export default async function AnalyticsPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    return <h1>Analytics for Workspace: {workspaceId}</h1>;
}
