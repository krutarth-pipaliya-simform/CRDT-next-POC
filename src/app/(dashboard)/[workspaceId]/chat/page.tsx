export default async function ChatPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    return <h1>Chat for Workspace: {workspaceId}</h1>;
}
