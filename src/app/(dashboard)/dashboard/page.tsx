import { EmptyState } from "@/components/ui/empty-state";
import { NavTabs, type NavTabItem } from "@/components/ui/nav-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { auth } from "@/features/auth/lib/auth";
import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import { PaginationControls } from "@/features/workspace/components/pagination-controls";
import {
    WorkspaceCard,
    type WorkspaceCardItem,
} from "@/features/workspace/components/workspace-card";
import { WorkspaceSearchBar } from "@/features/workspace/components/workspace-search-bar";
import { getPublicWorkspaces } from "@/features/workspace/queries/get-public-workspaces";
import { getWorkspacesForUser } from "@/features/workspace/queries/get-workspaces";

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
            {/* Header */}
            <PageHeader
                eyebrow="Workspace Selector"
                title="Your Workspaces"
                action={<CreateWorkspaceDialog />}
            />

            {/* Navigation Tabs */}
            <div className="mt-8">
                <NavTabs
                    ariaLabel="Workspace dashboard tabs"
                    activeValue={activeTab}
                    items={dashboardTabs}
                    className="mb-8"
                />
            </div>

            {/* Tab 1: My Workspaces */}
            {activeTab === "my" && (
                <div>
                    {myWorkspaces.length === 0 ? (
                        <EmptyState
                            title="No workspaces found"
                            description="You are not a member of any workspace yet. Create your first workspace or discover public ones."
                            action={<CreateWorkspaceDialog />}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myWorkspaces.map((ws: WorkspaceCardItem) => (
                                <WorkspaceCard
                                    key={ws.id}
                                    workspace={ws}
                                    currentUserId={currentUserId}
                                    mode="my"
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
                        <EmptyState
                            title={
                                searchQuery
                                    ? `No public workspaces match "${searchQuery}"`
                                    : "No public workspaces available"
                            }
                            description="Workspaces marked with Public visibility can be discovered and accessed here."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
