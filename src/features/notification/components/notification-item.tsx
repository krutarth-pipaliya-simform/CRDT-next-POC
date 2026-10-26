"use client";

import Link from "next/link";

import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
import { paddockPresenceVar } from "@/components/paddock/paddock-presence";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/format-time";

import { NOTIFICATION_TYPE_ICONS, type NotificationPayload } from "../types";

export interface NotificationItemProps {
    notification: NotificationPayload;
    onRead: (notificationId: string) => void;
    /** Renders the roomier variant used by the workspace activity feed. */
    variant?: "compact" | "feed";
}

/**
 * One notification. The actor's rail and avatar answer "who"; a system notice
 * gets a night tile with its glyph instead. Unread rows take a lime wash, a
 * bold title and an ink dot, plus the word "Unread" for assistive tech, so the
 * state is never colour alone.
 */
export function NotificationItem({
    notification,
    onRead,
    variant = "compact",
}: NotificationItemProps) {
    const isUnread = notification.readAt === null;
    const isFeed = variant === "feed";
    const actor = notification.actor
        ? {
              id: notification.actor.id,
              name:
                  notification.actor.name ||
                  notification.actor.email ||
                  "Someone",
              image: notification.actor.image,
          }
        : null;

    const content = (
        <>
            <span
                aria-hidden="true"
                className={cn(
                    "absolute inset-y-0 left-0 w-1",
                    !actor && "bg-paddock-rule",
                )}
                style={
                    actor
                        ? { backgroundColor: paddockPresenceVar(actor.id) }
                        : undefined
                }
            />

            {actor ? (
                <PaddockAvatar
                    person={actor}
                    size={isFeed ? "lg" : "md"}
                    decorative
                />
            ) : (
                <span
                    aria-hidden="true"
                    className={cn(
                        "paddock-night flex shrink-0 items-center justify-center rounded-[10px] text-paddock-lime",
                        isFeed ? "size-10" : "size-[2.125rem]",
                    )}
                >
                    {NOTIFICATION_TYPE_ICONS[notification.type]}
                </span>
            )}

            <span className="min-w-0 flex-1">
                <span
                    className={cn(
                        "block leading-snug",
                        isFeed ? "text-[0.9375rem]" : "text-sm",
                        isUnread ? "font-bold" : "font-medium",
                    )}
                >
                    {notification.title}
                </span>
                {notification.body ? (
                    <span
                        className={cn(
                            "mt-0.5 block break-words text-paddock-subtle",
                            isFeed
                                ? "text-[0.84375rem]"
                                : "line-clamp-2 text-[0.8125rem]",
                        )}
                    >
                        {notification.body}
                    </span>
                ) : null}
            </span>

            <span className="flex shrink-0 items-center gap-2.5 pt-0.5">
                <time
                    suppressHydrationWarning
                    dateTime={notification.createdAt}
                    className="paddock-mono text-xs text-paddock-subtle"
                >
                    {formatRelativeTime(notification.createdAt)}
                </time>
                {isUnread ? (
                    <>
                        <span
                            aria-hidden="true"
                            className="size-[9px] rounded-full bg-paddock-ink"
                        />
                        <span className="sr-only">Unread</span>
                    </>
                ) : null}
            </span>
        </>
    );

    const classes = cn(
        "relative flex w-full items-start gap-3.5 text-left no-underline transition-colors",
        isFeed ? "py-4 pr-5.5 pl-6.5" : "py-3.5 pr-4 pl-5.5",
        isUnread
            ? "bg-[color-mix(in_srgb,var(--color-paddock-lime)_20%,var(--color-paddock-sheet))]"
            : "bg-paddock-sheet hover:bg-[color-mix(in_srgb,var(--color-paddock-ink)_6%,var(--color-paddock-sheet))]",
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
            className={cn(classes, "cursor-pointer border-0")}
        >
            {content}
        </button>
    );
}
