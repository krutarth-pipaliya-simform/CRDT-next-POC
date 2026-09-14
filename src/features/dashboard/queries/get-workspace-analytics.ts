import type { TaskPriority, TaskStatus } from "@prisma/client";

import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { RANGE_DAYS, type AnalyticsRangeValue } from "@/schemas/analytics";

import type {
    ActivityPoint,
    ContributorStat,
    PrioritySlice,
    StatusSlice,
    WorkspaceAnalytics,
} from "../types";

import "server-only";

const STATUS_LABELS: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
};

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITY_ORDER: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

/** How many contributors the leaderboard shows before it stops being readable. */
const CONTRIBUTOR_LIMIT = 5;

/** UTC day key, so buckets do not drift with the server's timezone. */
function dayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function dayLabel(key: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${key}T00:00:00.000Z`));
}

/** Every day in the window, so a quiet day renders as a zero rather than a gap. */
function buildBuckets(days: number): Map<string, ActivityPoint> {
    const buckets = new Map<string, ActivityPoint>();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let offset = days - 1; offset >= 0; offset--) {
        const day = new Date(today);
        day.setUTCDate(day.getUTCDate() - offset);
        const key = dayKey(day);
        buckets.set(key, {
            date: key,
            label: dayLabel(key),
            tasksCreated: 0,
            tasksCompleted: 0,
            documents: 0,
            messages: 0,
        });
    }

    return buckets;
}

function increment(
    buckets: Map<string, ActivityPoint>,
    date: Date,
    field: keyof Omit<ActivityPoint, "date" | "label">,
): void {
    const bucket = buckets.get(dayKey(date));
    if (bucket) {
        bucket[field] += 1;
    }
}

/**
 * Aggregated workspace metrics for the analytics dashboard.
 *
 * Returns `null` when the caller is not a member, so the page cannot render
 * numbers for a workspace the viewer has no access to.
 *
 * Note: the board snapshot (status mix, priority mix, completion rate) always
 * reflects the whole workspace; only the activity series is scoped to `range`.
 * "Completed" is derived from a DONE task's `updatedAt` — the schema has no
 * dedicated completion timestamp, so a later edit re-dates the completion.
 */
export async function getWorkspaceAnalytics(
    workspaceId: string,
    range: AnalyticsRangeValue,
): Promise<WorkspaceAnalytics | null> {
    const role = await getWorkspaceRole(workspaceId);
    if (!role) {
        return null;
    }

    const days = RANGE_DAYS[range];
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const [
        tasks,
        documentsInRange,
        messagesInRange,
        memberCount,
        documentCount,
        messageCount,
        members,
    ] = await Promise.all([
        db.task.findMany({
            where: { workspaceId },
            select: {
                status: true,
                priority: true,
                createdAt: true,
                updatedAt: true,
                assigneeId: true,
            },
        }),
        db.document.findMany({
            where: { workspaceId, createdAt: { gte: since } },
            select: { createdAt: true },
        }),
        db.message.findMany({
            where: { workspaceId, createdAt: { gte: since } },
            select: { createdAt: true },
        }),
        db.workspaceMember.count({ where: { workspaceId } }),
        db.document.count({ where: { workspaceId } }),
        db.message.count({ where: { workspaceId } }),
        db.workspaceMember.findMany({
            where: { workspaceId },
            select: {
                id: true,
                user: { select: { name: true, email: true } },
            },
        }),
    ]);

    const buckets = buildBuckets(days);
    const statusCounts = new Map<TaskStatus, number>();
    const priorityCounts = new Map<TaskPriority, number>();
    const contributorCounts = new Map<
        string,
        { assigned: number; completed: number }
    >();

    let tasksCreatedInRange = 0;

    for (const task of tasks) {
        statusCounts.set(task.status, (statusCounts.get(task.status) ?? 0) + 1);
        priorityCounts.set(
            task.priority,
            (priorityCounts.get(task.priority) ?? 0) + 1,
        );

        if (task.createdAt >= since) {
            tasksCreatedInRange += 1;
            increment(buckets, task.createdAt, "tasksCreated");
        }

        if (task.status === "DONE" && task.updatedAt >= since) {
            increment(buckets, task.updatedAt, "tasksCompleted");
        }

        if (task.assigneeId) {
            const stat = contributorCounts.get(task.assigneeId) ?? {
                assigned: 0,
                completed: 0,
            };
            stat.assigned += 1;
            if (task.status === "DONE") {
                stat.completed += 1;
            }
            contributorCounts.set(task.assigneeId, stat);
        }
    }

    for (const document of documentsInRange) {
        increment(buckets, document.createdAt, "documents");
    }

    for (const message of messagesInRange) {
        increment(buckets, message.createdAt, "messages");
    }

    const tasksDone = statusCounts.get("DONE") ?? 0;
    const completionRate =
        tasks.length === 0
            ? 0
            : Math.round((tasksDone / tasks.length) * 1000) / 10;

    const statusBreakdown: StatusSlice[] = STATUS_ORDER.map((status) => ({
        status,
        label: STATUS_LABELS[status],
        count: statusCounts.get(status) ?? 0,
    }));

    const priorityBreakdown: PrioritySlice[] = PRIORITY_ORDER.map(
        (priority) => ({
            priority,
            label: PRIORITY_LABELS[priority],
            count: priorityCounts.get(priority) ?? 0,
        }),
    );

    const contributors: ContributorStat[] = members
        .map((member) => {
            const stat = contributorCounts.get(member.id) ?? {
                assigned: 0,
                completed: 0,
            };
            return {
                memberId: member.id,
                name:
                    member.user.name ??
                    member.user.email?.split("@")[0] ??
                    "Member",
                assigned: stat.assigned,
                completed: stat.completed,
            };
        })
        .filter((contributor) => contributor.assigned > 0)
        .sort((a, b) => b.completed - a.completed || b.assigned - a.assigned)
        .slice(0, CONTRIBUTOR_LIMIT);

    return {
        range,
        totals: {
            tasks: tasks.length,
            tasksDone,
            completionRate,
            tasksCreatedInRange,
            documents: documentCount,
            messages: messageCount,
            members: memberCount,
        },
        activity: Array.from(buckets.values()),
        statusBreakdown,
        priorityBreakdown,
        contributors,
    };
}
