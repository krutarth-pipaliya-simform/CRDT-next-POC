import Link from "next/link";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WorkspaceCardProps {
    workspace: {
        id: string;
        name: string;
        _count: { members: number };
        members: { role: string; userId: string }[];
    };
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
        <Link href={`/${workspace.id}`} className="block group">
            <Card
                elevated
                interactive
                className="h-full flex flex-col justify-between"
            >
                <div>
                    <CardHeader className="flex flex-row items-start justify-between gap-4 border-b-2 border-brand-muted pb-3 mb-3">
                        <CardTitle className="font-medium text-lg text-brand-ink group-hover:text-brand-accent transition-colors">
                            {workspace.name}
                        </CardTitle>
                        <Badge
                            intent={myRole === "ADMIN" ? "default" : "muted"}
                        >
                            {myRole}
                        </Badge>
                    </CardHeader>
                    <CardBody className="text-xs font-brand-mono text-brand-subtle">
                        {workspace._count.members}{" "}
                        {workspace._count.members === 1 ? "member" : "members"}
                    </CardBody>
                </div>
                <div className="pt-4 flex items-center justify-end">
                    <span className="font-brand-mono text-xs text-brand-accent uppercase tracking-widest flex items-center gap-1">
                        Open <span aria-hidden="true">→</span>
                    </span>
                </div>
            </Card>
        </Link>
    );
}
