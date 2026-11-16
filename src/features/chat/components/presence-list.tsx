"use client";

import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
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

/**
 * The connection is not a person, so its dot carries no hue: live is a filled
 * dot in a lime ring, connecting is hollow, offline is the danger tone. The
 * word beside it says the same thing, so the dot is never the only signal.
 */
const STATUS_DOT: Record<ChatConnectionStatus, string> = {
    connecting: "border-[1.5px] border-paddock-ink",
    connected: "bg-paddock-ink ring-[3px] ring-paddock-lime",
    synced: "bg-paddock-ink ring-[3px] ring-paddock-lime",
    disconnected: "bg-paddock-danger",
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
            className="flex min-w-0 items-center gap-3"
        >
            <span className="flex pl-[7px]">
                {visible.map((participant) => {
                    const name = participant.isSelf
                        ? `${participant.name} (you)`
                        : participant.name;

                    return (
                        <span
                            key={participant.id}
                            title={name}
                            className="relative -ml-[7px] inline-flex"
                        >
                            <PaddockAvatar
                                person={{
                                    id: participant.id,
                                    name,
                                    image: participant.avatarUrl,
                                }}
                                size="sm"
                                ring="sheet"
                                className="size-[1.875rem] text-[0.65625rem]"
                            />
                            {participant.isTyping && (
                                <span
                                    aria-hidden="true"
                                    className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-paddock-sheet bg-paddock-lime"
                                />
                            )}
                        </span>
                    );
                })}

                {overflow > 0 && (
                    <span className="paddock-mono -ml-[7px] inline-flex size-[1.875rem] items-center justify-center rounded-full border-2 border-paddock-sheet bg-paddock-inverse text-[0.6875rem] text-paddock-on-inverse">
                        +{overflow}
                    </span>
                )}
            </span>

            <span className="flex shrink-0 items-center gap-2 text-[0.8125rem] font-semibold">
                <span
                    aria-hidden="true"
                    className={cn(
                        "size-2 rounded-full",
                        STATUS_DOT[connectionStatus],
                    )}
                />
                <span>
                    {participants.length === 1
                        ? "Just you"
                        : `${participants.length} here`}
                    {!isLive && ` · ${STATUS_LABELS[connectionStatus]}`}
                </span>
            </span>
        </div>
    );
}
