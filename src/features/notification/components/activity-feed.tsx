"use client";

import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { NotificationItem } from "./notification-item";
import { useNotificationStream } from "../hooks/use-notification-stream";
import { ACTIVITY_FEED_LIMIT, type NotificationPayload } from "../types";

export interface ActivityFeedProps {
    workspaceId: string;
    initialActivity: NotificationPayload[];
    initialUnreadCount: number;
}

export function ActivityFeed({
    workspaceId,
    initialActivity,
    initialUnreadCount,
}: ActivityFeedProps) {
    const { notifications, unreadCount, status, markRead, markAllRead } =
        useNotificationStream({
            initialNotifications: initialActivity,
            initialUnreadCount,
            limit: ACTIVITY_FEED_LIMIT,
        });

    // The shared stream carries every workspace; this feed shows only the current one
    const workspaceActivity = notifications.filter(
        (item) => item.workspaceId === workspaceId,
    );
    const workspaceUnread = workspaceActivity.filter(
        (item) => item.readAt === null,
    ).length;

    const handleRead = useCallback(
        (notificationId: string) => {
            void markRead(notificationId);
        },
        [markRead],
    );

    if (workspaceActivity.length === 0) {
        return (
            <EmptyState
                title="No activity yet"
                description="Task assignments, completed work, new documents, mentions, and members joining will all show up here."
            />
        );
    }

    return (
        <div
            data-testid="activity-feed"
            className="border-2 border-brand-ink rounded-brand bg-brand-surface shadow-brand-card"
        >
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b-2 border-brand-muted">
                <div className="flex items-center gap-2">
                    <span className="font-brand-mono text-[10px] uppercase tracking-widest text-brand-subtle">
                        {workspaceUnread > 0
                            ? `${workspaceUnread} unread`
                            : "All caught up"}
                    </span>
                    <span
                        aria-label={`Live updates ${status}`}
                        className={
                            status === "live"
                                ? "w-2 h-2 bg-brand-success"
                                : status === "connecting"
                                  ? "w-2 h-2 bg-brand-warning"
                                  : "w-2 h-2 bg-brand-danger"
                        }
                    />
                </div>

                {workspaceUnread > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void markAllRead(workspaceId)}
                    >
                        Mark all read
                    </Button>
                )}
            </div>

            <div className="divide-y divide-brand-border">
                {workspaceActivity.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={handleRead}
                        variant="feed"
                    />
                ))}
            </div>

            {unreadCount > workspaceUnread && (
                <div className="border-t-2 border-brand-muted px-4 py-2.5">
                    <p className="font-brand-mono text-[10px] uppercase tracking-wider text-brand-subtle">
                        {unreadCount - workspaceUnread} unread in other
                        workspaces
                    </p>
                </div>
            )}
        </div>
    );
}
