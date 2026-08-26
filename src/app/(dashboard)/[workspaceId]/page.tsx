import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/features/auth/lib/auth";
import { JoinPublicButton } from "@/features/workspace/components/join-public-button";
import { LeaveWorkspaceButton } from "@/features/workspace/components/leave-workspace-button";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WorkspacePage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    const [role, workspace, session] = await Promise.all([
        verifyWorkspaceRole(workspaceId, ["ADMIN", "MEMBER", "GUEST"]),
        getWorkspace(workspaceId),
        auth(),
    ]);

    if (!workspace) {
        notFound();
    }

    const quickLinks = [
        {
            title: "Documents",
            description:
                "Collaborative rich-text documents with real-time CRDT sync.",
            href: `/${workspaceId}/documents`,
            badge: `${workspace.documents?.length || 0} Docs`,
        },
        {
            title: "Tasks",
            description:
                "Manage project deliverables, assignments, and kanban cards.",
            href: `/${workspaceId}/tasks`,
            badge: `${workspace.tasks?.length || 0} Tasks`,
        },
        {
            title: "Team Chat",
            description:
                "Channel-based real-time discussions with workspace members.",
            href: `/${workspaceId}/chat`,
            badge: "Active",
        },
        {
            title: "Analytics",
            description:
                "Productivity metrics, sync latency, and workspace activity.",
            href: `/${workspaceId}/analytics`,
            badge: "Insights",
        },
        ...(role === "ADMIN"
            ? [
                  {
                      title: "Workspace Settings",
                      description:
                          "Manage workspace name, team members, invitations, and danger zone.",
                      href: `/${workspaceId}/settings`,
                      badge: "Admin",
                  },
              ]
            : []),
    ];

    return (
        <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle">
                        Workspace Overview
                    </span>
                    <h1 className="text-3xl font-medium tracking-tight text-brand-ink mt-1">
                        {workspace.name}
                    </h1>
                    <p className="text-xs font-brand-mono text-brand-subtle mt-2">
                        {workspace.members.length}{" "}
                        {workspace.members.length === 1 ? "member" : "members"}{" "}
                        collaborating in this workspace
                    </p>
                </div>
                {role !== "GUEST" && (
                    <LeaveWorkspaceButton
                        workspaceId={workspaceId}
                        workspaceName={workspace.name}
                        userRole={role}
                        currentUserId={session?.user?.id}
                        members={workspace.members}
                        variant="secondary"
                        size="sm"
                    >
                        Leave Workspace
                    </LeaveWorkspaceButton>
                )}
            </div>

            {role === "GUEST" && workspace.visibility === "PUBLIC" && (
                <div className="mb-8 p-4 border-2 border-brand-accent/30 bg-brand-surface rounded-brand flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand-ink">
                            You are viewing this public workspace as a guest.
                        </p>
                        <p className="text-xs font-brand-mono text-brand-subtle">
                            Join as a full member to add it to your dashboard
                            and collaborate.
                        </p>
                    </div>
                    <JoinPublicButton
                        workspaceId={workspaceId}
                        isMember={false}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="group block"
                    >
                        <Card
                            elevated
                            interactive
                            className="h-full flex flex-col justify-between"
                        >
                            <div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2 border-b border-brand-muted">
                                    <CardTitle className="text-base font-semibold text-brand-ink group-hover:text-brand-accent transition-colors">
                                        {link.title}
                                    </CardTitle>
                                    <span className="font-brand-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-brand-border bg-brand-muted text-brand-subtle rounded-brand">
                                        {link.badge}
                                    </span>
                                </CardHeader>
                                <CardBody className="text-xs text-brand-subtle leading-relaxed">
                                    {link.description}
                                </CardBody>
                            </div>
                            <div className="pt-4 flex items-center justify-end">
                                <span className="font-brand-mono text-xs text-brand-accent uppercase tracking-widest flex items-center gap-1">
                                    Open <span aria-hidden="true">→</span>
                                </span>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </main>
    );
}
