import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

import { ACTIVITY_FEED_LIMIT, type NotificationItem } from "../types";
import { NOTIFICATION_SELECT } from "./get-notifications";

import "server-only";

/**
 * Returns the signed-in user's activity for a single workspace, read and unread alike.
 *
 * Enforces workspace membership independently of the calling page so activity for a
 * workspace the caller has been removed from can never leak.
 */
export async function getWorkspaceActivity(
    workspaceId: string,
    limit: number = ACTIVITY_FEED_LIMIT,
): Promise<NotificationItem[]> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return [];
    }

    const role = await getWorkspaceRole(workspaceId);
    if (!role) {
        return [];
    }

    return db.notification.findMany({
        where: { workspaceId, recipientId: userId },
        select: NOTIFICATION_SELECT,
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}
