"use client";

import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
import { paddockPresenceVar } from "@/components/paddock/paddock-presence";
import { cn } from "@/lib/cn";
import { formatClockTime } from "@/lib/format-time";

import type { ChatAuthor, ChatMessage } from "../types";
import { MessageAttachment } from "./message-attachment";
import { ReadReceipt } from "./read-receipt";

export interface MessageItemProps {
    message: ChatMessage;
    /** Collapses the avatar and author line when the previous message shares an author. */
    isGrouped: boolean;
    isOwn: boolean;
    /** Other members whose read cursor stops at this message. */
    seenBy?: ChatAuthor[];
    onRetry: (messageId: string) => void;
}

/**
 * Paddock's chat row (see `ChatMessage` in `components/paddock`), set out here
 * because a server-rendered history needs what the primitive leaves out: the
 * delivery state and test hooks on the row, and a clock time formatted in the
 * reader's own time zone, which may differ from the server's.
 */
export function MessageItem({
    message,
    isGrouped,
    isOwn,
    seenBy,
    onRetry,
}: MessageItemProps) {
    const authorName = message.author.name || message.author.email || "Unknown";
    const isFailed = message.deliveryState === "failed";
    const isSending = message.deliveryState === "sending";
    const colour = paddockPresenceVar(message.author.id);

    return (
        <div
            data-testid="chat-message"
            data-delivery-state={message.deliveryState}
            className={cn(
                "relative flex gap-3.5 rounded-paddock pr-2 transition-[background-color,opacity] hover:bg-paddock-ink/5",
                isGrouped ? "py-0.5" : "pt-2.5 pb-1.5",
                isSending && "opacity-60",
            )}
        >
            {/* The rail runs down every message in a run, so a burst from one
                person reads as one block of their colour. */}
            <span
                aria-hidden="true"
                className={cn(
                    "absolute bottom-1 left-0 w-[3px] rounded-sm",
                    isGrouped ? "top-1" : "top-2.5",
                )}
                style={{ backgroundColor: colour }}
            />

            <span className="ml-3 w-[2.125rem] shrink-0">
                {!isGrouped && (
                    <PaddockAvatar
                        person={{
                            id: message.author.id,
                            name: authorName,
                            image: message.author.image,
                        }}
                        size="md"
                        decorative
                    />
                )}
            </span>

            <div className="min-w-0 flex-1">
                {!isGrouped && (
                    <div className="mb-0.5 flex min-w-0 items-center gap-2.5">
                        <span
                            className="paddock-tag truncate rounded px-2 py-0.5 text-[0.65625rem] text-paddock-on-fill"
                            style={{ backgroundColor: colour }}
                        >
                            {isOwn ? "You" : authorName}
                        </span>
                        <time
                            suppressHydrationWarning
                            dateTime={message.createdAt}
                            className="paddock-mono shrink-0 text-[0.71875rem] text-paddock-subtle"
                        >
                            {formatClockTime(message.createdAt)}
                        </time>
                    </div>
                )}

                {message.body.length > 0 && (
                    <p className="m-0 text-[0.96875rem] leading-[1.55] [overflow-wrap:anywhere] whitespace-pre-wrap">
                        {message.body}
                    </p>
                )}

                {message.attachment && (
                    <MessageAttachment
                        attachment={message.attachment}
                        isAvailable={message.deliveryState === "sent"}
                    />
                )}

                {seenBy && seenBy.length > 0 && (
                    <ReadReceipt readers={seenBy} />
                )}

                {isFailed && (
                    <p className="m-0 mt-1 text-[0.8125rem] font-semibold text-paddock-danger">
                        Not sent ·{" "}
                        <button
                            type="button"
                            onClick={() => onRetry(message.id)}
                            className="-my-3 inline-flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 font-bold text-paddock-danger underline underline-offset-[3px]"
                        >
                            Try again
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
