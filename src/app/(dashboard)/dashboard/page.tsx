import { getWorkspacesForUser } from "@/features/workspace/queries/get-workspaces";
import { getPublicWorkspaces } from "@/features/workspace/queries/get-public-workspaces";
import { getOrganizationWorkspaces } from "@/features/workspace/queries/get-org-workspaces";
import { WorkspaceCard } from "@/features/workspace/components/workspace-card";
import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import { WorkspaceSearchBar } from "@/features/workspace/components/workspace-search-bar";
import { PaginationControls } from "@/features/workspace/components/pagination-controls";
import { JoinRequestButton } from "@/features/workspace/components/join-request-button";
import { JoinPublicButton } from "@/features/workspace/components/join-public-button";
import { auth } from "@/features/auth/lib/auth";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

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
    const [myWorkspaces, publicData, orgData] = await Promise.all([
        getWorkspacesForUser(currentUserId),
        getPublicWorkspaces({
            query: searchQuery,
            page: currentPage,
            pageSize: 6,
        }),
        getOrganizationWorkspaces({
            query: searchQuery,
            page: currentPage,
            pageSize: 6,
            userId: currentUserId,
            userEmail: session?.user?.email ?? undefined,
        }),
    ]);

    const tabs = [
        { id: "my", label: `My Workspaces (${myWorkspaces.length})` },
        {
            id: "org",
            label: `Organization Workspaces (${orgData.totalCount})`,
        },
        { id: "public", label: `Discover Public (${publicData.totalCount})` },
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
            <nav
                className="flex items-center gap-2 border-b-2 border-brand-muted mb-8"
                aria-label="Workspace dashboard tabs"
            >
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={`/dashboard?tab=${tab.id}`}
                        className={cn(
                            "px-4 py-3 font-brand-mono text-xs uppercase tracking-wider transition-colors border-b-2 -mb-[2px]",
                            activeTab === tab.id
                                ? "border-brand-accent text-brand-ink font-semibold"
                                : "border-transparent text-brand-subtle hover:text-brand-ink hover:border-brand-border",
                        )}
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>

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

            {/* Tab 2: Organization Workspaces */}
            {activeTab === "org" && (
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <WorkspaceSearchBar
                            tabName="org"
                            initialQuery={searchQuery}
                            placeholder="Search organization workspaces..."
                        />
                        {orgData.userDomain && (
                            <span className="font-brand-mono text-xs text-brand-subtle">
                                Domain:{" "}
                                <strong className="text-brand-ink">
                                    @{orgData.userDomain}
                                </strong>
                            </span>
                        )}
                    </div>

                    {orgData.workspaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-brand-border rounded-brand bg-brand-surface">
                            <h3 className="text-lg font-medium text-brand-ink mb-2">
                                {searchQuery
                                    ? `No organization workspaces match "${searchQuery}"`
                                    : "No organization workspaces found"}
                            </h3>
                            <p className="text-xs font-brand-mono text-brand-subtle max-w-sm">
                                Workspaces marked with Organization visibility
                                in your company domain will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orgData.workspaces.map((ws) => {
                                const isMember = ws.members.some(
                                    (m) => m.userId === currentUserId,
                                );
                                const userRequest = ws.joinRequests?.[0];

                                return (
                                    <Card
                                        key={ws.id}
                                        elevated
                                        className="h-full flex flex-col justify-between"
                                    >
                                        <div>
                                            <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2 border-b border-brand-muted">
                                                <CardTitle className="text-base font-semibold text-brand-ink truncate">
                                                    {ws.name}
                                                </CardTitle>
                                                <Badge intent="muted">
                                                    Organization
                                                </Badge>
                                            </CardHeader>
                                            <CardBody className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 font-brand-mono text-xs text-brand-subtle">
                                                    <span>
                                                        {ws._count.members}{" "}
                                                        members
                                                    </span>
                                                </div>
                                            </CardBody>
                                        </div>

                                        <div className="pt-4 mt-auto border-t border-brand-muted flex items-center justify-between">
                                            {isMember ? (
                                                <Link
                                                    href={`/${ws.id}`}
                                                    className="font-brand-mono text-xs text-brand-accent uppercase tracking-widest hover:underline"
                                                >
                                                    Open Workspace →
                                                </Link>
                                            ) : (
                                                <JoinRequestButton
                                                    workspaceId={ws.id}
                                                    isMember={isMember}
                                                    initialStatus={
                                                        userRequest?.status
                                                    }
                                                />
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    <PaginationControls
                        currentPage={orgData.currentPage}
                        totalPages={orgData.totalPages}
                        totalCount={orgData.totalCount}
                        tabName="org"
                    />
                </div>
            )}

            {/* Tab 3: Discover Public Workspaces */}
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
                            {publicData.workspaces.map((ws) => (
                                <Card
                                    key={ws.id}
                                    elevated
                                    className="h-full flex flex-col justify-between"
                                >
                                    <div>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2 border-b border-brand-muted">
                                            <CardTitle className="text-base font-semibold text-brand-ink truncate">
                                                {ws.name}
                                            </CardTitle>
                                            <Badge intent="success">
                                                Public
                                            </Badge>
                                        </CardHeader>
                                        <CardBody className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 font-brand-mono text-xs text-brand-subtle">
                                                <span>
                                                    {ws._count.members} members
                                                </span>
                                            </div>
                                        </CardBody>
                                    </div>

                                    <div className="pt-4 mt-auto border-t border-brand-muted flex items-center justify-end">
                                        <JoinPublicButton
                                            workspaceId={ws.id}
                                            isMember={ws.members.some(
                                                (m) =>
                                                    m.userId === currentUserId,
                                            )}
                                        />
                                    </div>
                                </Card>
                            ))}
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
