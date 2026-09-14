"use server";

import { auth } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { markNotificationReadSchema } from "@/schemas/notification";

export type MarkNotificationReadResult =
    | { success: true; data: { unreadCount: number } }
    | { success: false; error: string };

export async function markNotificationReadAction(
    input: unknown,
): Promise<MarkNotificationReadResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = markNotificationReadSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const recipientId = session.user.id;

    try {
        // Scoping the update by recipientId makes a foreign notification a no-op, not an error
        await db.notification.updateMany({
            where: {
                id: validated.data.notificationId,
                recipientId,
                readAt: null,
            },
            data: { readAt: new Date() },
        });

        const unreadCount = await db.notification.count({
            where: { recipientId, readAt: null },
        });

        return { success: true, data: { unreadCount } };
    } catch {
        return { success: false, error: "Failed to mark notification as read" };
    }
}
