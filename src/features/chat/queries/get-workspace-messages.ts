import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

import { CHAT_HISTORY_LIMIT, type ChatMessage } from "../types";

import "server-only";

/**
 * Returns the most recent workspace messages in chronological order.
 *
 * Enforces membership independently of the calling page so chat history can never
 * leak to a caller who lost access.
 */
export async function getWorkspaceMessages(
    workspaceId: string,
    limit: number = CHAT_HISTORY_LIMIT,
): Promise<ChatMessage[]> {
    const role = await getWorkspaceRole(workspaceId);
    if (!role) {
        return [];
    }

    const rows = await db.message.findMany({
        where: { workspaceId },
        select: {
            id: true,
            body: true,
            createdAt: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    // Queried newest-first so the LIMIT keeps the latest window, then reversed for display
    return rows.reverse().map((row) => ({
        id: row.id,
        body: row.body,
        createdAt: row.createdAt.toISOString(),
        author: row.author,
        deliveryState: "sent" as const,
    }));
}
