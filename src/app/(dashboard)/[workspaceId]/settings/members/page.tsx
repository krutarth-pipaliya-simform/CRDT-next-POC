import { getWorkspace } from "@/features/workspace/queries/get-workspace";
import { getWorkspaceJoinRequests } from "@/features/workspace/queries/get-join-requests";
import { MembersList } from "@/features/workspace/components/members-list";
import { InviteSection } from "@/features/workspace/components/invite-section";
import { JoinRequestsList } from "@/features/workspace/components/join-requests-list";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";

export default async function MembersSettingsPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    const workspace = await getWorkspace(workspaceId);
    const session = await auth();
    const role = await getWorkspaceRole(workspaceId);

    if (!workspace) {
        notFound();
    }

    const joinRequests = await getWorkspaceJoinRequests(workspaceId);

    return (
        <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-medium text-brand-ink">
                        Workspace Members ({workspace.members.length})
                    </h3>
                    <p className="text-xs font-brand-mono text-brand-subtle">
                        Users who have access to this workspace and their
                        assigned roles.
                    </p>
                </div>
                <MembersList
                    workspaceId={workspaceId}
                    members={workspace.members}
                    currentUserId={session?.user?.id}
                    currentUserRole={role || undefined}
                />
            </section>

            <Separator />

            <section className="flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-medium text-brand-ink">
                        Join Requests (
                        {
                            joinRequests.filter((r) => r.status === "PENDING")
                                .length
                        }{" "}
                        Pending)
                    </h3>
                    <p className="text-xs font-brand-mono text-brand-subtle">
                        Organization members who have requested access to this
                        workspace.
                    </p>
                </div>
                <JoinRequestsList
                    workspaceId={workspaceId}
                    requests={joinRequests}
                />
            </section>

            <Separator />

            <section className="flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-medium text-brand-ink">
                        Invite New Members
                    </h3>
                    <p className="text-xs font-brand-mono text-brand-subtle">
                        Create single-use secure invite links with 24-hour
                        expiration.
                    </p>
                </div>
                <InviteSection workspaceId={workspaceId} />
            </section>
        </div>
    );
}
