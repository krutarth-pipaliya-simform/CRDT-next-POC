"use client";

import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Tag } from "@/components/paddock/tag";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/cn";

import { NotificationItem } from "./notification-item";
import { useNotificationStream } from "../hooks/use-notification-stream";
import type { NotificationPayload } from "../types";

export interface NotificationBellProps {
    initialNotifications: NotificationPayload[];
    initialUnreadCount: number;
}

const STREAM_STATUS = {
    live: { label: "Live updates connected", dot: "bg-paddock-lime" },
    connecting: {
        label: "Connecting to live updates",
        dot: "border-[1.5px] border-dashed border-paddock-ink",
    },
    offline: { label: "Live updates disconnected", dot: "bg-paddock-danger" },
} as const;

export function NotificationBell({
    initialNotifications,
    initialUnreadCount,
}: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setIsOpen(false), []);

    useOutsideClick(dropdownRef, close, isOpen);

    const handleIncoming = useCallback((notification: NotificationPayload) => {
        toast(notification.title, {
            description: notification.body ?? undefined,
            duration: 5000,
        });
    }, []);

    const { notifications, unreadCount, status, markRead, markAllRead } =
        useNotificationStream({
            initialNotifications,
            initialUnreadCount,
            onNotification: handleIncoming,
        });

    const handleRead = useCallback(
        (notificationId: string) => {
            void markRead(notificationId);
            setIsOpen(false);
        },
        [markRead],
    );

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape" && isOpen) {
            event.stopPropagation();
            setIsOpen(false);
        }
    }

    const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);
    const streamStatus = STREAM_STATUS[status];

    return (
        <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
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
                                href={`/${notifications[0].workspaceId}/activity`}
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
