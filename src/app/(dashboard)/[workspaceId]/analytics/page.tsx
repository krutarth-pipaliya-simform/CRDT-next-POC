import Link from "next/link";
import { notFound } from "next/navigation";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { ContourBackground } from "@/components/paddock/contour-background";
import { DisplayHeading } from "@/components/paddock/display-heading";
import { NotchedCard } from "@/components/paddock/notched-card";
import { PaddockStatTile } from "@/components/paddock/paddock-stat-tile";
import { PlanBadge } from "@/features/billing/components/plan-badge";
import { planAllowsRange } from "@/features/billing/lib/plans";
import { getWorkspaceSubscription } from "@/features/billing/queries/get-workspace-subscription";
import { AnalyticsRangeTabs } from "@/features/dashboard/components/analytics-range-tabs";
import { ChartCard } from "@/features/dashboard/components/chart-card";
import {
    ActivityChart,
    CompletionGauge,
    ContributorBars,
    MemberGrowthChart,
    PriorityBars,
    StatusDonut,
} from "@/features/dashboard/components/chart-widgets";
import { getWorkspaceAnalytics } from "@/features/dashboard/queries/get-workspace-analytics";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";
import { cn } from "@/lib/cn";
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
    const rangeLabel = RANGE_LABELS[range].toLowerCase();

    return (
        <main className="pb-24">
            <PageHeader
                eyebrow={`${workspace.name} — Analytics`}
                serif="Workspace"
                heavy="pulse"
                description="How much is moving through the board, and who is moving it."
                action={
                    <div className="flex flex-col items-start gap-3.5 sm:items-end">
                        <PlanBadge plan={plan} />
                        <AnalyticsRangeTabs
                            workspaceId={workspaceId}
                            activeRange={range}
                            plan={plan}
                        />
                        {plan === "FREE" ? (
                            <p
                                className="m-0 max-w-[22rem] text-sm text-paddock-subtle sm:text-right"
                                data-testid="analytics-range-lock"
                            >
                                Longer history is part of Pro —{" "}
                                <Link
                                    href={`/${workspaceId}/settings/billing`}
                                    className="font-semibold text-paddock-ink underline underline-offset-2"
                                >
                                    upgrade this workspace
                                </Link>
                                .
                            </p>
                        ) : null}
                    </div>
                }
            />

            <section
                aria-label="Totals"
                data-testid="analytics-totals"
                className={cn(
                    PAGE_CONTAINER,
                    "grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-3.5 pb-12",
                )}
            >
                <div data-testid="stat-completion-rate">
                    <PaddockStatTile
                        label="Completion rate"
                        value={String(totals.completionRate)}
                        unit="%"
                        hint={`${totals.tasksDone} of ${totals.tasks} tasks done`}
                        className="h-full"
                    />
                </div>
                <div data-testid="stat-tasks-created">
                    <PaddockStatTile
                        label={`Tasks created · ${rangeLabel}`}
                        value={String(totals.tasksCreatedInRange)}
                        hint={`${totals.tasks} on the board in total`}
                        className="h-full"
                    />
                </div>
                <div data-testid="stat-documents">
                    <PaddockStatTile
                        label="Documents"
                        value={String(totals.documents)}
                        hint="Collaborative documents"
                        className="h-full"
                    />
                </div>
                <div data-testid="stat-members">
                    <PaddockStatTile
                        label="Members"
                        value={String(totals.members)}
                        hint={`${totals.messages} chat messages sent`}
                        className="h-full"
                    />
                </div>
            </section>

            {hasTasks ? (
                <section
                    aria-labelledby="analytics-charts-heading"
                    className="paddock-night relative overflow-hidden px-4 pt-16 pb-18 sm:px-6"
                >
                    <ContourBackground pattern="band" surface="night" />
                    <div className="relative mx-auto max-w-[74rem]">
                        <h2
                            id="analytics-charts-heading"
                            className="m-0 mb-8 leading-[0.86]"
                        >
                            <span className="paddock-serif block text-[clamp(2.5rem,6vw,3.75rem)] text-paddock-lime">
                                How the board
                            </span>{" "}
                            <span className="paddock-heavy block text-[clamp(2.125rem,5.4vw,3.375rem)]">
                                is moving
                            </span>
                        </h2>

                        <div className="flex flex-wrap gap-4">
                            <ChartCard
                                title="Task completion rate"
                                description="Share of the board that reached Completed"
                                className="flex-[1_1_20rem]"
                            >
                                <CompletionGauge
                                    completionRate={totals.completionRate}
                                    tasksDone={totals.tasksDone}
                                    tasksTotal={totals.tasks}
                                />
                            </ChartCard>

                            <ChartCard
                                title="Workspace activity"
                                description={`Tasks, documents and messages · ${rangeLabel}`}
                                className="flex-[2_1_40rem]"
                            >
                                <ActivityChart points={analytics.activity} />
                            </ChartCard>

                            <ChartCard
                                title="Member growth"
                                description={`People on the workspace · ${rangeLabel}`}
                                className="flex-[2_1_40rem]"
                            >
                                <MemberGrowthChart
                                    points={analytics.memberGrowth}
                                />
                            </ChartCard>

                            <ChartCard
                                title="Status distribution"
                                description="Where work currently sits"
                                className="flex-[1_1_20rem]"
                            >
                                <StatusDonut
                                    slices={analytics.statusBreakdown}
                                />
                            </ChartCard>

                            <ChartCard
                                title="Priority mix"
                                description="How the board is weighted"
                                className="flex-[1_1_20rem]"
                            >
                                <PriorityBars
                                    slices={analytics.priorityBreakdown}
                                />
                            </ChartCard>

                            <ChartCard
                                title="Contributors"
                                description="Completed vs open per assignee"
                                className="flex-[1_1_20rem]"
                            >
                                {analytics.contributors.length > 0 ? (
                                    <ContributorBars
                                        contributors={analytics.contributors}
                                    />
                                ) : (
                                    <p className="m-0 py-10 text-center text-sm text-paddock-night-subtle">
                                        No tasks are assigned yet.
                                    </p>
                                )}
                            </ChartCard>
                        </div>
                    </div>
                </section>
            ) : (
                <div className={PAGE_CONTAINER}>
                    <NotchedCard bodyClassName="flex flex-col gap-3 px-7 pt-8">
                        <DisplayHeading
                            as="h2"
                            size="md"
                            serif="Nothing to chart"
                            heavy="yet"
                        />
                        <p className="m-0 max-w-[56ch] text-paddock-subtle">
                            Create tasks, documents or messages in{" "}
                            {workspace.name} and the metrics will appear here.
                        </p>
                    </NotchedCard>
                </div>
            )}
        </main>
    );
}
