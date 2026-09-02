"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import { saveDocumentAction } from "../actions/save-document";
import { getUserColor } from "../lib/user-colors";
import type {
    ConnectionStatus,
    PresenceUser,
    ReadOnlyReason,
    SaveState,
} from "../types";

export interface UseDocumentCollabOptions {
    documentId: string;
    workspaceId: string;
    initialTitle: string;
    initialContentBase64?: string | null;
    currentUser: {
        id: string;
        name: string;
        image?: string | null;
    };
}

export interface UseDocumentCollabResult {
    ydoc: Y.Doc;
    provider: WebsocketProvider | null;
    saveState: SaveState;
    lastSavedAt: Date | null;
    collaborators: PresenceUser[];
    connectionStatus: ConnectionStatus;
    title: string;
    setTitle: (title: string) => void;
    saveNow: () => Promise<void>;
    isReadOnly: boolean;
    readOnlyReason: ReadOnlyReason;
    takeOverEditing: () => void;
}

export function useDocumentCollab({
    documentId,
    workspaceId,
    initialTitle,
    initialContentBase64,
    currentUser,
}: UseDocumentCollabOptions): UseDocumentCollabResult {
    const sessionIdRef = useRef<string>("");
    const joinedAtRef = useRef<number>(0);
    const takeoverTimestampRef = useRef<number>(0);

    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
    const [readOnlyReason, setReadOnlyReason] = useState<ReadOnlyReason>(null);
    const isReadOnlyRef = useRef<boolean>(false);

    useEffect(() => {
        isReadOnlyRef.current = isReadOnly;
    }, [isReadOnly]);

    const [ydoc] = useState<Y.Doc>(() => {
        const doc = new Y.Doc();
        if (initialContentBase64) {
            try {
                const binary = Uint8Array.from(
                    atob(initialContentBase64),
                    (c) => c.charCodeAt(0),
                );
                Y.applyUpdate(doc, binary);
            } catch (err) {
                console.error(
                    "[Yjs] Failed to apply initial content update:",
                    err,
                );
            }
        }
        return doc;
    });

    const [provider] = useState<WebsocketProvider | null>(() => {
        if (typeof window === "undefined") return null;

        const roomName = `${workspaceId}:${documentId}`;
        const wsProtocol =
            window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHostname = window.location.hostname || "localhost";
        const defaultWsUrl = `${wsProtocol}//${wsHostname}:1234`;
        const wsUrl = process.env.NEXT_PUBLIC_COLLAB_WS_URL || defaultWsUrl;

        try {
            const wsProvider = new WebsocketProvider(wsUrl, roomName, ydoc, {
                connect: false,
            });

            const userColor = getUserColor(currentUser.id);
            wsProvider.awareness.setLocalStateField("user", {
                id: currentUser.id,
                name: currentUser.name,
                color: userColor,
                avatarUrl: currentUser.image ?? null,
            });

            return wsProvider;
        } catch (err) {
            console.warn(
                "[Collab] Failed to instantiate WebsocketProvider:",
                err,
            );
            return null;
        }
    });

    const [saveState, setSaveState] = useState<SaveState>(() =>
        !provider ? "offline" : "idle",
    );
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [collaborators, setCollaborators] = useState<PresenceUser[]>(() => [
        {
            id: currentUser.id,
            name: currentUser.name || "Anonymous",
            color: getUserColor(currentUser.id),
            avatarUrl: currentUser.image ?? null,
            lastActive: 0,
        },
    ]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
        () => {
            if (!provider) return "disconnected";
            if (provider.synced) return "synced";
            if (provider.wsconnected) return "connected";
            return "connecting";
        },
    );
    const [title, setTitle] = useState<string>(initialTitle);

    const isDirtyRef = useRef(false);
    const titleRef = useRef(title);

    useEffect(() => {
        titleRef.current = title;
    }, [title]);

    const takeOverEditing = useCallback(() => {
        if (!provider) return;
        const now = Date.now();
        takeoverTimestampRef.current = now;
        provider.awareness.setLocalStateField("session", {
            sessionId: sessionIdRef.current,
            joinedAt: joinedAtRef.current,
            takeoverTimestamp: now,
        });
    }, [provider]);

    // Setup Local Persistence (IndexedDB) and WebSocket event listeners
    useEffect(() => {
        if (!sessionIdRef.current) {
            sessionIdRef.current =
                typeof crypto !== "undefined" &&
                typeof crypto.randomUUID === "function"
                    ? crypto.randomUUID()
                    : `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        }
        if (joinedAtRef.current === 0) {
            joinedAtRef.current = Date.now();
        }

        const indexeddbProvider = new IndexeddbPersistence(
            `crdt-doc-${documentId}`,
            ydoc,
        );

        if (!provider) {
            return () => {
                indexeddbProvider.destroy();
            };
        }

        const userColor = getUserColor(currentUser.id);
        provider.awareness.setLocalStateField("user", {
            id: currentUser.id,
            name: currentUser.name,
            color: userColor,
            avatarUrl: currentUser.image ?? null,
        });

        provider.awareness.setLocalStateField("session", {
            sessionId: sessionIdRef.current,
            joinedAt: joinedAtRef.current,
            takeoverTimestamp: takeoverTimestampRef.current,
        });

        const handleStatus = (event: { status: string }) => {
            if (event.status === "connected") {
                setConnectionStatus("connected");
                setSaveState((prev) => (prev === "offline" ? "idle" : prev));
            } else if (event.status === "connecting") {
                setConnectionStatus("connecting");
            } else {
                setConnectionStatus("disconnected");
                setSaveState("offline");
            }
        };

        const handleSync = (isSynced: boolean) => {
            if (isSynced) {
                setConnectionStatus("synced");
            }
        };

        const handleAwarenessChange = () => {
            const states = provider.awareness.getStates();
            if (!states) return;

            const users: PresenceUser[] = [];
            const mySessions: Array<{
                clientId: number;
                sessionId: string;
                joinedAt: number;
                takeoverTimestamp: number;
            }> = [];

            states.forEach((state, clientId) => {
                if (state.user) {
                    const userId =
                        typeof state.user.id === "string" && state.user.id
                            ? state.user.id
                            : clientId === provider.awareness.clientID
                              ? currentUser.id
                              : `user-${clientId}`;
                    const userName =
                        state.user.name || "Anonymous Collaborator";
                    const color = state.user.color || getUserColor(userId);
                    const avatarUrl = state.user.avatarUrl || null;

                    users.push({
                        id: userId,
                        name: userName,
                        color,
                        avatarUrl,
                        lastActive: Date.now(),
                    });

                    if (
                        userId === currentUser.id ||
                        state.user.id === currentUser.id
                    ) {
                        const sess =
                            (state.session as
                                | {
                                      sessionId?: string;
                                      joinedAt?: number;
                                      takeoverTimestamp?: number;
                                  }
                                | undefined) || {};
                        const sessId =
                            typeof sess.sessionId === "string"
                                ? sess.sessionId
                                : String(clientId);
                        const joinedAt =
                            typeof sess.joinedAt === "number"
                                ? sess.joinedAt
                                : 0;
                        const takeover =
                            typeof sess.takeoverTimestamp === "number"
                                ? sess.takeoverTimestamp
                                : 0;
                        mySessions.push({
                            clientId,
                            sessionId: sessId,
                            joinedAt,
                            takeoverTimestamp: takeover,
                        });
                    }
                }
            });

            // Ensure current user is always included in active collaborators
            const hasCurrentUser = users.some((u) => u.id === currentUser.id);
            if (!hasCurrentUser) {
                users.push({
                    id: currentUser.id,
                    name: currentUser.name || "Anonymous",
                    color: getUserColor(currentUser.id),
                    avatarUrl: currentUser.image ?? null,
                    lastActive: Date.now(),
                });
            }

            // Deduplicate by user ID for collaborator avatars
            const uniqueUsers = Array.from(
                new Map(users.map((u) => [u.id, u])).values(),
            );

            // Sort so current user is always first, then other collaborators alphabetically
            uniqueUsers.sort((a, b) => {
                if (a.id === currentUser.id) return -1;
                if (b.id === currentUser.id) return 1;
                return a.name.localeCompare(b.name);
            });

            setCollaborators(uniqueUsers);

            // Multi-session conflict resolution for currentUser
            if (mySessions.length <= 1) {
                setIsReadOnly((prev) => {
                    if (prev) {
                        import("sonner").then(({ toast }) => {
                            toast.success("Edit access active", {
                                description:
                                    "You now have edit access to this document.",
                                duration: 3000,
                            });
                        });
                    }
                    return false;
                });
                setReadOnlyReason(null);
            } else {
                // Determine active editor:
                // 1. Session with highest takeoverTimestamp > 0
                // 2. If all takeoverTimestamp === 0, session with oldest joinedAt
                // 3. Tiebreaker: lowest clientId
                let activeSession = mySessions[0];
                for (let i = 1; i < mySessions.length; i++) {
                    const curr = mySessions[i];
                    if (
                        curr.takeoverTimestamp > activeSession.takeoverTimestamp
                    ) {
                        activeSession = curr;
                    } else if (
                        curr.takeoverTimestamp ===
                        activeSession.takeoverTimestamp
                    ) {
                        if (
                            curr.joinedAt < activeSession.joinedAt ||
                            (curr.joinedAt === activeSession.joinedAt &&
                                curr.clientId < activeSession.clientId)
                        ) {
                            activeSession = curr;
                        }
                    }
                }

                const localClientId = provider.awareness.clientID;
                const isMe =
                    activeSession.clientId === localClientId ||
                    activeSession.sessionId === sessionIdRef.current;

                if (isMe) {
                    setIsReadOnly((prev) => {
                        if (prev) {
                            import("sonner").then(({ toast }) => {
                                toast.success("Edit access active", {
                                    description:
                                        "You have edit access in this session.",
                                    duration: 3000,
                                });
                            });
                        }
                        return false;
                    });
                    setReadOnlyReason(null);
                } else {
                    setIsReadOnly((prev) => {
                        if (!prev) {
                            setReadOnlyReason("taken_over");
                        } else {
                            setReadOnlyReason(
                                (prevReason) => prevReason || "another_session",
                            );
                        }
                        return true;
                    });
                }
            }
        };

        // Immediately sync awareness state
        handleAwarenessChange();

        provider.on("status", handleStatus);
        provider.on("sync", handleSync);
        provider.awareness.on("change", handleAwarenessChange);
        provider.awareness.on("update", handleAwarenessChange);
        provider.connect();

        return () => {
            provider.off("status", handleStatus);
            provider.off("sync", handleSync);
            provider.awareness.off("change", handleAwarenessChange);
            provider.awareness.off("update", handleAwarenessChange);
            provider.disconnect();
            indexeddbProvider.destroy();
        };
    }, [
        documentId,
        ydoc,
        provider,
        currentUser.id,
        currentUser.name,
        currentUser.image,
    ]);

    // Mark document dirty on Y.Doc updates ONLY if active editor
    useEffect(() => {
        const handleUpdate = () => {
            if (isReadOnlyRef.current) return;
            isDirtyRef.current = true;
            setSaveState((prev) =>
                prev === "offline" ? "offline" : "pending",
            );
        };

        ydoc.on("update", handleUpdate);
        return () => {
            ydoc.off("update", handleUpdate);
        };
    }, [ydoc]);

    // Save procedure
    const performSave = useCallback(async () => {
        if (!isDirtyRef.current || isReadOnlyRef.current) return;

        setSaveState("saving");
        try {
            const updateState = Y.encodeStateAsUpdate(ydoc);
            const binaryString = Array.from(updateState, (byte) =>
                String.fromCharCode(byte),
            ).join("");
            const contentBase64 = btoa(binaryString);

            const result = await saveDocumentAction({
                id: documentId,
                workspaceId,
                title: titleRef.current,
                contentBase64,
            });

            if (result.success) {
                isDirtyRef.current = false;
                setSaveState("saved");
                setLastSavedAt(new Date(result.data.updatedAt));
            } else {
                setSaveState("failed");
            }
        } catch (err) {
            console.error("[Autosave] Failed to persist document:", err);
            setSaveState("failed");
        }
    }, [documentId, workspaceId, ydoc]);

    // FR-10: 5-second dirty-checked autosave interval
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (isDirtyRef.current && !isReadOnlyRef.current) {
                performSave();
            }
        }, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, [performSave]);

    const handleTitleChange = useCallback((newTitle: string) => {
        if (isReadOnlyRef.current) return;
        setTitle(newTitle);
        titleRef.current = newTitle;
        isDirtyRef.current = true;
        setSaveState("pending");
    }, []);

    return {
        ydoc,
        provider,
        saveState,
        lastSavedAt,
        collaborators,
        connectionStatus,
        title,
        setTitle: handleTitleChange,
        saveNow: performSave,
        isReadOnly,
        readOnlyReason,
        takeOverEditing,
    };
}
