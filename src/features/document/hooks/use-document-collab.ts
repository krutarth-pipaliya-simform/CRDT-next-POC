"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import { saveDocumentAction } from "../actions/save-document";
import { getUserColor } from "../lib/user-colors";
import type { ConnectionStatus, PresenceUser, SaveState } from "../types";

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
}

export function useDocumentCollab({
    documentId,
    workspaceId,
    initialTitle,
    initialContentBase64,
    currentUser,
}: UseDocumentCollabOptions): UseDocumentCollabResult {
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
                connect: true,
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

    const [saveState, setSaveState] = useState<SaveState>("idle");
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [collaborators, setCollaborators] = useState<PresenceUser[]>([]);
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>("connecting");
    const [title, setTitle] = useState<string>(initialTitle);

    const isDirtyRef = useRef(false);
    const titleRef = useRef(title);

    useEffect(() => {
        titleRef.current = title;
    }, [title]);

    // Setup Local Persistence (IndexedDB) and WebSocket event listeners
    useEffect(() => {
        const indexeddbProvider = new IndexeddbPersistence(
            `crdt-doc-${documentId}`,
            ydoc,
        );

        if (!provider) {
            return () => {
                indexeddbProvider.destroy();
                ydoc.destroy();
            };
        }

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
            states.forEach((state) => {
                if (state.user && state.user.id) {
                    users.push({
                        id: state.user.id,
                        name: state.user.name || "Anonymous",
                        color: state.user.color || "#2563eb",
                        avatarUrl: state.user.avatarUrl,
                        lastActive: Date.now(),
                    });
                }
            });

            // Deduplicate by user ID
            const uniqueUsers = Array.from(
                new Map(users.map((u) => [u.id, u])).values(),
            );
            setCollaborators(uniqueUsers);
        };

        provider.on("status", handleStatus);
        provider.on("sync", handleSync);
        provider.awareness.on("change", handleAwarenessChange);

        return () => {
            provider.off("status", handleStatus);
            provider.off("sync", handleSync);
            provider.awareness.off("change", handleAwarenessChange);
            provider.destroy();
            indexeddbProvider.destroy();
            ydoc.destroy();
        };
    }, [documentId, ydoc, provider]);

    // Mark document dirty on Y.Doc updates
    useEffect(() => {
        const handleUpdate = () => {
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
        if (!isDirtyRef.current) return;

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
            if (isDirtyRef.current) {
                performSave();
            }
        }, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, [performSave]);

    const handleTitleChange = useCallback((newTitle: string) => {
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
    };
}
