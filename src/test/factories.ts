import type { NotificationPayload } from "@/features/notification/types";

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
