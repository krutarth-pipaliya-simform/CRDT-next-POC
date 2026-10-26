"use client";

import { useCallback } from "react";

import { DisplayHeading } from "@/components/paddock/display-heading";
import { PaddockButton } from "@/components/paddock/paddock-button";
import { Tag } from "@/components/paddock/tag";
import { cn } from "@/lib/cn";

import {
    useNotificationStream,
    type StreamStatus,
} from "../hooks/use-notification-stream";
import { ACTIVITY_FEED_LIMIT, type NotificationPayload } from "../types";

import { NotificationItem } from "./notification-item";

export interface ActivityFeedProps {
    workspaceId: string;
    initialActivity: NotificationPayload[];
    initialUnreadCount: number;
}

/** The connection state is a word as well as a dot, so it is never colour alone. */
const STATUS_DOT: Record<StreamStatus, string> = {
    live: "bg-paddock-ink shadow-[0_0_0_3px_var(--color-paddock-lime)]",
    connecting: "border-[1.5px] border-paddock-ink",
    offline: "bg-paddock-danger",
};

const FRAME =
    "min-w-0 overflow-hidden rounded-paddock-panel border border-paddock-rule bg-paddock-sheet";

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
            <section
                aria-label="Activity feed"
                className={cn(FRAME, "flex flex-col gap-3 px-6 py-10 sm:px-8")}
            >
                <DisplayHeading
                    as="h2"
                    size="md"
                    serif="No activity"
                    heavy="yet"
                />
                <p className="m-0 max-w-[52ch] text-paddock-subtle">
                    When someone is assigned a task, finishes one, starts a
                    document or joins the workspace, it lands here.
                </p>
            </section>
        );
    }

    return (
        <section
            aria-label="Activity feed"
            data-testid="activity-feed"
            className={FRAME}
        >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-paddock-rule px-5.5 py-4.5">
                <div className="flex items-center gap-3.5">
                    <h2 className="paddock-heavy m-0 text-[1.375rem]">
                        {workspaceUnread > 0
                            ? `${workspaceUnread} unread`
                            : "All caught up"}
                    </h2>
                    <span className="paddock-mono flex items-center gap-1.5 text-xs text-paddock-subtle">
                        <span
                            aria-hidden="true"
                            className={cn(
                                "size-2 rounded-full",
                                STATUS_DOT[status],
                            )}
                        />
                        <span className="sr-only">Live updates: </span>
                        {status}
                    </span>
                </div>

                {workspaceUnread > 0 ? (
                    <PaddockButton
                        variant="outline"
                        voice="plain"
                        size="sm"
                        onClick={() => void markAllRead(workspaceId)}
                    >
                        Mark all read
                    </PaddockButton>
                ) : null}
            </header>

            <ul className="m-0 list-none p-0">
                {workspaceActivity.map((notification) => (
                    <li
                        key={notification.id}
                        className="border-b border-paddock-rule last:border-b-0"
                    >
                        <NotificationItem
                            notification={notification}
                            onRead={handleRead}
                            variant="feed"
                        />
                    </li>
                ))}
            </ul>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-paddock-rule px-5.5 py-3.5">
                {unreadCount > workspaceUnread ? (
                    <Tag as="p" tone="ink">
                        {unreadCount - workspaceUnread} unread in other
                        workspaces
                    </Tag>
                ) : (
                    <span />
                )}
                <span className="paddock-mono text-[0.71875rem] text-paddock-subtle">
                    showing the latest {workspaceActivity.length}
                </span>
            </footer>
        </section>
    );
}
