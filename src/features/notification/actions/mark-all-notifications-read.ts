"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { markAllNotificationsReadSchema } from "@/schemas/notification";

export type MarkAllNotificationsReadResult =
    | { success: true; data: { unreadCount: number } }
    | { success: false; error: string };

export async function markAllNotificationsReadAction(
    input: unknown,
): Promise<MarkAllNotificationsReadResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = markAllNotificationsReadSchema.safeParse(input ?? {});
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const recipientId = session.user.id;
    const { workspaceId } = validated.data;

    try {
        await db.notification.updateMany({
            where: {
                recipientId,
                readAt: null,
                ...(workspaceId ? { workspaceId } : {}),
            },
            data: { readAt: new Date() },
        });

        const unreadCount = await db.notification.count({
            where: { recipientId, readAt: null },
        });

        if (workspaceId) {
            revalidatePath(`/${workspaceId}/activity`);
        }

        return { success: true, data: { unreadCount } };
    } catch {
        return {
            success: false,
            error: "Failed to mark notifications as read",
        };
    }
}
