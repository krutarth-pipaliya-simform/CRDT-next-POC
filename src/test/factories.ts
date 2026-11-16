import type { NotificationPayload } from "@/features/notification/types";
import type { TaskWithAssignee } from "@/features/task/types";

/** A wire-format notification with sensible defaults, for tests. */
export function makeNotificationPayload(
    overrides: Partial<NotificationPayload> = {},
): NotificationPayload {
    return {
        id: "n1",
        type: "TASK_ASSIGNED",
        title: "Task assigned",
        body: null,
        href: null,
        workspaceId: "w1",
        readAt: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        actor: null,
        ...overrides,
    };
}

/** A board task with sensible defaults, for tests. */
export function makeTask(
    overrides: Partial<TaskWithAssignee> = {},
): TaskWithAssignee {
    return {
        id: "t1",
        title: "Write docs",
        description: null,
        status: "TODO",
        priority: "MEDIUM",
        position: 1024,
        dueDate: null,
        workspaceId: "w1",
        assigneeId: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        assignee: null,
        ...overrides,
    };
}
