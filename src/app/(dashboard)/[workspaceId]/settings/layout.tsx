import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { SettingsNav } from "@/features/workspace/components/settings-nav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    // Only Admin can access settings (FR-6)
    await verifyWorkspaceRole(workspaceId, ["ADMIN"]);

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h2 className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle mb-2">
                    Workspace Management
                </h2>
                <h1 className="text-3xl font-medium tracking-tight text-brand-ink">
                    Settings
                </h1>
            </div>

            <SettingsNav workspaceId={workspaceId} />

            <div>{children}</div>
        </div>
    );
}
