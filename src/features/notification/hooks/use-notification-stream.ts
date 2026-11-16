"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

import { markAllNotificationsReadAction } from "../actions/mark-all-notifications-read";
import { markNotificationReadAction } from "../actions/mark-notification-read";
import type { NotificationPayload } from "../types";

export type StreamStatus = "connecting" | "live" | "offline";

export interface UseNotificationStreamOptions {
    initialNotifications: NotificationPayload[];
    initialUnreadCount: number;
    /** Called once per notification newly received over the stream. */
    onNotification?: (notification: NotificationPayload) => void;
    /** Maximum notifications retained client-side. */
    limit?: number;
    /**
     * Refresh the page's server data when notifications arrive. Only one
     * consumer per page needs to: the header bell always does, so a second
     * stream on the same page (the activity feed) turns it off.
     */
    refreshOnNotification?: boolean;
}

export interface UseNotificationStreamResult {
    notifications: NotificationPayload[];
    unreadCount: number;
    status: StreamStatus;
    markRead: (notificationId: string) => Promise<void>;
    markAllRead: (workspaceId?: string) => Promise<void>;
}

const RECONNECT_DELAY_MS = 5_000;
const MAX_RECONNECT_DELAY_MS = 60_000;
/** A burst of notifications (a bulk move, a busy chat) becomes one refresh. */
const REFRESH_DEBOUNCE_MS = 750;

/**
 * Subscribes to `/api/notifications/stream` and keeps a live notification list.
 *
 * The server-rendered list seeds the state, then SSE frames prepend onto it — so the
 * bell is correct on first paint and stays current without polling.
 */
export function useNotificationStream({
    initialNotifications,
    initialUnreadCount,
    onNotification,
    limit = 30,
    refreshOnNotification = true,
}: UseNotificationStreamOptions): UseNotificationStreamResult {
    const router = useRouter();
    const refresh = useDebouncedCallback(
        () => router.refresh(),
        REFRESH_DEBOUNCE_MS,
    );
    const onNotificationRef = useRef(onNotification);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const seededSignatureRef = useRef<string | null>(null);

    const [notifications, setNotifications] =
        useState<NotificationPayload[]>(initialNotifications);
    const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
    const [status, setStatus] = useState<StreamStatus>("connecting");

    useEffect(() => {
        onNotificationRef.current = onNotification;
    }, [onNotification]);

    // Re-seed only when the server actually sends a different list, so a plain
    // re-render never clobbers notifications marked read optimistically here
    useEffect(() => {
        const signature = initialNotifications
            .map((item) => `${item.id}:${item.readAt ?? ""}`)
            .join("|");

        if (signature === seededSignatureRef.current) return;

        seededSignatureRef.current = signature;
        setNotifications(initialNotifications);
        setUnreadCount(initialUnreadCount);
    }, [initialNotifications, initialUnreadCount]);

    useEffect(() => {
        let source: EventSource | null = null;
        let disposed = false;
        // Doubles after each failure, so a stream that keeps failing (an
        // expired session) stops retrying every few seconds.
        let reconnectDelay = RECONNECT_DELAY_MS;

        const handleNotification = (event: MessageEvent<string>) => {
            let payload: NotificationPayload;
            try {
                payload = JSON.parse(event.data) as NotificationPayload;
            } catch (error) {
                console.error(
                    "[Notifications] Received an unparsable SSE frame:",
                    error,
                );
                return;
            }

            setNotifications((prev) => {
                if (prev.some((item) => item.id === payload.id)) {
                    return prev;
                }
                return [payload, ...prev].slice(0, limit);
            });

            if (!payload.readAt) {
                setUnreadCount((prev) => prev + 1);
            }

            onNotificationRef.current?.(payload);

            // Pull fresh server data for whatever the notification refers to
            if (refreshOnNotification) refresh.schedule();
        };

        const connect = () => {
            if (disposed) return;

            setStatus("connecting");

            if (typeof EventSource === "undefined") {
                setStatus("offline");
                return;
            }

            source = new EventSource("/api/notifications/stream");

            const markLive = () => {
                reconnectDelay = RECONNECT_DELAY_MS;
                setStatus("live");
            };
            source.addEventListener("ready", markLive);
            source.addEventListener("notification", handleNotification);

            source.onopen = markLive;

            source.onerror = () => {
                setStatus("offline");
                source?.close();
                source = null;

                if (disposed) return;
                reconnectTimerRef.current = setTimeout(connect, reconnectDelay);
                reconnectDelay = Math.min(
                    reconnectDelay * 2,
                    MAX_RECONNECT_DELAY_MS,
                );
            };
        };

        connect();

        return () => {
            disposed = true;
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
            source?.close();
        };
    }, [limit, refresh, refreshOnNotification]);

    const markRead = useCallback(async (notificationId: string) => {
        let alreadyRead = false;
        const readAt = new Date().toISOString();

        setNotifications((prev) =>
            prev.map((item) => {
                if (item.id !== notificationId) return item;
                alreadyRead = item.readAt !== null;
                return alreadyRead ? item : { ...item, readAt };
            }),
        );

        if (alreadyRead) return;

        setUnreadCount((prev) => Math.max(0, prev - 1));

        const result = await markNotificationReadAction({ notificationId });
        if (result.success) {
            setUnreadCount(result.data.unreadCount);
        }
    }, []);

    const markAllRead = useCallback(
        async (workspaceId?: string) => {
            const readAt = new Date().toISOString();
            const inScope = (item: NotificationPayload) =>
                item.readAt === null &&
                (workspaceId === undefined || item.workspaceId === workspaceId);

            const clearedCount = notifications.filter(inScope).length;

            setNotifications((prev) =>
                prev.map((item) =>
                    inScope(item) ? { ...item, readAt } : item,
                ),
            );

            // A workspace-scoped clear leaves other workspaces' unread intact
            setUnreadCount((prev) =>
                workspaceId === undefined
                    ? 0
                    : Math.max(0, prev - clearedCount),
            );

            const result = await markAllNotificationsReadAction(
                workspaceId ? { workspaceId } : {},
            );
            if (result.success) {
                setUnreadCount(result.data.unreadCount);
            }
        },
        [notifications],
    );

    return { notifications, unreadCount, status, markRead, markAllRead };
}
