import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { StatTile } from "@/components/ui/stat-tile";
import { PageHeader } from "@/components/layout/page-header";
import { PlanBadge } from "@/features/billing/components/plan-badge";
import { planAllowsRange } from "@/features/billing/lib/plans";
import { getWorkspaceSubscription } from "@/features/billing/queries/get-workspace-subscription";
import { AnalyticsRangeTabs } from "@/features/dashboard/components/analytics-range-tabs";
import { ChartCard } from "@/features/dashboard/components/chart-card";
import {
    ActivityChart,
    CompletionGauge,
    ContributorBars,
    PriorityBars,
    StatusDonut,
} from "@/features/dashboard/components/chart-widgets";
import { getWorkspaceAnalytics } from "@/features/dashboard/queries/get-workspace-analytics";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";
import { RANGE_LABELS, analyticsSearchParamsSchema } from "@/schemas/analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface AnalyticsPageProps {
    params: Promise<{ workspaceId: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AnalyticsPage({
    params,
    searchParams,
}: AnalyticsPageProps) {
    const [{ workspaceId }, rawSearchParams] = await Promise.all([
        params,
        searchParams,
    ]);

    await verifyWorkspaceRole(workspaceId, ["ADMIN", "MEMBER", "GUEST"]);

    const [workspace, subscription] = await Promise.all([
        getWorkspace(workspaceId),
        getWorkspaceSubscription(workspaceId),
    ]);

    if (!workspace || !subscription) {
        notFound();
    }

    const { range: requestedRange } =
        analyticsSearchParamsSchema.parse(rawSearchParams);

    // Entitlement is resolved on the server: a hand-typed ?range=90d on the Free
    // plan falls back to the included window rather than serving paid history.
    const plan = subscription.effectivePlan;
    const rangeLocked = !planAllowsRange(plan, requestedRange);
    const range = rangeLocked ? "7d" : requestedRange;

    const analytics = await getWorkspaceAnalytics(workspaceId, range);
    if (!analytics) {
        notFound();
    }

    const { totals } = analytics;
    const hasTasks = totals.tasks > 0;

    return (
        <main className="max-w-7xl mx-auto px-6 py-8">
            <PageHeader
                title="Analytics"
                description="How much is moving through the board, and who is moving it."
                action={<PlanBadge plan={plan} />}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <AnalyticsRangeTabs
                    workspaceId={workspaceId}
                    activeRange={range}
                    plan={plan}
                />
                {plan === "FREE" && (
                    <p
                        className="text-[11px] text-brand-subtle"
                        data-testid="analytics-range-lock"
                    >
                        Longer history is part of Pro —{" "}
                        <Link
                            href={`/${workspaceId}/settings/billing`}
                            className="text-brand-accent underline underline-offset-2"
                        >
                            upgrade this workspace
                        </Link>
                        .
                    </p>
                )}
            </div>

            <section
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
                data-testid="analytics-totals"
            >
                <StatTile
                    label="Completion rate"
                    value={`${totals.completionRate}%`}
                    hint={`${totals.tasksDone} of ${totals.tasks} tasks done`}
                    testId="stat-completion-rate"
                />
                <StatTile
                    label={`Tasks created · ${RANGE_LABELS[range].toLowerCase()}`}
                    value={totals.tasksCreatedInRange}
                    hint={`${totals.tasks} on the board in total`}
                    testId="stat-tasks-created"
                />
                <StatTile
                    label="Documents"
                    value={totals.documents}
                    hint="Collaborative documents"
                    testId="stat-documents"
                />
                <StatTile
                    label="Members"
                    value={totals.members}
                    hint={`${totals.messages} chat messages sent`}
                    testId="stat-members"
                />
            </section>

            {hasTasks ? (
                <div className="grid gap-6 lg:grid-cols-3">
                    <ChartCard
                        title="Task completion rate"
                        description="Share of the board that reached Done"
                    >
                        <CompletionGauge
                            completionRate={totals.completionRate}
                            tasksDone={totals.tasksDone}
                            tasksTotal={totals.tasks}
                        />
                    </ChartCard>

                    <ChartCard
                        title="Workspace activity"
                        description={`Tasks, documents and messages · ${RANGE_LABELS[range].toLowerCase()}`}
                        className="lg:col-span-2"
                    >
                        <ActivityChart points={analytics.activity} />
                    </ChartCard>

                    <ChartCard
                        title="Status distribution"
                        description="Where work currently sits"
                    >
                        <StatusDonut slices={analytics.statusBreakdown} />
                    </ChartCard>

                    <ChartCard
                        title="Priority mix"
                        description="How the board is weighted"
                    >
                        <PriorityBars slices={analytics.priorityBreakdown} />
                    </ChartCard>

                    <ChartCard
                        title="Contributors"
                        description="Completed vs open per assignee"
                    >
                        {analytics.contributors.length > 0 ? (
                            <ContributorBars
                                contributors={analytics.contributors}
                            />
                        ) : (
                            <p className="text-xs text-brand-subtle py-10 text-center">
                                No tasks are assigned yet.
                            </p>
                        )}
                    </ChartCard>
                </div>
            ) : (
                <EmptyState
                    title="Nothing to chart yet"
                    description={`Create tasks, documents or messages in ${workspace.name} and the metrics will appear here.`}
                />
            )}
        </main>
    );
}
