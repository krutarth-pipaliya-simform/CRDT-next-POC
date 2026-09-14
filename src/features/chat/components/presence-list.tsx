"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/cn";
import { presenceVar } from "@/lib/presence";

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
            data-connection={connectionStatus}
            className="flex items-center gap-3 min-w-0"
        >
            <div className="flex items-center -space-x-1">
                {visible.map((participant) => (
                    <span
                        key={participant.id}
                        title={
                            participant.isSelf
                                ? `${participant.name} (you)`
                                : participant.name
                        }
                        className="relative inline-flex rounded-brand ring-2 ring-brand-surface"
                    >
                        <UserAvatar
                            user={{
                                id: participant.id,
                                name: participant.name,
                                image: participant.avatarUrl,
                            }}
                            size="sm"
                        />
                        {participant.isTyping && (
                            <span
                                aria-hidden="true"
                                className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-brand-surface animate-presence-pulse"
                                style={{
                                    backgroundColor: presenceVar(
                                        participant.id,
                                    ),
                                }}
                            />
                        )}
                    </span>
                ))}

                {overflow > 0 && (
                    <span className="w-6 h-6 flex items-center justify-center bg-brand-muted ring-2 ring-brand-surface rounded-brand text-[11px] text-brand-subtle tabular-nums">
                        +{overflow}
                    </span>
                )}
            </div>

            <span className="flex items-center gap-1.5 shrink-0">
                <span
                    aria-hidden="true"
                    className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isLive ? "bg-brand-success" : "bg-brand-warning",
                        connectionStatus === "disconnected" &&
                            "bg-brand-danger",
                    )}
                />
                <span className="text-[13px] text-brand-subtle">
                    {participants.length === 1
                        ? "Just you"
                        : `${participants.length} here`}
                    {!isLive && ` · ${STATUS_LABELS[connectionStatus]}`}
                </span>
            </span>
        </div>
    );
}
