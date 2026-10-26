import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
import { RolePill } from "@/components/paddock/paddock-pills";
import { paddockPillBase } from "@/components/paddock/paddock-styles";
import { LeaveWorkspaceButton } from "@/features/workspace/components/leave-workspace-button";
import { RemoveMemberButton } from "@/features/workspace/components/remove-member-button";
import { cn } from "@/lib/cn";
import { toWorkspaceRole } from "@/schemas/workspace";

export interface WorkspaceMemberUser {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

export interface WorkspaceMemberItem {
    id: string;
    role: string;
    user: WorkspaceMemberUser;
}

export interface MembersListProps {
    workspaceId: string;
    members: WorkspaceMemberItem[];
    currentUserId?: string;
    currentUserRole?: string;
}

export function MembersList({
    workspaceId,
    members,
    currentUserId,
    currentUserRole,
}: MembersListProps) {
    if (members.length === 0) {
        return (
            <p className="m-0 text-paddock-subtle">
                No members found in this workspace.
            </p>
        );
    }

    return (
        <ul className="m-0 list-none overflow-hidden rounded-paddock-card border-[1.5px] border-paddock-ink bg-paddock-sheet p-0">
            {members.map((member) => {
                const isYou = member.user.id === currentUserId;
                const displayName = member.user.name || "Unnamed Member";
                const knownRole = toWorkspaceRole(member.role);

                return (
                    <li
                        key={member.id}
                        className="flex flex-wrap items-center gap-x-4 gap-y-3.5 border-t border-paddock-rule px-5 py-4 first:border-t-0"
                    >
                        <PaddockAvatar
                            person={{
                                id: member.user.id,
                                name:
                                    member.user.name ||
                                    member.user.email ||
                                    "Member",
                                image: member.user.image,
                            }}
                            size="xl"
                            decorative
                        />
                        <div className="min-w-0 flex-[1_1_12.5rem]">
                            <p className="m-0 truncate text-base font-bold">
                                <span>{displayName}</span>
                                {isYou ? (
                                    <span className="font-medium text-paddock-subtle">
                                        {" "}
                                        (you)
                                    </span>
                                ) : null}
                            </p>
                            {member.user.email ? (
                                <p className="paddock-mono m-0 truncate text-[0.78125rem] text-paddock-subtle">
                                    {member.user.email}
                                </p>
                            ) : null}
                        </div>

                        {/* A fixed action slot keeps every role pill on one
                            vertical edge, whichever action the row offers. */}
                        <div className="ml-auto flex items-center gap-4">
                            {knownRole ? (
                                <RolePill role={knownRole} />
                            ) : (
                                <span
                                    className={cn(
                                        paddockPillBase,
                                        "border-[1.5px] border-paddock-ink py-1.5",
                                    )}
                                >
                                    {member.role}
                                </span>
                            )}
                            <div className="flex w-26 justify-end">
                                {isYou ? (
                                    <LeaveWorkspaceButton
                                        workspaceId={workspaceId}
                                        userRole={member.role}
                                        currentUserId={currentUserId}
                                        members={members}
                                    >
                                        Leave
                                    </LeaveWorkspaceButton>
                                ) : null}
                                {currentUserRole === "ADMIN" && !isYou ? (
                                    <RemoveMemberButton
                                        workspaceId={workspaceId}
                                        memberId={member.id}
                                        memberName={
                                            member.user.name ||
                                            member.user.email ||
                                            "member"
                                        }
                                    />
                                ) : null}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
