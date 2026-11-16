import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

import { markAllNotificationsReadAction } from "../actions/mark-all-notifications-read";
import { markNotificationReadAction } from "../actions/mark-notification-read";
import { ACTIVITY_FEED_LIMIT, type NotificationPayload } from "../types";

export type StreamStatus = "connecting" | "live" | "offline";

/** Maximum notifications the store retains; the largest list any view shows. */
export const NOTIFICATION_STORE_LIMIT = ACTIVITY_FEED_LIMIT;

export interface NotificationState {
    /** Newest first. Seeded from the server, then fed by the SSE stream. */
    notifications: NotificationPayload[];
    /** Unread across every workspace, as last reported by the server. */
    unreadCount: number;
    status: StreamStatus;
}

export interface NotificationActions {
    /**
     * Adopt a server-rendered list: each row is added, or replaces the copy
     * held here. Rows the stream delivered since stay. `unreadCount` is only
     * passed by whoever knows the global total.
     */
    mergeFromServer: (
        notifications: NotificationPayload[],
        unreadCount?: number,
    ) => void;
    /** A notification pushed over the stream. */
    receive: (notification: NotificationPayload) => void;
    setStatus: (status: StreamStatus) => void;
    markRead: (notificationId: string) => Promise<void>;
    /** Mark everything read, or only one workspace's. */
    markAllRead: (workspaceId?: string) => Promise<void>;
}

export type NotificationStore = NotificationState & NotificationActions;

/**
 * `incoming` rows win over `base` rows with the same id; the result is newest
 * first and capped.
 */
export function mergeNotifications(
    base: NotificationPayload[],
    incoming: NotificationPayload[],
    limit: number = NOTIFICATION_STORE_LIMIT,
): NotificationPayload[] {
    const byId = new Map<string, NotificationPayload>();
    for (const item of base) byId.set(item.id, item);
    for (const item of incoming) byId.set(item.id, item);
    return [...byId.values()]
        .sort((a, b) =>
            a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
        )
        .slice(0, limit);
}

export interface NotificationSeed {
    notifications: NotificationPayload[];
    unreadCount: number;
}

/**
 * One notification store per signed-in shell, created from the server-rendered
 * inbox (see `NotificationStoreProvider`). Never a module singleton: on the
 * server that would share one user's inbox with the next request.
 *
 * The status is seeded to a constant, not derived from the EventSource, so the
 * hydrating render matches the server.
 */
export function createNotificationStore(seed: NotificationSeed) {
    return createStore<NotificationStore>()(
        devtools(
            (set, get) => ({
                notifications: mergeNotifications([], seed.notifications),
                unreadCount: seed.unreadCount,
                status: "connecting",

                mergeFromServer: (notifications, unreadCount) =>
                    set(
                        (s) => ({
                            notifications: mergeNotifications(
                                s.notifications,
                                notifications,
                            ),
                            unreadCount: unreadCount ?? s.unreadCount,
                        }),
                        undefined,
                        "mergeFromServer",
                    ),

                receive: (notification) =>
                    set(
                        (s) => {
                            if (
                                s.notifications.some(
                                    (item) => item.id === notification.id,
                                )
                            ) {
                                return s;
                            }
                            return {
                                notifications: mergeNotifications(
                                    s.notifications,
                                    [notification],
                                ),
                                unreadCount: notification.readAt
                                    ? s.unreadCount
                                    : s.unreadCount + 1,
                            };
                        },
                        undefined,
                        "receive",
                    ),

                setStatus: (status) => set({ status }, undefined, "setStatus"),

                markRead: async (notificationId) => {
                    const target = get().notifications.find(
                        (item) => item.id === notificationId,
                    );
                    const readAt = new Date().toISOString();
                    set(
                        (s) => ({
                            notifications: s.notifications.map((item) =>
                                item.id === notificationId && !item.readAt
                                    ? { ...item, readAt }
                                    : item,
                            ),
                        }),
                        undefined,
                        "markRead",
                    );

                    if (target && target.readAt !== null) return;

                    set(
                        (s) => ({
                            unreadCount: Math.max(0, s.unreadCount - 1),
                        }),
                        undefined,
                        "markRead/count",
                    );

                    const result = await markNotificationReadAction({
                        notificationId,
                    });
                    if (result.success) {
                        set(
                            { unreadCount: result.data.unreadCount },
                            undefined,
                            "markRead/server",
                        );
                    }
                },

                markAllRead: async (workspaceId) => {
                    const readAt = new Date().toISOString();
                    const inScope = (item: NotificationPayload) =>
                        item.readAt === null &&
                        (workspaceId === undefined ||
                            item.workspaceId === workspaceId);

                    const clearedCount =
                        get().notifications.filter(inScope).length;

                    set(
                        (s) => ({
                            notifications: s.notifications.map((item) =>
                                inScope(item) ? { ...item, readAt } : item,
                            ),
                            // A workspace-scoped clear leaves other
                            // workspaces' unread intact.
                            unreadCount:
                                workspaceId === undefined
                                    ? 0
                                    : Math.max(0, s.unreadCount - clearedCount),
                        }),
                        undefined,
                        "markAllRead",
                    );

                    const result = await markAllNotificationsReadAction(
                        workspaceId ? { workspaceId } : {},
                    );
                    if (result.success) {
                        set(
                            { unreadCount: result.data.unreadCount },
                            undefined,
                            "markAllRead/server",
                        );
                    }
                },
            }),
            {
                name: "notification-store",
                enabled: process.env.NODE_ENV === "development",
            },
        ),
    );
}

export type NotificationStoreApi = ReturnType<typeof createNotificationStore>;
