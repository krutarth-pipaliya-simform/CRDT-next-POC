"use client";

import { Fragment, useEffect, useRef } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatDayLabel } from "@/lib/format-time";

import { MessageItem } from "./message-item";
import type { ChatMessage } from "../types";

export interface MessageListProps {
    messages: ChatMessage[];
    currentUserId: string;
    onRetry: (messageId: string) => void;
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
    onRetry,
}: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPinnedRef = useRef(true);

    // Follow new messages only while the reader is already at the bottom,
    // so scrolling back through history is never yanked away
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || !isPinnedRef.current) return;

        container.scrollTop = container.scrollHeight;
    }, [messages]);

    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;
        isPinnedRef.current = distanceFromBottom <= AUTOSCROLL_THRESHOLD_PX;
    };

    if (messages.length === 0) {
        return (
            <div className="flex-1 overflow-y-auto p-4">
                <EmptyState
                    title="No messages yet"
                    description="Say hello — mention a teammate with @ to send them a notification."
                    className="h-full"
                />
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            data-testid="chat-message-list"
            className="flex-1 overflow-y-auto pb-2"
        >
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
                            <div className="flex items-center gap-3 px-4 pt-5 pb-1">
                                <span className="h-px flex-1 bg-brand-muted" />
                                <span
                                    suppressHydrationWarning
                                    className="text-[13px] text-brand-subtle"
                                >
                                    {formatDayLabel(message.createdAt)}
                                </span>
                                <span className="h-px flex-1 bg-brand-muted" />
                            </div>
                        )}
                        <MessageItem
                            message={message}
                            isGrouped={isGrouped}
                            isOwn={message.author.id === currentUserId}
                            onRetry={onRetry}
                        />
                    </Fragment>
                );
            })}
        </div>
    );
}
