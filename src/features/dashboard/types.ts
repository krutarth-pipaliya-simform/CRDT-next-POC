import type { TaskPriority, TaskStatus } from "@prisma/client";

import type { AnalyticsRangeValue } from "@/schemas/analytics";

export interface AnalyticsTotals {
    tasks: number;
    tasksDone: number;
    /** Share of all tasks in the DONE column, 0-100, rounded to one decimal. */
    completionRate: number;
    tasksCreatedInRange: number;
    documents: number;
    messages: number;
    members: number;
}

export interface ActivityPoint {
    /** ISO date (UTC) the bucket covers, e.g. "2026-09-14". */
    date: string;
    /** Short axis label, e.g. "Sep 14". */
    label: string;
    tasksCreated: number;
    tasksCompleted: number;
    documents: number;
    messages: number;
}

export interface StatusSlice {
    status: TaskStatus;
    label: string;
    count: number;
}

export interface PrioritySlice {
    priority: TaskPriority;
    label: string;
    count: number;
}

export interface ContributorStat {
    memberId: string;
    name: string;
    assigned: number;
    completed: number;
}

export interface WorkspaceAnalytics {
    range: AnalyticsRangeValue;
    totals: AnalyticsTotals;
    activity: ActivityPoint[];
    statusBreakdown: StatusSlice[];
    priorityBreakdown: PrioritySlice[];
    contributors: ContributorStat[];
}
