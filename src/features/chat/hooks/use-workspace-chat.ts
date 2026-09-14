"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import { getUserColor } from "@/lib/presence";

import { sendMessageAction } from "../actions/send-message";
import {
    CHAT_BROADCAST_LIMIT,
    TYPING_THROTTLE_MS,
    TYPING_TIMEOUT_MS,
    type ChatBroadcast,
    type ChatConnectionStatus,
    type ChatMessage,
    type ChatPresenceUser,
} from "../types";

const MESSAGES_KEY = "messages";
/** Cadence at which stale typing flags are re-evaluated. */
const TYPING_SWEEP_MS = 1_000;

export interface UseWorkspaceChatOptions {
    workspaceId: string;
    initialMessages: ChatMessage[];
    currentUser: {
        id: string;
        name: string;
        email?: string | null;
        image?: string | null;
    };
    /** GUEST members read the channel without contributing presence noise or messages. */
    canPost: boolean;
}

export interface UseWorkspaceChatResult {
    messages: ChatMessage[];
    participants: ChatPresenceUser[];
    typingUsers: ChatPresenceUser[];
    connectionStatus: ChatConnectionStatus;
    isSending: boolean;
    sendMessage: (body: string) => Promise<void>;
    notifyTyping: () => void;
    retryMessage: (messageId: string) => Promise<void>;
}

function sortByCreatedAt(messages: ChatMessage[]): ChatMessage[] {
    return [...messages].sort((a, b) => {
        const delta =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return delta !== 0 ? delta : a.id.localeCompare(b.id);
    });
}

function isBroadcast(value: unknown): value is ChatBroadcast {
    if (typeof value !== "object" || value === null) return false;
    const candidate = value as Partial<ChatBroadcast>;
    return (
        typeof candidate.id === "string" &&
        typeof candidate.body === "string" &&
        typeof candidate.createdAt === "string" &&
        typeof candidate.author === "object" &&
        candidate.author !== null &&
        typeof candidate.author.id === "string"
    );
}

function resolveWebSocketUrl(): string {
    const configured = process.env.NEXT_PUBLIC_COLLAB_WS_URL;
    if (configured) return configured;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const hostname = window.location.hostname || "localhost";
    return `${protocol}//${hostname}:1234`;
}

/**
 * Realtime workspace chat over the shared Yjs collaboration server.
 *
 * PostgreSQL is the source of truth: a message is persisted by a Server Action first,
 * then appended to a `Y.Array` that fans it out to every other connected client.
 * Awareness carries online presence and typing state. Messages are de-duplicated by
 * database id, so the seeded history and the CRDT replay converge on one list.
 */
export function useWorkspaceChat({
    workspaceId,
    initialMessages,
    currentUser,
    canPost,
}: UseWorkspaceChatOptions): UseWorkspaceChatResult {
    const lastTypingSentRef = useRef<number>(0);
    const pendingBodiesRef = useRef<Map<string, string>>(new Map());

    const [messages, setMessages] = useState<ChatMessage[]>(() =>
        sortByCreatedAt(initialMessages),
    );
    const [isSending, setIsSending] = useState(false);
    const [baseParticipants, setBaseParticipants] = useState<
        ChatPresenceUser[]
    >([]);
    const [typingUserIds, setTypingUserIds] = useState<ReadonlySet<string>>(
        () => new Set<string>(),
    );

    const [ydoc] = useState<Y.Doc>(() => new Y.Doc());

    const [provider] = useState<WebsocketProvider | null>(() => {
        if (typeof window === "undefined") return null;

        try {
            return new WebsocketProvider(
                resolveWebSocketUrl(),
                `chat:${workspaceId}`,
                ydoc,
                { connect: false },
            );
        } catch (error) {
            console.warn(
                "[Chat] Failed to instantiate WebsocketProvider:",
                error,
            );
            return null;
        }
    });

    // Always starts at "connecting" so the server render and the first client render
    // agree — the provider only exists in the browser, and the status effects below
    // settle it within a tick of mounting
    const [connectionStatus, setConnectionStatus] =
        useState<ChatConnectionStatus>("connecting");

    const mergeBroadcasts = useCallback((incoming: ChatBroadcast[]) => {
        if (incoming.length === 0) return;

        setMessages((prev) => {
            const byId = new Map(prev.map((message) => [message.id, message]));
            let changed = false;

            for (const broadcast of incoming) {
                const existing = byId.get(broadcast.id);
                if (existing && existing.deliveryState === "sent") continue;

                byId.set(broadcast.id, {
                    ...broadcast,
                    deliveryState: "sent",
                });
                changed = true;
            }

            return changed ? sortByCreatedAt(Array.from(byId.values())) : prev;
        });
    }, []);

    // Observe the shared message array
    useEffect(() => {
        const yMessages = ydoc.getArray<ChatBroadcast>(MESSAGES_KEY);

        const syncFromDoc = () => {
            mergeBroadcasts(yMessages.toArray().filter(isBroadcast));
        };

        syncFromDoc();
        yMessages.observe(syncFromDoc);

        return () => {
            yMessages.unobserve(syncFromDoc);
        };
    }, [ydoc, mergeBroadcasts]);

    /**
     * Recomputes which peers are currently typing.
     *
     * Awareness goes quiet once a peer stops, so this runs both on every awareness
     * update and on a timer — the timer is what actually expires a stale flag.
     */
    const sweepTyping = useCallback(() => {
        if (!provider) return;

        const { awareness } = provider;
        const stillTyping = new Set<string>();

        awareness.getStates().forEach((state, clientId) => {
            const user = state.user as { id?: string } | undefined;
            const typing = state.typing as { typingAt?: number } | undefined;
            if (!user?.id || typeof typing?.typingAt !== "number") return;
            if (clientId === awareness.clientID) return;
            if (user.id === currentUser.id) return;

            if (Date.now() - typing.typingAt < TYPING_TIMEOUT_MS) {
                stillTyping.add(user.id);
            }
        });

        setTypingUserIds((previous) => {
            const unchanged =
                previous.size === stillTyping.size &&
                Array.from(stillTyping).every((id) => previous.has(id));
            return unchanged ? previous : stillTyping;
        });
    }, [provider, currentUser.id]);

    useEffect(() => {
        const intervalId = setInterval(sweepTyping, TYPING_SWEEP_MS);
        return () => clearInterval(intervalId);
    }, [sweepTyping]);

    // Connect the provider and publish presence
    useEffect(() => {
        if (!provider) return;

        const { awareness } = provider;

        awareness.setLocalStateField("user", {
            id: currentUser.id,
            name: currentUser.name,
            color: getUserColor(currentUser.id),
            avatarUrl: currentUser.image ?? null,
        });
        awareness.setLocalStateField("typing", { typingAt: 0 });

        const handleStatus = (event: { status: string }) => {
            if (event.status === "connected") {
                setConnectionStatus("connected");
            } else if (event.status === "connecting") {
                setConnectionStatus("connecting");
            } else {
                setConnectionStatus("disconnected");
            }
        };

        const handleSync = (isSynced: boolean) => {
            if (isSynced) setConnectionStatus("synced");
        };

        const handleAwarenessChange = () => {
            const states = awareness.getStates();
            const byUserId = new Map<string, ChatPresenceUser>();

            states.forEach((state, clientId) => {
                const user = state.user as
                    | {
                          id?: string;
                          name?: string;
                          color?: string;
                          avatarUrl?: string | null;
                      }
                    | undefined;
                if (!user?.id) return;

                const isSelf =
                    user.id === currentUser.id ||
                    clientId === awareness.clientID;

                byUserId.set(user.id, {
                    id: user.id,
                    name: user.name || "Anonymous",
                    color: user.color || getUserColor(user.id),
                    avatarUrl: user.avatarUrl ?? null,
                    isTyping: false,
                    isSelf,
                });
            });

            const next = Array.from(byUserId.values()).sort((a, b) => {
                if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
                return a.name.localeCompare(b.name);
            });

            setBaseParticipants(next);
            sweepTyping();
        };

        handleAwarenessChange();

        provider.on("status", handleStatus);
        provider.on("sync", handleSync);
        awareness.on("change", handleAwarenessChange);
        awareness.on("update", handleAwarenessChange);
        provider.connect();

        return () => {
            provider.off("status", handleStatus);
            provider.off("sync", handleSync);
            awareness.off("change", handleAwarenessChange);
            awareness.off("update", handleAwarenessChange);
            provider.disconnect();
        };
    }, [
        provider,
        currentUser.id,
        currentUser.name,
        currentUser.image,
        sweepTyping,
    ]);

    const participants = useMemo(
        () =>
            baseParticipants.map((participant) => ({
                ...participant,
                isTyping: typingUserIds.has(participant.id),
            })),
        [baseParticipants, typingUserIds],
    );

    const typingUsers = useMemo(
        () => participants.filter((participant) => participant.isTyping),
        [participants],
    );

    const notifyTyping = useCallback(() => {
        if (!provider || !canPost) return;

        const now = Date.now();
        if (now - lastTypingSentRef.current < TYPING_THROTTLE_MS) return;

        lastTypingSentRef.current = now;
        provider.awareness.setLocalStateField("typing", { typingAt: now });
    }, [provider, canPost]);

    const clearTyping = useCallback(() => {
        if (!provider) return;
        lastTypingSentRef.current = 0;
        provider.awareness.setLocalStateField("typing", { typingAt: 0 });
    }, [provider]);

    const broadcast = useCallback(
        (message: ChatBroadcast) => {
            const yMessages = ydoc.getArray<ChatBroadcast>(MESSAGES_KEY);

            if (yMessages.toArray().some((entry) => entry?.id === message.id)) {
                return;
            }

            yMessages.push([message]);

            // Keep the in-memory CRDT room bounded; PostgreSQL holds the full history
            const overflow = yMessages.length - CHAT_BROADCAST_LIMIT;
            if (overflow > 0) {
                yMessages.delete(0, overflow);
            }
        },
        [ydoc],
    );

    const deliver = useCallback(
        async (localId: string, body: string) => {
            setIsSending(true);
            try {
                const result = await sendMessageAction({ workspaceId, body });

                if (!result.success) {
                    setMessages((prev) =>
                        prev.map((message) =>
                            message.id === localId
                                ? { ...message, deliveryState: "failed" }
                                : message,
                        ),
                    );
                    return result.error;
                }

                pendingBodiesRef.current.delete(localId);

                // Swap the optimistic row for the persisted one, keyed by database id
                setMessages((prev) =>
                    sortByCreatedAt(
                        prev
                            .filter((message) => message.id !== localId)
                            .concat({
                                ...result.data,
                                deliveryState: "sent",
                            }),
                    ),
                );

                broadcast(result.data);
                return null;
            } catch (error) {
                console.error("[Chat] Failed to deliver message:", error);
                setMessages((prev) =>
                    prev.map((message) =>
                        message.id === localId
                            ? { ...message, deliveryState: "failed" }
                            : message,
                    ),
                );
                return "Failed to send message";
            } finally {
                setIsSending(false);
            }
        },
        [workspaceId, broadcast],
    );

    const sendMessage = useCallback(
        async (rawBody: string) => {
            const body = rawBody.trim();
            if (body.length === 0 || !canPost) return;

            const localId = `local-${
                typeof crypto !== "undefined" &&
                typeof crypto.randomUUID === "function"
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
            }`;

            pendingBodiesRef.current.set(localId, body);
            clearTyping();

            setMessages((prev) =>
                sortByCreatedAt([
                    ...prev,
                    {
                        id: localId,
                        body,
                        createdAt: new Date().toISOString(),
                        author: {
                            id: currentUser.id,
                            name: currentUser.name,
                            email: currentUser.email ?? null,
                            image: currentUser.image ?? null,
                        },
                        deliveryState: "sending",
                    },
                ]),
            );

            const error = await deliver(localId, body);
            if (error) {
                const { toast } = await import("sonner");
                toast.error(error);
            }
        },
        [canPost, clearTyping, currentUser, deliver],
    );

    const retryMessage = useCallback(
        async (messageId: string) => {
            const body = pendingBodiesRef.current.get(messageId);
            if (!body) return;

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === messageId
                        ? { ...message, deliveryState: "sending" }
                        : message,
                ),
            );

            const error = await deliver(messageId, body);
            if (error) {
                const { toast } = await import("sonner");
                toast.error(error);
            }
        },
        [deliver],
    );

    return {
        messages,
        participants,
        typingUsers,
        connectionStatus,
        isSending,
        sendMessage,
        notifyTyping,
        retryMessage,
    };
}
