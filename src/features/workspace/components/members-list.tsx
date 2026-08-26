import { Badge } from "@/components/ui/badge";
import { RemoveMemberButton } from "./remove-member-button";

interface Member {
    id: string;
    role: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

interface MembersListProps {
    workspaceId: string;
    members: Member[];
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
            <p className="text-xs font-brand-mono text-brand-subtle">
                No members found in this workspace.
            </p>
        );
    }

    return (
        <ul className="flex flex-col divide-y-2 divide-brand-muted border-2 border-brand-border rounded-brand overflow-hidden">
            {members.map((member) => (
                <li
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-brand-surface hover:bg-brand-muted/30 transition-colors"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-brand-ink text-brand-surface font-brand-mono text-xs font-semibold flex items-center justify-center uppercase shrink-0">
                            {member.user.name?.[0] ||
                                member.user.email?.[0] ||
                                "U"}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-brand-ink truncate">
                                {member.user.name || "Unnamed Member"}
                            </span>
                            <span className="text-xs font-brand-mono text-brand-subtle truncate">
                                {member.user.email}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {currentUserRole === "ADMIN" &&
                            member.user.id !== currentUserId && (
                                <RemoveMemberButton
                                    workspaceId={workspaceId}
                                    memberId={member.id}
                                    memberName={
                                        member.user.name ||
                                        member.user.email ||
                                        "member"
                                    }
                                />
                            )}
                        <Badge
                            intent={
                                member.role === "ADMIN" ? "default" : "muted"
                            }
                        >
                            {member.role}
                        </Badge>
                    </div>
                </li>
            ))}
        </ul>
    );
}
