import type { TaskStatus } from "@prisma/client";

import { notify } from "@/features/notification/lib/notify";

import type { TaskWithAssignee } from "../types";

import "server-only";

export interface NotifyTaskChangeInput {
    task: TaskWithAssignee;
    previousStatus: TaskStatus;
    previousAssigneeUserId: string | null;
    actorId: string;
}

/**
 * Emits the notifications a task mutation implies.
 *
 * Shared by every task write path so a task reaching `DONE` — or landing on someone's
 * plate — is announced identically whether it came from the detail dialog or a drag.
 */
export async function notifyTaskChange({
    task,
    previousStatus,
    previousAssigneeUserId,
    actorId,
}: NotifyTaskChangeInput): Promise<void> {
    const assigneeUserId = task.assignee?.userId ?? null;
    const href = `/${task.workspaceId}/tasks`;

    // Only announce a genuinely new assignee, and never to the person who did it
    if (
        assigneeUserId &&
        assigneeUserId !== previousAssigneeUserId &&
        assigneeUserId !== actorId
    ) {
        await notify({
            type: "TASK_ASSIGNED",
            title: `You were assigned "${task.title}"`,
            body: task.description,
            href,
            workspaceId: task.workspaceId,
            actorId,
            recipientIds: [assigneeUserId],
        });
    }

    if (task.status === "DONE" && previousStatus !== "DONE") {
        await notify({
            type: "TASK_COMPLETED",
            title: `"${task.title}" was completed`,
            body: null,
            href,
            workspaceId: task.workspaceId,
            actorId,
            excludeUserIds: [actorId],
        });
    }
}
