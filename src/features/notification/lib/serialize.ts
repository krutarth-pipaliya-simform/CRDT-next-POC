import type { NotificationItem, NotificationPayload } from "../types";

/**
 * Converts a database notification row into the JSON-safe shape shared by the SSE
 * stream and the client components, so both sources produce one identical type.
 */
export function toNotificationPayload(
    notification: NotificationItem,
): NotificationPayload {
    return {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        href: notification.href,
        workspaceId: notification.workspaceId,
        readAt: notification.readAt ? notification.readAt.toISOString() : null,
        createdAt: notification.createdAt.toISOString(),
        actor: notification.actor
            ? {
                  id: notification.actor.id,
                  name: notification.actor.name,
                  email: notification.actor.email,
                  image: notification.actor.image,
              }
            : null,
    };
}
