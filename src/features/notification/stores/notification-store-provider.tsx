"use client";

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useStore } from "zustand";

import type { NotificationPayload } from "../types";
import {
    createNotificationStore,
    type NotificationStore,
    type NotificationStoreApi,
} from "./notification-store";

const NotificationStoreContext = createContext<NotificationStoreApi | null>(
    null,
);

/** Changes only when the server sends a different list or total. */
export function notificationSignature(
    notifications: NotificationPayload[],
    unreadCount: number,
): string {
    return `${unreadCount}#${notifications
        .map((item) => `${item.id}:${item.readAt ?? ""}`)
        .join("|")}`;
}

export interface NotificationStoreProviderProps {
    initialNotifications: NotificationPayload[];
    initialUnreadCount: number;
    children: ReactNode;
}

/**
 * Wraps the signed-in shell, so the header bell and a page's activity feed
 * read one store. Created once per mount from the server-rendered inbox.
 */
export function NotificationStoreProvider({
    initialNotifications,
    initialUnreadCount,
    children,
}: NotificationStoreProviderProps) {
    const [store] = useState(() =>
        createNotificationStore({
            notifications: initialNotifications,
            unreadCount: initialUnreadCount,
        }),
    );
    const seededRef = useRef(
        notificationSignature(initialNotifications, initialUnreadCount),
    );

    // Re-seed only when the server actually sends something different, so a
    // plain re-render never clobbers notifications marked read optimistically.
    useEffect(() => {
        const signature = notificationSignature(
            initialNotifications,
            initialUnreadCount,
        );
        if (signature === seededRef.current) return;
        seededRef.current = signature;
        store
            .getState()
            .mergeFromServer(initialNotifications, initialUnreadCount);
    }, [initialNotifications, initialUnreadCount, store]);

    return (
        <NotificationStoreContext.Provider value={store}>
            {children}
        </NotificationStoreContext.Provider>
    );
}

export function useNotificationStoreApi(): NotificationStoreApi {
    const store = useContext(NotificationStoreContext);
    if (!store) {
        throw new Error(
            "useNotificationStore must be used within NotificationStoreProvider",
        );
    }
    return store;
}

/** Subscribe to a slice of the inbox; re-renders only when it changes. */
export function useNotificationStore<T>(
    selector: (state: NotificationStore) => T,
): T {
    return useStore(useNotificationStoreApi(), selector);
}
