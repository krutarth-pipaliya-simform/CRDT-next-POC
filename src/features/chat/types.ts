import type { User } from "@prisma/client";

export type ChatAuthor = Pick<User, "id" | "name" | "email" | "image">;

/** One shared file on a message. `url` is served by `/api/uploads/chat/…` to members only. */
export interface ChatAttachment {
    url: string;
    name: string;
    /** Content type from the allow-list, never the browser's claim. */
    type: string;
    /** Bytes. */
    size: number;
}

/** Delivery state of a message in the local list. Persisted messages are "sent". */
export type ChatDeliveryState = "sending" | "sent" | "failed";

export interface ChatMessage {
    id: string;
    body: string;
    /** ISO string — keeps server payloads and CRDT broadcasts identically shaped. */
    createdAt: string;
    author: ChatAuthor;
    attachment: ChatAttachment | null;
    deliveryState: ChatDeliveryState;
}

/**
 * Shape appended to the shared `Y.Array` after a message is persisted.
 * Only durable fields travel over the CRDT; delivery state is local to each client.
 */
export interface ChatBroadcast {
    id: string;
    body: string;
    createdAt: string;
    author: ChatAuthor;
    attachment: ChatAttachment | null;
}

/**
 * How far one member has read the channel. Persisted as a `ChatReadCursor`
 * row, then written to the room's shared `Y.Map` under the reader's id so
 * other clients move their "Seen by" marker without a reload.
 */
export interface ChatReadReceipt {
    user: ChatAuthor;
    /** ISO string: the `createdAt` of the latest message the reader has seen. */
    lastReadAt: string;
}

export interface ChatPresenceUser {
    id: string;
    name: string;
    color: string;
    avatarUrl: string | null;
    isTyping: boolean;
    isSelf: boolean;
}

export type ChatConnectionStatus =
    "connecting" | "connected" | "disconnected" | "synced";

/** Awareness field written while the local user is composing. */
export interface ChatTypingAwareness {
    typingAt: number;
}

/** How long after the last keystroke a peer is still considered "typing". */
export const TYPING_TIMEOUT_MS = 4_000;

/** Minimum gap between awareness writes while typing continuously. */
export const TYPING_THROTTLE_MS = 1_500;

/** Messages loaded from PostgreSQL when the chat page renders. */
export const CHAT_HISTORY_LIMIT = 50;

/** Quiet period before a read cursor is written, so a burst of messages costs one write. */
export const READ_RECEIPT_DEBOUNCE_MS = 800;

/** Upper bound on messages retained in the shared CRDT array. */
export const CHAT_BROADCAST_LIMIT = 300;
