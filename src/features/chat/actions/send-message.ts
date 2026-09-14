"use server";

import { auth } from "@/features/auth/lib/auth";
import { resolveMentionedUserIds } from "@/features/notification/lib/mentions";
import { notify } from "@/features/notification/lib/notify";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { sendMessageSchema } from "@/schemas/chat";

import type { ChatBroadcast } from "../types";

export type SendMessageResult =
    { success: true; data: ChatBroadcast } | { success: false; error: string };

/** Mention previews in the notification body are truncated to this length. */
const MENTION_PREVIEW_LENGTH = 140;

export async function sendMessageAction(
    input: unknown,
): Promise<SendMessageResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const rawData =
        input instanceof FormData ? Object.fromEntries(input.entries()) : input;

    const validated = sendMessageSchema.safeParse(rawData);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { workspaceId, body } = validated.data;
    const authorId = session.user.id;

    const role = await getWorkspaceRole(workspaceId);
    if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
        return {
            success: false,
            error: "You do not have permission to post in this workspace",
        };
    }

    try {
        const message = await db.message.create({
            data: { workspaceId, authorId, body },
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
        });

        const members = await db.workspaceMember.findMany({
            where: { workspaceId },
            select: {
                userId: true,
                user: { select: { name: true, email: true } },
            },
        });

        const mentionedUserIds = resolveMentionedUserIds(
            body,
            members.map((member) => ({
                userId: member.userId,
                name: member.user.name,
                email: member.user.email,
            })),
        );

        if (mentionedUserIds.length > 0) {
            const authorName =
                message.author.name || message.author.email || "Someone";

            await notify({
                type: "MENTION",
                title: `${authorName} mentioned you in chat`,
                body:
                    body.length > MENTION_PREVIEW_LENGTH
                        ? `${body.slice(0, MENTION_PREVIEW_LENGTH)}…`
                        : body,
                href: `/${workspaceId}/chat`,
                workspaceId,
                actorId: authorId,
                recipientIds: mentionedUserIds,
                excludeUserIds: [authorId],
            });
        }

        return {
            success: true,
            data: {
                id: message.id,
                body: message.body,
                createdAt: message.createdAt.toISOString(),
                author: message.author,
            },
        };
    } catch {
        return { success: false, error: "Failed to send message" };
    }
}
