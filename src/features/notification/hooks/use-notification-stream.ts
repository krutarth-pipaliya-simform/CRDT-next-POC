"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { notificationPayloadSchema } from "@/schemas/notification";

import { useNotificationStoreApi } from "../stores/notification-store-provider";
import type { NotificationPayload } from "../types";

export interface UseNotificationStreamOptions {
    /** Called once per notification newly received over the stream. */
    onNotification?: (notification: NotificationPayload) => void;
    /**
     * Refresh the page's server data when notifications arrive. The header
     * bell owns the stream, so it is the one refresher per page.
     */
    refreshOnNotification?: boolean;
}

const RECONNECT_DELAY_MS = 5_000;
const MAX_RECONNECT_DELAY_MS = 60_000;
/** A burst of notifications (a bulk move, a busy chat) becomes one refresh. */
const REFRESH_DEBOUNCE_MS = 750;

/**
 * Connects `/api/notifications/stream` and feeds the notification store.
 *
 * The stream is a side effect, not state: the list, the unread count and the
 * connection status all live in the store, which the server-rendered inbox
 * seeded, so the bell is correct on first paint and stays current without
 * polling. Mount this once, in the header bell.
 */
export function useNotificationStream({
    onNotification,
    refreshOnNotification = true,
}: UseNotificationStreamOptions = {}): void {
    const store = useNotificationStoreApi();
    const router = useRouter();
    const refresh = useDebouncedCallback(
        () => router.refresh(),
        REFRESH_DEBOUNCE_MS,
    );
    const onNotificationRef = useRef(onNotification);

    useEffect(() => {
        onNotificationRef.current = onNotification;
    }, [onNotification]);

    useEffect(() => {
        const { receive, setStatus } = store.getState();
        let source: EventSource | null = null;
        let disposed = false;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        // Doubles after each failure, so a stream that keeps failing (an
        // expired session) stops retrying every few seconds.
        let reconnectDelay = RECONNECT_DELAY_MS;

        const handleNotification = (event: MessageEvent<string>) => {
            let payload: NotificationPayload;
            try {
                payload = notificationPayloadSchema.parse(
                    JSON.parse(event.data),
                );
            } catch (error) {
                console.error(
                    "[Notifications] Received an unparsable SSE frame:",
                    error,
                );
                return;
            }

            // A duplicate frame is ignored by the store, and so is its toast.
            const known = store
                .getState()
                .notifications.some((item) => item.id === payload.id);
            receive(payload);
            if (known) return;

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
                reconnectTimer = setTimeout(connect, reconnectDelay);
                reconnectDelay = Math.min(
                    reconnectDelay * 2,
                    MAX_RECONNECT_DELAY_MS,
                );
            };
        };

        connect();

        return () => {
            disposed = true;
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
            source?.close();
        };
    }, [refresh, refreshOnNotification, store]);
}
