import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { DisplayHeading } from "@/components/paddock/display-heading";
import { NotchedCard } from "@/components/paddock/notched-card";
import { AvatarStack } from "@/components/paddock/paddock-avatar";
import { auth } from "@/features/auth/lib/auth";
import { JoinPublicButton } from "@/features/workspace/components/join-public-button";
import { LeaveWorkspaceButton } from "@/features/workspace/components/leave-workspace-button";
import { splitDisplayName } from "@/features/workspace/components/workspace-card";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** "1 task", "12 tasks". */
function countOf(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * The cards step down the grid on wide screens, as in the design. Purely
 * decorative, so it only applies where three columns fit.
 */
const STAGGER = ["lg:mt-15", "lg:mt-6", "lg:mt-0"];

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
            serif: "The",
            heavy: "Documents",
            description:
                "Collaborative rich-text documents with real-time CRDT sync.",
            href: `/${workspaceId}/documents`,
            badge: countOf(
                workspace.documents?.length || 0,
                "document",
                "documents",
            ),
        },
        {
            serif: "The",
            heavy: "Tasks",
            description:
                "Manage project deliverables, assignments and kanban cards.",
            href: `/${workspaceId}/tasks`,
            badge: countOf(workspace.tasks?.length || 0, "task", "tasks"),
        },
        {
            serif: "Team",
            heavy: "Chat",
            description: "Real-time discussion with everyone in the workspace.",
            href: `/${workspaceId}/chat`,
        },
        {
            serif: "The",
            heavy: "Analytics",
            description:
                "Productivity metrics and workspace activity over time.",
            href: `/${workspaceId}/analytics`,
        },
        ...(role === "ADMIN"
            ? [
                  {
                      serif: "Workspace",
                      heavy: "Settings",
                      description:
                          "Manage the workspace name, team members, invitations and danger zone.",
                      href: `/${workspaceId}/settings`,
                  },
              ]
            : []),
    ];

    const { serif, heavy } = splitDisplayName(workspace.name);
    const people = workspace.members.map((member) => ({
        id: member.user.id,
        name: member.user.name || member.user.email || "Member",
        image: member.user.image,
    }));

    return (
        <main>
            <PageHeader
                back={{
                    href: "/dashboard",
                    label: "All workspaces",
                    "aria-label": "Back to all workspaces",
                }}
                eyebrow="Workspace overview"
                serif={serif}
                heavy={heavy}
                meta={
                    <p className="m-0 flex flex-wrap items-center gap-3 text-paddock-subtle">
                        <AvatarStack people={people} size="md" ring="paper" />
                        {workspace.members.length}{" "}
                        {workspace.members.length === 1 ? "member" : "members"}{" "}
                        collaborating in this workspace
                    </p>
                }
                action={
                    role !== "GUEST" ? (
                        <LeaveWorkspaceButton
                            workspaceId={workspaceId}
                            workspaceName={workspace.name}
                            userRole={role}
                            currentUserId={session?.user?.id}
                            members={workspace.members}
                            variant="secondary"
                            size="md"
                        >
                            Leave Workspace
                        </LeaveWorkspaceButton>
                    ) : undefined
                }
            />

            {role === "GUEST" && workspace.visibility === "PUBLIC" && (
                <div className={cn(PAGE_CONTAINER, "mb-10")}>
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-paddock-card border-[1.5px] border-paddock-ink bg-paddock-sheet p-5">
                        <div className="min-w-0">
                            <p className="m-0 font-semibold text-paddock-ink">
                                You are viewing this public workspace as a
                                guest.
                            </p>
                            <p className="m-0 mt-1 text-sm text-paddock-subtle">
                                Join as a full member to add it to your
                                dashboard and collaborate.
                            </p>
                        </div>
                        <JoinPublicButton
                            workspaceId={workspaceId}
                            isMember={false}
                        />
                    </div>
                </div>
            )}

            <section
                aria-labelledby="overview-jump-back-in"
                className="paddock-deep px-0 pt-16 pb-24 sm:pt-22 sm:pb-28"
            >
                <div className={PAGE_CONTAINER}>
                    <DisplayHeading
                        id="overview-jump-back-in"
                        as="h2"
                        size="lg"
                        surface="night"
                        serif="Jump"
                        heavy="back in"
                        className="mb-10 sm:mb-14"
                    />
                    <ul className="m-0 grid list-none grid-cols-1 items-start gap-4.5 p-0 md:grid-cols-2 lg:grid-cols-3">
                        {quickLinks.map((link, index) => (
                            <li
                                key={link.href}
                                className={STAGGER[index % STAGGER.length]}
                            >
                                <Link
                                    href={link.href}
                                    className="paddock-lift group block rounded-paddock text-paddock-night-fg no-underline"
                                >
                                    <NotchedCard
                                        tone="deep"
                                        // The tab only carries a real count
                                        // ("Open 3 tasks"); sections with no
                                        // number to show go without one.
                                        tab={
                                            link.badge ? (
                                                <>
                                                    <span className="text-paddock-night-fg">
                                                        Open
                                                    </span>{" "}
                                                    {link.badge}
                                                </>
                                            ) : undefined
                                        }
                                        bodyClassName="flex min-h-58 flex-col justify-between gap-6.5 px-7 pt-7.5 pb-14"
                                    >
                                        <span className="flex items-start justify-between gap-4">
                                            <DisplayHeading
                                                as="h3"
                                                size="md"
                                                serif={link.serif}
                                                heavy={link.heavy}
                                            />
                                            <span
                                                aria-hidden="true"
                                                className="flex size-11.5 shrink-0 items-center justify-center rounded-[6px] bg-paddock-lime text-paddock-on-fill"
                                            >
                                                <ArrowUpRight
                                                    className="size-5"
                                                    strokeWidth={2.4}
                                                />
                                            </span>
                                        </span>
                                        <span className="max-w-[19rem] text-[0.90625rem] text-paddock-night-subtle">
                                            {link.description}
                                        </span>
                                    </NotchedCard>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </main>
    );
}
