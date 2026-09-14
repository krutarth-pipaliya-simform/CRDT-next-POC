import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { PresenceRail } from "@/components/ui/presence-rail";
import { UserAvatar } from "@/components/ui/user-avatar";
import { JoinPublicButton } from "@/features/workspace/components/join-public-button";
import { LeaveWorkspaceButton } from "@/features/workspace/components/leave-workspace-button";
import { WORKSPACE_ROLE_LABELS, type WorkspaceRole } from "@/schemas/workspace";

export interface WorkspaceCardMember {
    role: string;
    userId: string;
    user?: { name: string | null; email: string | null; image: string | null };
}

export interface WorkspaceCardItem {
    id: string;
    name: string;
    _count: { members: number };
    members: WorkspaceCardMember[];
}

export interface WorkspaceCardProps {
    workspace: WorkspaceCardItem;
    currentUserId: string;
    mode?: "my" | "public";
}

export function WorkspaceCard({
    workspace,
    currentUserId,
    mode = "my",
}: WorkspaceCardProps) {
    const memberRecord = workspace.members.find(
        (member) => member.userId === currentUserId,
    );
    const isMember = Boolean(memberRecord);
    const myRole = memberRecord?.role ?? "MEMBER";

    const shown = workspace.members.slice(0, 5);
    const overflow = workspace._count.members - shown.length;
    const names = workspace.members
        .map((member) => member.user?.name || member.user?.email)
        .filter(Boolean)
        .join(", ");

    return (
        <Card
            interactive
            className="relative h-full flex gap-3 p-0 overflow-hidden"
        >
            {/* Everyone in this workspace, in their own colours — the same hues
                they will wear on every card and message inside it. */}
            <PresenceRail
                userIds={workspace.members.map((member) => member.userId)}
            />

            <div className="flex-1 min-w-0 flex flex-col p-4 pl-1">
                <div className="flex items-start justify-between gap-3">
                    <CardTitle className="truncate min-w-0">
                        <Link
                            href={`/${workspace.id}`}
                            className={
                                mode === "my"
                                    ? "block truncate after:absolute after:inset-0 after:content-['']"
                                    : "block truncate hover:underline underline-offset-2"
                            }
                        >
                            {workspace.name}
                        </Link>
                    </CardTitle>
                    <Badge
                        intent={
                            mode === "public" && !isMember
                                ? "success"
                                : myRole === "ADMIN"
                                  ? "default"
                                  : "muted"
                        }
                        className="shrink-0"
                    >
                        {mode === "public" && !isMember
                            ? "Public"
                            : (WORKSPACE_ROLE_LABELS[myRole as WorkspaceRole] ??
                              myRole)}
                    </Badge>
                </div>

                <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center -space-x-1">
                        {shown.map((member) => (
                            <UserAvatar
                                key={member.userId}
                                user={{
                                    id: member.userId,
                                    name: member.user?.name,
                                    email: member.user?.email,
                                    image: member.user?.image,
                                }}
                                size="sm"
                                className="ring-2 ring-brand-surface"
                            />
                        ))}
                    </span>
                    <span className="text-[13px] text-brand-subtle truncate">
                        {overflow > 0
                            ? `+${overflow} more`
                            : workspace._count.members === 1
                              ? "Just you"
                              : `${workspace._count.members} people`}
                    </span>
                    {names && <span className="sr-only">Members: {names}</span>}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                    {mode === "public" ? (
                        <>
                            <Link
                                href={`/${workspace.id}`}
                                className="relative z-10 text-[13px] text-brand-accent hover:underline underline-offset-2"
                            >
                                {isMember ? "Open workspace" : "View as guest"}
                            </Link>
                            {!isMember && (
                                <span className="relative z-10">
                                    <JoinPublicButton
                                        workspaceId={workspace.id}
                                        isMember={false}
                                    />
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            <span />
                            {
                                <span className="relative z-10">
                                    <LeaveWorkspaceButton
                                        workspaceId={workspace.id}
                                        workspaceName={workspace.name}
                                        userRole={myRole}
                                        currentUserId={currentUserId}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        Leave
                                    </LeaveWorkspaceButton>
                                </span>
                            }
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}
