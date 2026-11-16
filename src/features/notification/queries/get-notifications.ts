import { auth } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";

import { NOTIFICATION_BELL_LIMIT, type NotificationItem } from "../types";

import "server-only";

const NOTIFICATION_SELECT = {
    id: true,
    type: true,
    title: true,
    body: true,
    href: true,
    workspaceId: true,
    readAt: true,
    createdAt: true,
    actor: {
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    },
} as const;

export interface NotificationInbox {
    notifications: NotificationItem[];
    unreadCount: number;
}

/**
 * Returns the signed-in user's most recent notifications across every workspace,
 * together with their total unread count. Scoped to the caller by construction —
 * `recipientId` is always the session user, never a client-supplied value.
 */
export async function getNotifications(
    limit: number = NOTIFICATION_BELL_LIMIT,
): Promise<NotificationInbox> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { notifications: [], unreadCount: 0 };
    }

    const [notifications, unreadCount] = await Promise.all([
        db.notification.findMany({
            where: { recipientId: userId },
            select: NOTIFICATION_SELECT,
            orderBy: { createdAt: "desc" },
            take: limit,
        }),
        db.notification.count({
            where: { recipientId: userId, readAt: null },
        }),
    ]);

    return { notifications, unreadCount };
}

export { NOTIFICATION_SELECT };
