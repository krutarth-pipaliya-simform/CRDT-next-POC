import { notFound } from "next/navigation";

import { DisplayHeading } from "@/components/paddock/display-heading";
import { auth } from "@/features/auth/lib/auth";
import { DeleteWorkspaceButton } from "@/features/workspace/components/delete-workspace-button";
import { LeaveWorkspaceButton } from "@/features/workspace/components/leave-workspace-button";
import { UpdateWorkspaceForm } from "@/features/workspace/components/update-workspace-form";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";
import { cn } from "@/lib/cn";

export interface SettingsPageProps {
    params: Promise<{ workspaceId: string }>;
}

/** Heading on the left, content on the right; stacks below ~860px. */
const SECTION = "flex flex-wrap gap-x-16 gap-y-6";
const SECTION_INTRO =
    "flex max-w-[21.25rem] flex-[1_1_16.25rem] flex-col gap-2.5";
const SECTION_BODY = "min-w-0 flex-[999_1_32.5rem]";

export default async function SettingsPage({ params }: SettingsPageProps) {
    const { workspaceId } = await params;
    const [workspace, session] = await Promise.all([
        getWorkspace(workspaceId),
        auth(),
    ]);

    if (!workspace) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-14 pt-2">
            <section aria-labelledby="settings-general" className={SECTION}>
                <div className={SECTION_INTRO}>
                    <DisplayHeading
                        id="settings-general"
                        as="h2"
                        size="md"
                        serif="The"
                        heavy="basics"
                    />
                    <p className="m-0 text-paddock-subtle">
                        Your workspace&apos;s name, and who can find it.
                    </p>
                </div>
                <div className={SECTION_BODY}>
                    <UpdateWorkspaceForm
                        workspaceId={workspaceId}
                        initialName={workspace.name}
                        initialVisibility={workspace.visibility}
                    />
                </div>
            </section>

            <section
                aria-labelledby="settings-danger"
                className={cn(SECTION, "border-t border-paddock-rule pt-12")}
            >
                <div className={SECTION_INTRO}>
                    <DisplayHeading
                        id="settings-danger"
                        as="h2"
                        size="md"
                        serif="Danger"
                        heavy="zone"
                        className="text-paddock-danger"
                    />
                    <p className="m-0 text-paddock-subtle">
                        Actions that permanently change your membership or the
                        whole workspace.
                    </p>
                </div>

                <div
                    className={cn(
                        SECTION_BODY,
                        "overflow-hidden rounded-paddock-card border-[1.5px] border-paddock-danger",
                    )}
                >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paddock-rule px-6 py-5.5">
                        <div className="flex-[1_1_17.5rem]">
                            <h3 className="m-0 text-base font-bold">
                                Leave workspace
                            </h3>
                            <p className="m-0 text-sm text-paddock-subtle">
                                Hand admin to another member, then remove
                                yourself from {workspace.name}.
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
                            Leave workspace
                        </LeaveWorkspaceButton>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5.5">
                        <div className="flex-[1_1_17.5rem]">
                            <h3 className="m-0 text-base font-bold text-paddock-danger">
                                Delete workspace
                            </h3>
                            <p className="m-0 text-sm text-paddock-subtle">
                                Permanently delete {workspace.name} and every
                                document, task and message in it.
                            </p>
                        </div>
                        <DeleteWorkspaceButton workspaceId={workspaceId} />
                    </div>
                </div>
            </section>
        </div>
    );
}
