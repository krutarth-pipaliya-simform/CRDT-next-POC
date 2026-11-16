"use server";

import { randomUUID } from "crypto";

import { auth } from "@/features/auth/lib/auth";
import { resolveMentionedUserIds } from "@/features/notification/lib/mentions";
import { notify } from "@/features/notification/lib/notify";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { deleteUpload, saveUpload } from "@/lib/upload-storage";
import {
    chatAttachmentExtension,
    chatAttachmentKind,
    sendMessageSchema,
} from "@/schemas/chat";

import { chatMessageSelect, toChatBroadcast } from "../lib/message-select";
import { sniffAttachment } from "../lib/sniff-attachment";
import type { ChatAttachment, ChatBroadcast } from "../types";

export type SendMessageResult =
    { success: true; data: ChatBroadcast } | { success: false; error: string };

type StoreAttachmentResult =
    { success: true; data: ChatAttachment } | { success: false; error: string };

/** Mention previews in the notification body are truncated to this length. */
const MENTION_PREVIEW_LENGTH = 140;

/**
 * Checks a validated file's bytes against its extension and stores it under
 * `chat/<workspaceId>/`. The stored name is random; the original name lives
 * only on the message row, for display and as the download filename.
 */
async function storeAttachment(
    workspaceId: string,
    file: File,
): Promise<StoreAttachmentResult> {
    const extension = chatAttachmentExtension(file.name);
    const kind = chatAttachmentKind(file.name);
    if (!kind) {
        return { success: false, error: "That file type can't be shared" };
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!sniffAttachment(bytes, kind.signature)) {
        return {
            success: false,
            error: `"${file.name}" is not a valid .${extension} file, so it was not shared. Check the file and attach it again.`,
        };
    }

    const url = await saveUpload(
        ["chat", workspaceId, `${randomUUID()}.${extension}`],
        bytes,
    );

    return {
        success: true,
        data: {
            url,
            name: file.name,
            type: kind.contentType,
            size: bytes.byteLength,
        },
    };
}

async function notifyMentions(
    workspaceId: string,
    authorId: string,
    authorName: string,
    body: string,
) {
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

    if (mentionedUserIds.length === 0) return;

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

/**
 * Persists a chat message, with at most one attached file, before the client
 * fans it out on the CRDT room. Accepts `FormData` (`workspaceId`, `body`,
 * optional `file`) or a plain object. A message may be attachment-only.
 */
export async function sendMessageAction(
    input: unknown,
): Promise<SendMessageResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            error: "Your session has expired. Log in again to send messages.",
        };
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

    const { workspaceId, body, file } = validated.data;
    const authorId = session.user.id;

    if (body.length === 0 && !file) {
        return { success: false, error: "Message cannot be empty" };
    }

    const role = await getWorkspaceRole(workspaceId);
    if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
        return {
            success: false,
            error: "You do not have permission to post in this workspace",
        };
    }

    let attachment: ChatAttachment | null = null;
    if (file) {
        try {
            const stored = await storeAttachment(workspaceId, file);
            if (!stored.success) return stored;
            attachment = stored.data;
        } catch (error) {
            console.error("[Chat] Failed to store attachment:", error);
            return {
                success: false,
                error: "The file could not be saved. Try again in a moment.",
            };
        }
    }

    let message: ChatBroadcast;
    try {
        const row = await db.message.create({
            data: {
                workspaceId,
                authorId,
                body,
                attachmentUrl: attachment?.url,
                attachmentName: attachment?.name,
                attachmentType: attachment?.type,
                attachmentSize: attachment?.size,
            },
            select: chatMessageSelect,
        });
        message = toChatBroadcast(row);
    } catch (error) {
        console.error("[Chat] Failed to send message:", error);
        // No row points at the stored file, so nobody could ever fetch it
        await deleteUpload(attachment?.url ?? null);
        return { success: false, error: "Failed to send message" };
    }

    if (body.length > 0) {
        try {
            await notifyMentions(
                workspaceId,
                authorId,
                message.author.name || message.author.email || "Someone",
                body,
            );
        } catch (error) {
            // Best-effort: the message is already persisted
            console.error("[Chat] Failed to resolve mentions:", error);
        }
    }

    return { success: true, data: message };
}
