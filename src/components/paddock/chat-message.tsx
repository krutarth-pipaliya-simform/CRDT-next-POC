import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { PaddockAvatar } from "./paddock-avatar";
import {
    paddockPresenceTint,
    paddockPresenceVar,
    type PaddockPerson,
} from "./paddock-presence";

export interface ChatMessageProps {
    author: PaddockPerson;
    children: ReactNode;
    /** Already formatted with `formatClockTime`. */
    time: string;
    dateTime: string;
    /** First in a run from the same person: shows the avatar, name and time. */
    first?: boolean;
    /** Not delivered. Pair with `onRetry`. */
    failed?: boolean;
    onRetry?: () => void;
    /** Still sending: the row is dimmed until the server confirms it. */
    pending?: boolean;
    className?: string;
}

/**
 * One chat message. The 3px rail and avatar are the author's colour, so a run
 * of messages reads as one person at a glance; the name flag says it in words.
 */
export function ChatMessage({
    author,
    children,
    time,
    dateTime,
    first = true,
    failed = false,
    onRetry,
    pending = false,
    className,
}: ChatMessageProps) {
    const colour = paddockPresenceVar(author.id);

    return (
        <article
            aria-label={first ? `${author.name}, ${time}` : undefined}
            className={cn(
                "relative flex gap-3.5 rounded-paddock transition-colors hover:bg-paddock-ink/5",
                first ? "pt-2.5 pr-2 pb-1.5" : "py-0.5 pr-2",
                pending && "opacity-60",
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "absolute bottom-1 left-0 w-[3px] rounded-sm",
                    first ? "top-2.5" : "top-1",
                )}
                style={{ backgroundColor: colour }}
            />
            <span className="ml-3 w-[2.125rem] shrink-0">
                {first ? (
                    <PaddockAvatar person={author} size="md" decorative />
                ) : null}
            </span>
            <div className="min-w-0 flex-1">
                {first ? (
                    <div className="mb-0.5 flex items-center gap-2.5">
                        <span
                            className="paddock-tag rounded px-2 py-0.5 text-[0.65625rem] text-paddock-on-fill"
                            style={{ backgroundColor: colour }}
                        >
                            {author.name}
                        </span>
                        <time
                            dateTime={dateTime}
                            className="paddock-mono text-[0.71875rem] text-paddock-subtle"
                        >
                            {time}
                        </time>
                    </div>
                ) : null}
                <p className="m-0 text-[0.96875rem] leading-[1.55] break-words whitespace-pre-wrap">
                    {children}
                </p>
                {failed ? (
                    <p className="m-0 mt-1 text-[0.8125rem] font-semibold text-paddock-danger">
                        Not sent ·{" "}
                        <button
                            type="button"
                            onClick={onRetry}
                            className="cursor-pointer border-0 bg-transparent p-0 font-bold text-paddock-danger underline underline-offset-[3px]"
                        >
                            Try again
                        </button>
                    </p>
                ) : null}
            </div>
        </article>
    );
}

export interface MentionProps {
    person: PaddockPerson;
}

/** An @mention, washed in the mentioned person's colour. */
export function Mention({ person }: MentionProps) {
    return (
        <span
            className="rounded px-[3px] font-bold"
            style={{ backgroundColor: paddockPresenceTint(person.id, 40) }}
        >
            @{person.name.split(" ")[0]}
        </span>
    );
}
