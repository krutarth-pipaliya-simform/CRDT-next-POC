import { notFound } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { auth } from "@/features/auth/lib/auth";
import { DeleteWorkspaceButton } from "@/features/workspace/components/delete-workspace-button";
import { LeaveWorkspaceButton } from "@/features/workspace/components/leave-workspace-button";
import { UpdateWorkspaceForm } from "@/features/workspace/components/update-workspace-form";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";

export default async function SettingsPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    const [workspace, session] = await Promise.all([
        getWorkspace(workspaceId),
        auth(),
    ]);

    if (!workspace) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-medium text-brand-ink">
                        General Settings
                    </h3>
                    <p className="text-xs font-brand-mono text-brand-subtle">
                        Manage your workspace display name and details.
                    </p>
                </div>
                <UpdateWorkspaceForm
                    workspaceId={workspaceId}
                    initialName={workspace.name}
                    initialVisibility={workspace.visibility}
                />
            </section>

            <Separator />

            <section className="flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-medium text-brand-danger">
                        Danger Zone
                    </h3>
                    <p className="text-xs font-brand-mono text-brand-subtle">
                        Actions that permanently affect your membership or the
                        entire workspace.
                    </p>
                </div>

                <div className="flex flex-col gap-6 p-5 border-2 border-brand-border rounded-brand bg-brand-surface">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-semibold text-brand-ink">
                                Leave Workspace
                            </h4>
                            <p className="text-xs font-brand-mono text-brand-subtle mt-1">
                                Transfer admin ownership to another member and
                                remove yourself from this workspace.
                            </p>
                        </div>
                        <LeaveWorkspaceButton
                            workspaceId={workspaceId}
                            workspaceName={workspace.name}
                            userRole="ADMIN"
                            currentUserId={session?.user?.id}
                            members={workspace.members}
                            variant="secondary"
                            size="sm"
                        >
                            Leave Workspace
                        </LeaveWorkspaceButton>
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-semibold text-brand-danger">
                                Delete Workspace
                            </h4>
                            <p className="text-xs font-brand-mono text-brand-subtle mt-1">
                                Permanently delete this workspace and all
                                associated documents, tasks, and data.
                            </p>
                        </div>
                        <DeleteWorkspaceButton workspaceId={workspaceId} />
                    </div>
                </div>
            </section>
        </div>
    );
}
