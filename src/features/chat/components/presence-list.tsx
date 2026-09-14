"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/cn";

import type { ChatConnectionStatus, ChatPresenceUser } from "../types";

export interface PresenceListProps {
    participants: ChatPresenceUser[];
    connectionStatus: ChatConnectionStatus;
    /** Avatars rendered before collapsing the remainder into a "+N" chip. */
    maxVisible?: number;
}

const STATUS_LABELS: Record<ChatConnectionStatus, string> = {
    connecting: "Connecting",
    connected: "Connected",
    synced: "Live",
    disconnected: "Offline",
};

export function PresenceList({
    participants,
    connectionStatus,
    maxVisible = 6,
}: PresenceListProps) {
    const visible = participants.slice(0, maxVisible);
    const overflow = participants.length - visible.length;
    const isLive =
        connectionStatus === "synced" || connectionStatus === "connected";

    return (
        <div
            data-testid="chat-presence"
            className="flex items-center gap-3 min-w-0"
        >
            <div className="flex items-center -space-x-2">
                {visible.map((participant) => (
                    <span
                        key={participant.id}
                        title={
                            participant.isSelf
                                ? `${participant.name} (you)`
                                : participant.name
                        }
                        className="relative inline-flex rounded-full"
                        style={{ boxShadow: `0 0 0 2px ${participant.color}` }}
                    >
                        <UserAvatar
                            user={{
                                name: participant.name,
                                image: participant.avatarUrl,
                            }}
                            size="sm"
                            className="shadow-none"
                        />
                        {participant.isTyping && (
                            <span
                                aria-hidden="true"
                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-accent border-2 border-brand-surface rounded-full"
                            />
                        )}
                    </span>
                ))}

                {overflow > 0 && (
                    <span className="w-7 h-7 flex items-center justify-center bg-brand-muted border-2 border-brand-surface rounded-full font-brand-mono text-[10px] text-brand-subtle">
                        +{overflow}
                    </span>
                )}
            </div>

            <span className="flex items-center gap-1.5 shrink-0">
                <span
                    aria-hidden="true"
                    className={cn(
                        "w-2 h-2",
                        isLive ? "bg-brand-success" : "bg-brand-warning",
                        connectionStatus === "disconnected" &&
                            "bg-brand-danger",
                    )}
                />
                <span className="font-brand-mono text-[10px] uppercase tracking-widest text-brand-subtle">
                    {participants.length} online ·{" "}
                    {STATUS_LABELS[connectionStatus]}
                </span>
            </span>
        </div>
    );
}
