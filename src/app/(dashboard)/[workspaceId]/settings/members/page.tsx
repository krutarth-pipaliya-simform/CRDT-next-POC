import { notFound } from "next/navigation";

import { auth } from "@/features/auth/lib/auth";
import { InviteSection } from "@/features/workspace/components/invite-section";
import { MembersList } from "@/features/workspace/components/members-list";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";

export interface MembersSettingsPageProps {
    params: Promise<{ workspaceId: string }>;
}

export default async function MembersSettingsPage({
    params,
}: MembersSettingsPageProps) {
    const { workspaceId } = await params;
    const workspace = await getWorkspace(workspaceId);
    const session = await auth();
    const role = await getWorkspaceRole(workspaceId);

    if (!workspace) {
        notFound();
    }

    return (
        <div className="flex flex-wrap items-start gap-8 pt-2">
            <section
                aria-labelledby="members-heading"
                className="min-w-0 flex-[999_1_35rem]"
            >
                <div className="mb-5 flex flex-col gap-2">
                    <h2
                        id="members-heading"
                        className="m-0 flex flex-wrap items-baseline gap-x-2.5 leading-[0.9]"
                    >
                        <span className="paddock-serif text-[clamp(2rem,4.4vw,2.5rem)]">
                            Workspace
                        </span>{" "}
                        <span className="paddock-heavy text-[clamp(1.75rem,3.8vw,2.125rem)]">
                            members
                        </span>{" "}
                        <span className="paddock-mono text-lg text-paddock-subtle">
                            ({workspace.members.length})
                        </span>
                    </h2>
                    <p className="m-0 text-paddock-subtle">
                        Everyone who can open {workspace.name}, and what they
                        can do in it.
                    </p>
                </div>
                <MembersList
                    workspaceId={workspaceId}
                    members={workspace.members}
                    currentUserId={session?.user?.id}
                    currentUserRole={role || undefined}
                />
            </section>

            <InviteSection
                workspaceId={workspaceId}
                className="min-w-0 flex-[1_1_22.5rem]"
            />
        </div>
    );
}
