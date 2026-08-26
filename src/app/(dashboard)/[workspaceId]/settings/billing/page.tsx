export default async function BillingSettingsPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    return <h1>Billing Settings for Workspace: {workspaceId}</h1>;
}
