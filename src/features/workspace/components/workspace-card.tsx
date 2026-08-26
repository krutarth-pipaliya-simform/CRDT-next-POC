import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveWorkspaceButton } from "@/features/workspace/components/leave-workspace-button";

export interface WorkspaceCardItem {
    id: string;
    name: string;
    _count: { members: number };
    members: { role: string; userId: string }[];
}

export interface WorkspaceCardProps {
    workspace: WorkspaceCardItem;
    currentUserId: string;
}

export function WorkspaceCard({
    workspace,
    currentUserId,
}: WorkspaceCardProps) {
    const myRole =
        workspace.members.find((m) => m.userId === currentUserId)?.role ??
        "MEMBER";

    return (
        <Card
            elevated
            interactive
            className="h-full flex flex-col justify-between group"
        >
            <div>
                <CardHeader className="flex flex-row items-start justify-between gap-4 border-b-2 border-brand-muted pb-3 mb-3">
                    <Link
                        href={`/${workspace.id}`}
                        className="hover:underline flex-1 min-w-0"
                    >
                        <CardTitle className="font-medium text-lg text-brand-ink group-hover:text-brand-accent transition-colors truncate">
                            {workspace.name}
                        </CardTitle>
                    </Link>
                    <Badge intent={myRole === "ADMIN" ? "default" : "muted"}>
                        {myRole}
                    </Badge>
                </CardHeader>
                <CardBody className="text-xs font-brand-mono text-brand-subtle">
                    {workspace._count.members}{" "}
                    {workspace._count.members === 1 ? "member" : "members"}
                </CardBody>
            </div>
            <div className="pt-4 mt-auto border-t border-brand-muted flex items-center justify-between gap-2">
                <Link
                    href={`/${workspace.id}`}
                    className="font-brand-mono text-xs text-brand-accent uppercase tracking-widest flex items-center gap-1 hover:underline"
                >
                    Open <span aria-hidden="true">→</span>
                </Link>
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
            </div>
        </Card>
    );
}
