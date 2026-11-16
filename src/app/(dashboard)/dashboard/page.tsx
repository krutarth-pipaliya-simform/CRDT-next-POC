import type { ReactNode } from "react";
import Link from "next/link";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { ContourBackground } from "@/components/paddock/contour-background";
import { DisplayHeading } from "@/components/paddock/display-heading";
import { auth } from "@/features/auth/lib/auth";
import { requireUserId } from "@/features/auth/lib/session";
import { LatestAnnouncement } from "@/features/cms/components/latest-announcement";
import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import { PaginationControls } from "@/features/workspace/components/pagination-controls";
import {
    WorkspaceCard,
    type WorkspaceCardItem,
} from "@/features/workspace/components/workspace-card";
import { WorkspaceSearchBar } from "@/features/workspace/components/workspace-search-bar";
import { getPublicWorkspaces } from "@/features/workspace/queries/get-public-workspaces";
import { getWorkspacesForUser } from "@/features/workspace/queries/get-workspaces";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface DashboardListLink {
    value: string;
    label: string;
    count: number;
    href: string;
}

interface DashboardListSwitchProps {
    items: DashboardListLink[];
    activeValue: string;
}

/**
 * The "My workspaces / Discover public" switch. It is navigation (the list
 * lives in the URL), so it is a row of links with `aria-current`, styled as
 * Paddock's pill track rather than built on the client-side `PillTabs`.
 */
function DashboardListSwitch({ items, activeValue }: DashboardListSwitchProps) {
    return (
        <nav
            aria-label="Workspace lists"
            className="paddock-night mb-8 inline-flex max-w-full flex-wrap gap-1 rounded-[1.75rem] p-[5px]"
        >
            {items.map((item) => {
                const current = item.value === activeValue;
                return (
                    <Link
                        key={item.value}
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                            "paddock-press inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-[0.90625rem] font-semibold no-underline",
                            current
                                ? "bg-paddock-lime text-paddock-on-fill"
                                : "bg-transparent text-paddock-night-fg hover:bg-paddock-night-fg/10",
                        )}
                    >
                        {item.label}
                        <span className="paddock-mono text-xs font-normal">
                            {item.count}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}

interface DashboardEmptyStateProps {
    title: string;
    description: string;
    action?: ReactNode;
}

function DashboardEmptyState({
    title,
    description,
    action,
}: DashboardEmptyStateProps) {
    return (
        <div className="flex flex-col items-start gap-4 rounded-paddock-card border-[1.5px] border-dashed border-paddock-ink/40 px-6 py-10 sm:px-10">
            <h2 className="paddock-heavy m-0 text-[1.5625rem] leading-[0.95] break-words">
                {title}
            </h2>
            <p className="m-0 max-w-[52ch] text-paddock-subtle">
                {description}
            </p>
            {action}
        </div>
    );
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const awaitedParams = await searchParams;
    const activeTab =
        typeof awaitedParams.tab === "string" ? awaitedParams.tab : "my";
    const searchQuery =
        typeof awaitedParams.query === "string" ? awaitedParams.query : "";
    const currentPage =
        typeof awaitedParams.page === "string"
            ? parseInt(awaitedParams.page) || 1
            : 1;

    // The proxy redirects signed-out visitors optimistically; this is the
    // check that holds even if a request reaches the page without it.
    const currentUserId = await requireUserId("/dashboard");
    const session = await auth();
    const signedInAs = session?.user?.name || session?.user?.email;

    // Fetch data based on active tab
    const [myWorkspaces, publicData] = await Promise.all([
        getWorkspacesForUser(currentUserId),
        getPublicWorkspaces({
            query: searchQuery,
            page: currentPage,
            pageSize: 6,
        }),
    ]);

    const dashboardTabs: DashboardListLink[] = [
        {
            value: "my",
            label: "My workspaces",
            count: myWorkspaces.length,
            href: "/dashboard?tab=my",
        },
        {
            value: "public",
            label: "Discover public",
            count: publicData.totalCount,
            href: "/dashboard?tab=public",
        },
    ];

    return (
        <main className="pb-24">
            <PageHeader
                eyebrow={signedInAs ? `Signed in as ${signedInAs}` : undefined}
                serif="Your"
                heavy="workspaces"
                action={<CreateWorkspaceDialog />}
            />

            <div className={PAGE_CONTAINER}>
                <LatestAnnouncement className="mb-6" />
                <DashboardListSwitch
                    items={dashboardTabs}
                    activeValue={activeTab}
                />

                {/* Tab 1: My Workspaces */}
                {activeTab === "my" &&
                    (myWorkspaces.length === 0 ? (
                        <DashboardEmptyState
                            title="No workspaces yet"
                            description="You are not a member of any workspace yet. Create your first workspace or discover public ones."
                            action={<CreateWorkspaceDialog />}
                        />
                    ) : (
                        <ul className="m-0 grid list-none grid-cols-1 gap-x-4.5 gap-y-5.5 p-0 md:grid-cols-2 lg:grid-cols-3">
                            {myWorkspaces.map((ws: WorkspaceCardItem) => (
                                <WorkspaceCard
                                    key={ws.id}
                                    workspace={ws}
                                    currentUserId={currentUserId}
                                    mode="my"
                                />
                            ))}
                        </ul>
                    ))}

                {/* Tab 2: Discover Public Workspaces */}
                {activeTab === "public" && (
                    <div>
                        <WorkspaceSearchBar
                            tabName="public"
                            initialQuery={searchQuery}
                            placeholder="Search public workspaces..."
                        />

                        {publicData.workspaces.length === 0 ? (
                            <DashboardEmptyState
                                title={
                                    searchQuery
                                        ? `No public workspaces match "${searchQuery}"`
                                        : "No public workspaces available"
                                }
                                description="Workspaces marked with Public visibility can be discovered and accessed here."
                            />
                        ) : (
                            <ul className="m-0 grid list-none grid-cols-1 gap-x-4.5 gap-y-5.5 p-0 md:grid-cols-2 lg:grid-cols-3">
                                {publicData.workspaces.map(
                                    (ws: WorkspaceCardItem) => (
                                        <WorkspaceCard
                                            key={ws.id}
                                            workspace={ws}
                                            currentUserId={currentUserId}
                                            mode="public"
                                        />
                                    ),
                                )}
                            </ul>
                        )}

                        <PaginationControls
                            currentPage={publicData.currentPage}
                            totalPages={publicData.totalPages}
                            totalCount={publicData.totalCount}
                            tabName="public"
                        />
                    </div>
                )}

                <section
                    aria-label="About Converge"
                    className="paddock-night relative mt-18 flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-paddock-card px-6 py-9 sm:px-10"
                >
                    <ContourBackground pattern="panel" surface="night" />
                    <DisplayHeading
                        as="p"
                        size="md"
                        surface="night"
                        serif="Bring the team"
                        heavy="into one page"
                        className="relative"
                    />
                    <p className="relative m-0 max-w-[24rem] text-paddock-night-subtle">
                        Free for small teams. Edits merge as people type, so
                        nobody overwrites anybody.
                    </p>
                </section>
            </div>
        </main>
    );
}
