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
            className="h-5 px-4 flex items-center gap-2"
        >
            {isActive && (
                <>
                    <span
                        aria-hidden="true"
                        className="flex items-center gap-0.5"
                    >
                        {[0, 150, 300].map((delay) => (
                            <span
                                key={delay}
                                style={{ animationDelay: `${delay}ms` }}
                                className="w-1 h-1 bg-brand-accent animate-chat-typing"
                            />
                        ))}
                    </span>
                    <span className="font-brand-mono text-[10px] uppercase tracking-wider text-brand-subtle truncate">
                        {describeTyping(typingUsers)}
                    </span>
                </>
            )}
        </div>
    );
}
