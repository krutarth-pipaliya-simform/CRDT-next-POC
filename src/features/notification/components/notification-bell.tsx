"use client";

import { useCallback, useMemo, useRef, type KeyboardEvent } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Tag } from "@/components/paddock/tag";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/cn";
import { useShellPanel } from "@/stores/shell-ui-store";

import { NotificationItem } from "./notification-item";
import { useNotificationStream } from "../hooks/use-notification-stream";
import { useNotificationStore } from "../stores/notification-store-provider";
import type { NotificationPayload } from "../types";

/** Notifications the dropdown keeps listing as new ones arrive. */
const BELL_LIST_LIMIT = 30;

const STREAM_STATUS = {
    live: { label: "Live updates connected", dot: "bg-paddock-lime" },
    connecting: {
        label: "Connecting to live updates",
        dot: "border-[1.5px] border-dashed border-paddock-ink",
    },
    offline: { label: "Live updates disconnected", dot: "bg-paddock-danger" },
} as const;

export function NotificationBell() {
    const { open: isOpen, toggle, close } = useShellPanel("notifications");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const params = useParams();
    // The inbox spans every workspace; inside one, "all activity" means that
    // workspace's, not whichever sent the newest notification.
    const currentWorkspaceId =
        typeof params.workspaceId === "string" ? params.workspaceId : null;

    useOutsideClick(dropdownRef, close, isOpen);

    const handleIncoming = useCallback((notification: NotificationPayload) => {
        toast(notification.title, {
            description: notification.body ?? undefined,
            duration: 5000,
        });
    }, []);

    // The bell is in every header, so it owns the live stream; the store it
    // feeds is shared with the activity feed.
    useNotificationStream({ onNotification: handleIncoming });

    const allNotifications = useNotificationStore((s) => s.notifications);
    const unreadCount = useNotificationStore((s) => s.unreadCount);
    const status = useNotificationStore((s) => s.status);
    const markRead = useNotificationStore((s) => s.markRead);
    const markAllRead = useNotificationStore((s) => s.markAllRead);
    const notifications = useMemo(
        () => allNotifications.slice(0, BELL_LIST_LIMIT),
        [allNotifications],
    );

    const handleRead = useCallback(
        (notificationId: string) => {
            void markRead(notificationId);
            close();
        },
        [markRead, close],
    );

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape" && isOpen) {
            event.stopPropagation();
            close();
        }
    }

    const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);
    const streamStatus = STREAM_STATUS[status];

    return (
        <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
            <button
                type="button"
                onClick={toggle}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label={
                    unreadCount > 0
                        ? `Notifications, ${unreadCount} unread`
                        : "Notifications"
                }
                data-testid="notification-bell"
                className="paddock-press relative flex size-12 cursor-pointer items-center justify-center rounded-paddock border-[1.5px] border-paddock-ink bg-transparent text-paddock-ink"
            >
                <Bell aria-hidden="true" className="size-5" strokeWidth={1.8} />

                {unreadCount > 0 && (
                    <span
                        data-testid="notification-unread-count"
                        className="paddock-mono absolute -top-[7px] -right-[7px] flex h-5 min-w-5 items-center justify-center rounded-full bg-paddock-lime px-[5px] text-[0.6875rem] font-medium text-paddock-on-fill"
                    >
                        {badgeLabel}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    data-testid="notification-dropdown"
                    className="paddock-in absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-paddock-card border-[1.5px] border-paddock-ink bg-paddock-sheet shadow-paddock-float"
                >
                    <div className="flex items-center justify-between gap-2 border-b border-paddock-rule px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2">
                            <Tag tone="ink">Notifications</Tag>
                            <span
                                role="img"
                                aria-label={streamStatus.label}
                                title={streamStatus.label}
                                className={cn(
                                    "size-2 shrink-0 rounded-full",
                                    streamStatus.dot,
                                )}
                            />
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() => void markAllRead()}
                                className="cursor-pointer border-0 bg-transparent p-0 text-[0.8125rem] font-semibold text-paddock-ink underline decoration-[1.5px] underline-offset-[3px] hover:decoration-transparent"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 divide-y divide-paddock-rule overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="m-0 px-4 py-10 text-center text-sm text-paddock-subtle">
                                Nothing here yet.
                            </p>
                        ) : (
                            notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={handleRead}
                                />
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="border-t border-paddock-rule px-4 py-3">
                            <Link
                                href={`/${currentWorkspaceId ?? notifications[0].workspaceId}/activity`}
                                onClick={close}
                                className="text-[0.8125rem] font-semibold text-paddock-ink underline decoration-[1.5px] underline-offset-[3px] hover:decoration-transparent"
                            >
                                View all activity
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
