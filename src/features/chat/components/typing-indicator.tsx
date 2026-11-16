"use client";

import type { ChatPresenceUser } from "../types";

export interface TypingIndicatorProps {
    typingUsers: ChatPresenceUser[];
}

function describeTyping(typingUsers: ChatPresenceUser[]): string {
    const [first, second] = typingUsers;

    if (typingUsers.length === 1) return `${first.name} is typing`;
    if (typingUsers.length === 2) {
        return `${first.name} and ${second.name} are typing`;
    }
    return `${typingUsers.length} people are typing`;
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    // Reserve the row's height at all times so the composer never shifts
    const isActive = typingUsers.length > 0;

    return (
        <div
            aria-live="polite"
            data-testid="typing-indicator"
            className="flex h-6.5 min-w-0 items-center gap-2.5 pl-1 text-[0.78125rem] text-paddock-subtle"
        >
            {isActive && (
                <>
                    <span aria-hidden="true" className="flex gap-1">
                        {[0, 150, 300].map((delay) => (
                            <span
                                key={delay}
                                style={{ animationDelay: `${delay}ms` }}
                                className="size-1.5 rounded-full bg-paddock-ink animate-chat-typing"
                            />
                        ))}
                    </span>
                    <span className="truncate">
                        {describeTyping(typingUsers)}
                    </span>
                </>
            )}
        </div>
    );
}
