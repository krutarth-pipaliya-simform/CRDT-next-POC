import { getWorkspace } from "@/features/workspace/queries/get-workspace";
import { UpdateWorkspaceForm } from "@/features/workspace/components/update-workspace-form";
import { DeleteWorkspaceButton } from "@/features/workspace/components/delete-workspace-button";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";

export default async function SettingsPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    const workspace = await getWorkspace(workspaceId);

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
                        Permanently delete this workspace and all associated
                        documents, tasks, and data.
                    </p>
                </div>
                <DeleteWorkspaceButton workspaceId={workspaceId} />
            </section>
        </div>
    );
}
