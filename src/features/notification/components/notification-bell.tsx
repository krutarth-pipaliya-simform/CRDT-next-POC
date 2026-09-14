"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/cn";

import { NotificationItem } from "./notification-item";
import { useNotificationStream } from "../hooks/use-notification-stream";
import type { NotificationPayload } from "../types";

export interface NotificationBellProps {
    initialNotifications: NotificationPayload[];
    initialUnreadCount: number;
}

export function NotificationBell({
    initialNotifications,
    initialUnreadCount,
}: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useOutsideClick(dropdownRef, () => setIsOpen(false), isOpen);

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

    const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

    return (
        <div className="relative" ref={dropdownRef}>
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
                className="relative flex items-center justify-center w-10 h-10 border-2 border-brand-ink bg-brand-surface text-brand-ink rounded-brand transition-colors hover:bg-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 cursor-pointer"
            >
                <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {unreadCount > 0 && (
                    <span
                        data-testid="notification-unread-count"
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-brand-accent text-brand-surface text-[12px] font-bold border-2 border-brand-surface"
                    >
                        {badgeLabel}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    data-testid="notification-dropdown"
                    className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-brand-surface border-2 border-brand-ink shadow-brand-card rounded-brand z-50 animate-fade-in-up"
                >
                    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b-2 border-brand-muted">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[12px] text-brand-subtle">
                                Notifications
                            </span>
                            <span
                                title={
                                    status === "live"
                                        ? "Live updates connected"
                                        : status === "connecting"
                                          ? "Connecting to live updates"
                                          : "Live updates disconnected"
                                }
                                className={cn(
                                    "w-2 h-2 shrink-0",
                                    status === "live"
                                        ? "bg-brand-success"
                                        : status === "connecting"
                                          ? "bg-brand-warning"
                                          : "bg-brand-danger",
                                )}
                            />
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() => void markAllRead()}
                                className="text-[12px] text-brand-accent hover:underline cursor-pointer"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-brand-border">
                        {notifications.length === 0 ? (
                            <p className="px-4 py-10 text-center text-xs text-brand-subtle">
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
                        <div className="border-t-2 border-brand-muted px-4 py-2.5">
                            <Link
                                href={`/${notifications[0].workspaceId}/activity`}
                                onClick={() => setIsOpen(false)}
                                className="text-[12px] text-brand-accent hover:underline"
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
