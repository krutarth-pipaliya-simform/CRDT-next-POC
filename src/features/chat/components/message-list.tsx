"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

import { formatDayLabel } from "@/lib/format-time";

import type { ChatAuthor, ChatMessage } from "../types";
import { MessageItem } from "./message-item";

export interface MessageListProps {
    messages: ChatMessage[];
    currentUserId: string;
    /** Other members whose read cursor stops at each message, keyed by message id. */
    seenBy: ReadonlyMap<string, ChatAuthor[]>;
    onRetry: (messageId: string) => void;
    /** Reports whether the reader is at the newest message, which is what counts as "read". */
    onViewingLatestChange?: (isViewingLatest: boolean) => void;
}

/** Consecutive messages from one author within this window render as a single group. */
const GROUPING_WINDOW_MS = 5 * 60_000;

/** Distance from the bottom within which the view is considered "pinned". */
const AUTOSCROLL_THRESHOLD_PX = 120;

function isSameDay(a: string, b: string): boolean {
    return new Date(a).toDateString() === new Date(b).toDateString();
}

export function MessageList({
    messages,
    currentUserId,
    seenBy,
    onRetry,
    onViewingLatestChange,
}: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPinnedRef = useRef(true);
    const [showJump, setShowJump] = useState(false);

    // Follow new messages only while the reader is already at the bottom,
    // so scrolling back through history is never yanked away
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || !isPinnedRef.current) return;

        container.scrollTop = container.scrollHeight;
    }, [messages, seenBy]);

    const setPinned = (pinned: boolean) => {
        if (pinned !== isPinnedRef.current) onViewingLatestChange?.(pinned);
        isPinnedRef.current = pinned;
        setShowJump(!pinned);
    };

    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;
        setPinned(distanceFromBottom <= AUTOSCROLL_THRESHOLD_PX);
    };

    const jumpToLatest = () => {
        const container = scrollRef.current;
        if (!container) return;

        container.scrollTop = container.scrollHeight;
        setPinned(true);
    };

    if (messages.length === 0) {
        return (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 overflow-y-auto px-6 py-8 text-center">
                <p className="paddock-heavy m-0 text-[1.375rem] leading-none">
                    No messages yet
                </p>
                <p className="m-0 max-w-[40ch] text-sm text-paddock-subtle">
                    Say hello — mention a teammate with @ to send them a
                    notification.
                </p>
            </div>
        );
    }

    return (
        <div className="relative min-h-0 flex-1">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                role="log"
                aria-label="Messages"
                tabIndex={0}
                data-testid="chat-message-list"
                className="absolute inset-0 overflow-y-auto overscroll-contain px-4 [scrollbar-color:var(--color-paddock-rule)_transparent] [scrollbar-width:thin] sm:px-5"
            >
                <div className="flex min-h-full flex-col justify-end pt-2 pb-2.5">
                    {messages.map((message, index) => {
                        const previous = index > 0 ? messages[index - 1] : null;
                        const startsNewDay =
                            !previous ||
                            !isSameDay(previous.createdAt, message.createdAt);

                        const isGrouped =
                            !startsNewDay &&
                            previous !== null &&
                            previous.author.id === message.author.id &&
                            new Date(message.createdAt).getTime() -
                                new Date(previous.createdAt).getTime() <
                                GROUPING_WINDOW_MS;

                        return (
                            <Fragment key={message.id}>
                                {startsNewDay && (
                                    <div className="mt-4.5 mb-2.5 flex items-center gap-3.5">
                                        <span
                                            aria-hidden="true"
                                            className="h-px flex-1 bg-paddock-rule"
                                        />
                                        <span
                                            suppressHydrationWarning
                                            className="paddock-tag text-[0.6875rem] text-paddock-subtle"
                                        >
                                            {formatDayLabel(message.createdAt)}
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className="h-px flex-1 bg-paddock-rule"
                                        />
                                    </div>
                                )}
                                <MessageItem
                                    message={message}
                                    isGrouped={isGrouped}
                                    isOwn={message.author.id === currentUserId}
                                    seenBy={seenBy.get(message.id)}
                                    onRetry={onRetry}
                                />
                            </Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Night stays dark in both themes, so the lime arrow keeps its contrast */}
            {showJump && (
                <button
                    type="button"
                    onClick={jumpToLatest}
                    className="paddock-night paddock-tag paddock-press absolute bottom-3 left-1/2 inline-flex h-11 -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full px-4 text-[0.6875rem] shadow-paddock-float"
                >
                    Jump to latest
                    <ArrowDown
                        aria-hidden="true"
                        className="size-3.5 text-paddock-lime"
                        strokeWidth={2.4}
                    />
                </button>
            )}
        </div>
    );
}
