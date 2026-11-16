"use server";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { markChatReadSchema } from "@/schemas/chat";

import type { ChatReadReceipt } from "../types";

export type MarkChatReadResult =
    | { success: true; data: ChatReadReceipt }
    | { success: false; error: string };

/**
 * Moves the caller's read cursor forward to a message they have seen.
 *
 * The client names a message, never a time: the cursor takes that message's
 * own `createdAt`, so a client cannot claim to have read the future. The
 * cursor only ever moves forward. Guests are refused: like presence and
 * typing, a read-only visitor leaves no trace in the channel.
 */
export async function markChatReadAction(
    input: unknown,
): Promise<MarkChatReadResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            error: "Your session has expired. Log in again to keep your place in chat.",
        };
    }

    const validated = markChatReadSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { workspaceId, messageId } = validated.data;
    const userId = session.user.id;

    const role = await getWorkspaceRole(workspaceId);
    if (role !== "ADMIN" && role !== "MEMBER") {
        return {
            success: false,
            error: "Only workspace members share read receipts",
        };
    }

    try {
        const message = await db.message.findFirst({
            where: { id: messageId, workspaceId },
            select: { createdAt: true },
        });
        if (!message) {
            return {
                success: false,
                error: "That message is no longer in this channel",
            };
        }

        // Forward-only: an older message arriving late never rewinds the cursor
        const advanced = await db.chatReadCursor.updateMany({
            where: {
                workspaceId,
                userId,
                lastReadAt: { lt: message.createdAt },
            },
            data: { lastReadAt: message.createdAt },
        });

        if (advanced.count === 0) {
            await db.chatReadCursor.upsert({
                where: { workspaceId_userId: { workspaceId, userId } },
                create: { workspaceId, userId, lastReadAt: message.createdAt },
                update: {},
            });
        }

        const cursor = await db.chatReadCursor.findUniqueOrThrow({
            where: { workspaceId_userId: { workspaceId, userId } },
            select: {
                lastReadAt: true,
                user: {
                    select: { id: true, name: true, email: true, image: true },
                },
            },
        });

        return {
            success: true,
            data: {
                user: cursor.user,
                lastReadAt: cursor.lastReadAt.toISOString(),
            },
        };
    } catch (error) {
        console.error("[Chat] Failed to record read cursor:", error);
        return { success: false, error: "Failed to record read receipt" };
    }
}
