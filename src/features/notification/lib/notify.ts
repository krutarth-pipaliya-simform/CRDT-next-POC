import type { NotificationType } from "@prisma/client";

import { db } from "@/lib/db";
import { notificationBus } from "@/lib/notification-bus";

import { toNotificationPayload } from "./serialize";

import "server-only";

export interface NotifyInput {
    type: NotificationType;
    title: string;
    body?: string | null;
    href?: string | null;
    workspaceId: string;
    actorId?: string | null;
    /** Explicit recipients. When omitted, every workspace member is notified. */
    recipientIds?: string[];
    /** Recipients to skip — typically the actor, who should not be told about their own action. */
    excludeUserIds?: string[];
}

const ACTOR_SELECT = {
    id: true,
    name: true,
    email: true,
    image: true,
} as const;

async function resolveRecipients(input: NotifyInput): Promise<string[]> {
    const excluded = new Set(input.excludeUserIds ?? []);

    if (input.recipientIds) {
        return Array.from(new Set(input.recipientIds)).filter(
            (userId) => userId.length > 0 && !excluded.has(userId),
        );
    }

    const members = await db.workspaceMember.findMany({
        where: { workspaceId: input.workspaceId },
        select: { userId: true },
    });

    return Array.from(new Set(members.map((member) => member.userId))).filter(
        (userId) => !excluded.has(userId),
    );
}

/**
 * Persists one notification per recipient, then pushes each row onto the in-process
 * bus so any open SSE stream for that user receives it immediately.
 *
 * Notification delivery is best-effort: failures are logged and swallowed so that a
 * notification problem can never fail the mutation that triggered it.
 */
export async function notify(input: NotifyInput): Promise<void> {
    try {
        const recipientIds = await resolveRecipients(input);
        if (recipientIds.length === 0) return;

        const actor = input.actorId
            ? await db.user.findUnique({
                  where: { id: input.actorId },
                  select: ACTOR_SELECT,
              })
            : null;

        const created = await db.notification.createManyAndReturn({
            data: recipientIds.map((recipientId) => ({
                type: input.type,
                title: input.title,
                body: input.body ?? null,
                href: input.href ?? null,
                workspaceId: input.workspaceId,
                actorId: input.actorId ?? null,
                recipientId,
            })),
        });

        created.forEach((notification) => {
            notificationBus.publish(
                notification.recipientId,
                toNotificationPayload({ ...notification, actor }),
            );
        });
    } catch (error) {
        console.error(
            "[Notifications] Failed to dispatch notification:",
            error,
        );
    }
}
