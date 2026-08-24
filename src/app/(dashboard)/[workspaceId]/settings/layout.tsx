import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";

export default async function SettingsLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    // Only Admin can access settings
    await verifyWorkspaceRole(workspaceId, ["ADMIN"]);

    return <div className="settings-layout">{children}</div>;
}
