import { getWorkspacesForUser } from "@/features/workspace/queries/get-workspaces";
import { getPublicWorkspaces } from "@/features/workspace/queries/get-public-workspaces";
import { WorkspaceCard } from "@/features/workspace/components/workspace-card";
import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import { WorkspaceSearchBar } from "@/features/workspace/components/workspace-search-bar";
import { PaginationControls } from "@/features/workspace/components/pagination-controls";
import { JoinPublicButton } from "@/features/workspace/components/join-public-button";
import { auth } from "@/features/auth/lib/auth";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavTabs, type NavTabItem } from "@/components/ui/nav-tabs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    const session = await auth();
    const currentUserId = session?.user?.id || "";

    // Fetch data based on active tab
    const [myWorkspaces, publicData] = await Promise.all([
        getWorkspacesForUser(currentUserId),
        getPublicWorkspaces({
            query: searchQuery,
            page: currentPage,
            pageSize: 6,
        }),
    ]);

    const dashboardTabs: NavTabItem[] = [
        {
            value: "my",
            label: `My Workspaces (${myWorkspaces.length})`,
            href: "/dashboard?tab=my",
        },
        {
            value: "public",
            label: `Discover Public (${publicData.totalCount})`,
            href: "/dashboard?tab=public",
        },
    ];

    return (
        <main className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b-2 border-brand-muted pb-8">
                <div>
                    <h2 className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle mb-2">
                        Workspace Selector
                    </h2>
                    <h1 className="text-3xl font-medium tracking-tight text-brand-ink">
                        Your Workspaces
                    </h1>
                </div>
                <CreateWorkspaceDialog />
            </div>

            {/* Dashboard Tabs */}
            <NavTabs
                ariaLabel="Workspace dashboard tabs"
                activeValue={activeTab}
                items={dashboardTabs}
                className="mb-8"
            />

            {/* Tab 1: My Workspaces */}
            {activeTab === "my" && (
                <div>
                    {myWorkspaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-brand-border rounded-brand bg-brand-surface">
                            <h3 className="text-lg font-medium text-brand-ink mb-2">
                                No workspaces found
                            </h3>
                            <p className="text-xs font-brand-mono text-brand-subtle max-w-sm mb-6">
                                You are not a member of any workspace yet.
                                Create your first workspace or discover public
                                ones.
                            </p>
                            <CreateWorkspaceDialog />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myWorkspaces.map((ws) => (
                                <WorkspaceCard
                                    key={ws.id}
                                    workspace={ws}
                                    currentUserId={currentUserId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 2: Discover Public Workspaces */}
            {activeTab === "public" && (
                <div>
                    <WorkspaceSearchBar
                        tabName="public"
                        initialQuery={searchQuery}
                        placeholder="Search public workspaces..."
                    />

                    {publicData.workspaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-brand-border rounded-brand bg-brand-surface">
                            <h3 className="text-lg font-medium text-brand-ink mb-2">
                                {searchQuery
                                    ? `No public workspaces match "${searchQuery}"`
                                    : "No public workspaces available"}
                            </h3>
                            <p className="text-xs font-brand-mono text-brand-subtle max-w-sm">
                                Workspaces marked with Public visibility can be
                                discovered and accessed here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publicData.workspaces.map((ws) => {
                                const isMember = ws.members.some(
                                    (m) => m.userId === currentUserId,
                                );
                                return (
                                    <Card
                                        key={ws.id}
                                        elevated
                                        interactive
                                        className="h-full flex flex-col justify-between group"
                                    >
                                        <div>
                                            <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2 border-b border-brand-muted gap-2">
                                                <Link
                                                    href={`/${ws.id}`}
                                                    className="hover:underline flex-1 min-w-0"
                                                >
                                                    <CardTitle className="text-base font-semibold text-brand-ink group-hover:text-brand-accent transition-colors truncate">
                                                        {ws.name}
                                                    </CardTitle>
                                                </Link>
                                                <Badge
                                                    intent={
                                                        isMember
                                                            ? "muted"
                                                            : "success"
                                                    }
                                                >
                                                    {isMember
                                                        ? "Member"
                                                        : "Public"}
                                                </Badge>
                                            </CardHeader>
                                            <CardBody className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 font-brand-mono text-xs text-brand-subtle">
                                                    <span>
                                                        {ws._count.members}{" "}
                                                        {ws._count.members === 1
                                                            ? "member"
                                                            : "members"}
                                                    </span>
                                                </div>
                                            </CardBody>
                                        </div>

                                        <div className="pt-4 mt-auto border-t border-brand-muted flex items-center justify-between gap-2">
                                            <Link
                                                href={`/${ws.id}`}
                                                className="font-brand-mono text-xs text-brand-subtle hover:text-brand-ink uppercase tracking-wider flex items-center gap-1 transition-colors"
                                            >
                                                {isMember
                                                    ? "Open Workspace"
                                                    : "View as Guest"}{" "}
                                                <span aria-hidden="true">
                                                    →
                                                </span>
                                            </Link>
                                            {!isMember && (
                                                <JoinPublicButton
                                                    workspaceId={ws.id}
                                                    isMember={false}
                                                />
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    <PaginationControls
                        currentPage={publicData.currentPage}
                        totalPages={publicData.totalPages}
                        totalCount={publicData.totalCount}
                        tabName="public"
                    />
                </div>
            )}
        </main>
    );
}
