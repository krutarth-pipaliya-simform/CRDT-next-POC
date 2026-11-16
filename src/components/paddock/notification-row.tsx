import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

import { PaddockAvatar } from "./paddock-avatar";
import { paddockPresenceVar, type PaddockPerson } from "./paddock-presence";

export interface NotificationRowProps {
    href: string;
    title: string;
    body?: string;
    /** Already formatted (see `formatRelativeTime`), shown in mono. */
    time: string;
    /** ISO timestamp for the `<time>` element. */
    dateTime: string;
    unread?: boolean;
    /** The person who caused it. Omit for system notices, which get `icon`. */
    actor?: PaddockPerson;
    icon?: ReactNode;
    className?: string;
}

/**
 * One notification. A person's rail and avatar answer "who"; system notices
 * get an ink tile instead. Unread rows take a lime wash, a bold title and a
 * dot — plus the word "Unread" for assistive tech, so state is never colour
 * alone. Render inside a `<ul>`; the row is the `<li>`.
 */
export function NotificationRow({
    href,
    title,
    body,
    time,
    dateTime,
    unread = false,
    actor,
    icon,
    className,
}: NotificationRowProps) {
    return (
        <li
            className={cn(
                "border-b border-paddock-rule last:border-b-0",
                className,
            )}
        >
            <Link
                href={href}
                className={cn(
                    "relative flex items-start gap-3.5 py-4 pr-5.5 pl-6.5 no-underline transition-colors",
                    unread
                        ? "bg-[color-mix(in_srgb,var(--color-paddock-lime)_20%,var(--color-paddock-sheet))]"
                        : "bg-paddock-sheet hover:bg-[color-mix(in_srgb,var(--color-paddock-ink)_6%,var(--color-paddock-sheet))]",
                )}
            >
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
                    <PaddockAvatar person={actor} size="lg" decorative />
                ) : (
                    <span
                        aria-hidden="true"
                        className="paddock-night flex size-10 shrink-0 items-center justify-center rounded-[10px] text-paddock-lime"
                    >
                        {icon}
                    </span>
                )}
                <span className="min-w-0 flex-1">
                    <span
                        className={cn(
                            "block text-[0.9375rem] leading-snug",
                            unread ? "font-bold" : "font-medium",
                        )}
                    >
                        {title}
                    </span>
                    {body ? (
                        <span className="mt-0.5 block truncate text-[0.84375rem] text-paddock-subtle">
                            {body}
                        </span>
                    ) : null}
                </span>
                <span className="flex shrink-0 items-center gap-2.5 pt-0.5">
                    <time
                        dateTime={dateTime}
                        className="paddock-mono text-xs text-paddock-subtle"
                    >
                        {time}
                    </time>
                    {unread ? (
                        <>
                            <span
                                aria-hidden="true"
                                className="size-[9px] rounded-full bg-paddock-ink"
                            />
                            <span className="sr-only">Unread</span>
                        </>
                    ) : null}
                </span>
            </Link>
        </li>
    );
}
