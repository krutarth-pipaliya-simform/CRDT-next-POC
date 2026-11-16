import type { User } from "@prisma/client";

export type ChatAuthor = Pick<User, "id" | "name" | "email" | "image">;

/** Delivery state of a message in the local list. Persisted messages are "sent". */
export type ChatDeliveryState = "sending" | "sent" | "failed";

export interface ChatMessage {
    id: string;
    body: string;
    /** ISO string — keeps server payloads and CRDT broadcasts identically shaped. */
    createdAt: string;
    author: ChatAuthor;
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

/** Upper bound on messages retained in the shared CRDT array. */
export const CHAT_BROADCAST_LIMIT = 300;
