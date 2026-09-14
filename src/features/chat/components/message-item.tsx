"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { formatClockTime } from "@/features/notification/lib/format-relative-time";
import { cn } from "@/lib/cn";

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
                "flex items-start gap-3 px-4 transition-opacity",
                isGrouped ? "py-0.5" : "pt-4 pb-0.5",
                isSending && "opacity-60",
            )}
        >
            <div className="w-8 shrink-0">
                {!isGrouped && <UserAvatar user={message.author} size="md" />}
            </div>

            <div className="min-w-0 flex-1">
                {!isGrouped && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-brand-ink truncate">
                            {isOwn ? "You" : authorName}
                        </span>
                        <time
                            suppressHydrationWarning
                            dateTime={message.createdAt}
                            className="font-brand-mono text-[10px] uppercase tracking-wider text-brand-subtle shrink-0"
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
                        <span className="font-brand-mono text-[10px] uppercase tracking-wider text-brand-danger">
                            Not sent
                        </span>
                        <button
                            type="button"
                            onClick={() => onRetry(message.id)}
                            className="font-brand-mono text-[10px] uppercase tracking-wider text-brand-accent hover:underline cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
