export default async function TasksPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    return <h1>Tasks (Kanban) for Workspace: {workspaceId}</h1>;
}
