import type { Prisma } from "@prisma/client";

import type { ChatBroadcast } from "../types";

/** Columns every chat read needs, so the action and the history query agree. */
export const chatMessageSelect = {
    id: true,
    body: true,
    createdAt: true,
    attachmentUrl: true,
    attachmentName: true,
    attachmentType: true,
    attachmentSize: true,
    author: {
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    },
} satisfies Prisma.MessageSelect;

export type ChatMessageRow = Prisma.MessageGetPayload<{
    select: typeof chatMessageSelect;
}>;

/** A persisted row in the shape that travels to clients and over the CRDT. */
export function toChatBroadcast(row: ChatMessageRow): ChatBroadcast {
    const { attachmentUrl, attachmentName, attachmentType, attachmentSize } =
        row;

    return {
        id: row.id,
        body: row.body,
        createdAt: row.createdAt.toISOString(),
        author: row.author,
        attachment:
            attachmentUrl !== null &&
            attachmentName !== null &&
            attachmentType !== null &&
            attachmentSize !== null
                ? {
                      url: attachmentUrl,
                      name: attachmentName,
                      type: attachmentType,
                      size: attachmentSize,
                  }
                : null,
    };
}
