"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/cn";
import { formatClockTime } from "@/lib/format-time";
import { presenceVar } from "@/lib/presence";

import type { ChatMessage } from "../types";

export interface MessageItemProps {
    message: ChatMessage;
    /** Collapses the avatar and author line when the previous message shares an author. */
    isGrouped: boolean;
    isOwn: boolean;
    onRetry: (messageId: string) => void;
}

export function MessageItem({
    message,
    isGrouped,
    isOwn,
    onRetry,
}: MessageItemProps) {
    const authorName = message.author.name || message.author.email || "Unknown";
    const isFailed = message.deliveryState === "failed";
    const isSending = message.deliveryState === "sending";

    return (
        <div
            data-testid="chat-message"
            data-delivery-state={message.deliveryState}
            className={cn(
                "group flex items-start gap-3 pl-3 pr-4 transition-opacity",
                isGrouped ? "py-0.5" : "pt-3.5 pb-0.5",
                isSending && "opacity-60",
            )}
        >
            {/* The rail runs the height of every message in a run, so a burst
                from one person reads as one block of their colour. */}
            <span
                aria-hidden="true"
                className="w-[3px] self-stretch shrink-0"
                style={{ backgroundColor: presenceVar(message.author.id) }}
            />

            <div className="w-8 shrink-0">
                {!isGrouped && <UserAvatar user={message.author} size="md" />}
            </div>

            <div className="min-w-0 flex-1">
                {!isGrouped && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                        <span
                            className="text-sm font-semibold truncate"
                            style={{
                                color: presenceVar(message.author.id),
                            }}
                        >
                            {isOwn ? "You" : authorName}
                        </span>
                        <time
                            suppressHydrationWarning
                            dateTime={message.createdAt}
                            className="font-brand-mono text-[11px] text-brand-subtle shrink-0 tabular-nums"
                        >
                            {formatClockTime(message.createdAt)}
                        </time>
                    </div>
                )}

                <p className="text-sm text-brand-ink whitespace-pre-wrap break-words">
                    {message.body}
                </p>

                {isFailed && (
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[13px] text-brand-danger">
                            Not sent
                        </span>
                        <button
                            type="button"
                            onClick={() => onRetry(message.id)}
                            className="text-[13px] text-brand-accent hover:underline underline-offset-2 cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
