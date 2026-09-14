"use client";

import Link from "next/link";

import { PresenceRail } from "@/components/ui/presence-rail";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/format-time";

import { NOTIFICATION_TYPE_ICONS, type NotificationPayload } from "../types";

export interface NotificationItemProps {
    notification: NotificationPayload;
    onRead: (notificationId: string) => void;
    /** Renders the roomier variant used by the workspace activity feed. */
    variant?: "compact" | "feed";
}

export function NotificationItem({
    notification,
    onRead,
    variant = "compact",
}: NotificationItemProps) {
    const isUnread = notification.readAt === null;
    const isFeed = variant === "feed";

    const content = (
        <>
            {notification.actor && (
                <PresenceRail
                    userIds={[notification.actor.id]}
                    fallback={false}
                />
            )}

            <div className="shrink-0 mt-0.5">
                {notification.actor ? (
                    <UserAvatar
                        user={notification.actor}
                        size={isFeed ? "md" : "sm"}
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        className="w-7 h-7 flex items-center justify-center border-2 border-brand-ink bg-brand-muted font-brand-mono text-xs"
                    >
                        {NOTIFICATION_TYPE_ICONS[notification.type]}
                    </span>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                    <p
                        className={cn(
                            "min-w-0 flex-1 text-brand-ink",
                            isFeed ? "text-sm" : "text-xs",
                            isUnread ? "font-semibold" : "font-normal",
                        )}
                    >
                        {notification.title}
                    </p>
                    <time
                        suppressHydrationWarning
                        dateTime={notification.createdAt}
                        className="shrink-0 font-brand-mono text-[12px] text-brand-subtle"
                    >
                        {formatRelativeTime(notification.createdAt)}
                    </time>
                </div>

                {notification.body && (
                    <p
                        className={cn(
                            "mt-1 text-brand-subtle break-words",
                            isFeed
                                ? "text-xs"
                                : "text-[11px] line-clamp-2 overflow-hidden",
                        )}
                    >
                        {notification.body}
                    </p>
                )}
            </div>

            {isUnread && (
                <span
                    aria-label="Unread"
                    className="shrink-0 mt-1.5 w-2 h-2 bg-brand-accent"
                />
            )}
        </>
    );

    const classes = cn(
        "w-full flex items-start gap-3 text-left transition-colors",
        isFeed ? "px-4 py-4" : "px-4 py-3",
        isUnread ? "bg-brand-accent/5" : "bg-transparent",
        "hover:bg-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent",
    );

    if (notification.href) {
        return (
            <Link
                href={notification.href}
                onClick={() => onRead(notification.id)}
                className={classes}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={() => onRead(notification.id)}
            className={cn(classes, "cursor-pointer")}
        >
            {content}
        </button>
    );
}
