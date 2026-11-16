import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

import type { ChatReadReceipt } from "../types";

import "server-only";

/**
 * Every current member's read cursor for the workspace channel. Guards itself:
 * a caller without access gets an empty list. Cursors of people who have
 * since left, or who are guests, are not returned.
 */
export async function getChatReadReceipts(
    workspaceId: string,
): Promise<ChatReadReceipt[]> {
    const role = await getWorkspaceRole(workspaceId);
    if (!role) {
        return [];
    }

    const cursors = await db.chatReadCursor.findMany({
        where: {
            workspaceId,
            user: {
                workspaces: {
                    some: { workspaceId, role: { in: ["ADMIN", "MEMBER"] } },
                },
            },
        },
        select: {
            lastReadAt: true,
            user: {
                select: { id: true, name: true, email: true, image: true },
            },
        },
    });

    return cursors.map((cursor) => ({
        user: cursor.user,
        lastReadAt: cursor.lastReadAt.toISOString(),
    }));
}
