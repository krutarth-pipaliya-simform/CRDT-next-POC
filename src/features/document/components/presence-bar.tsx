"use client";

import { WifiOff } from "lucide-react";

import { AvatarStack } from "@/components/paddock/paddock-avatar";
import { cn } from "@/lib/cn";

import type { ConnectionStatus, PresenceUser } from "../types";

export interface PresenceBarProps {
    users: PresenceUser[];
    currentUserId: string;
    connectionStatus: ConnectionStatus;
    isReadOnly?: boolean;
}

/**
 * Who is in this document right now. Each face is filled with the same hue as
 * that person's caret in the text, which is the whole point — you can look up
 * from a moving cursor and know whose it is.
 */
export function PresenceBar({
    users,
    currentUserId,
    connectionStatus,
    isReadOnly = false,
}: PresenceBarProps) {
    const isOnline =
        connectionStatus === "connected" || connectionStatus === "synced";
    const isConnecting = connectionStatus === "connecting";
    const others = users.filter((user) => user.id !== currentUserId);

    return (
        <div className="flex items-center gap-2.5">
            {users.length > 0 ? (
                <AvatarStack
                    size="md"
                    ring="paper"
                    max={5}
                    people={users.map((user) => ({
                        id: user.id,
                        name:
                            user.id === currentUserId
                                ? `${user.name} (you)`
                                : user.name,
                        image: user.avatarUrl,
                    }))}
                />
            ) : null}

            {/* Connection is only worth a word when something is wrong;
                "everything is fine" does not need a badge shouting it. */}
            <span
                className={cn(
                    "flex items-center gap-1.5 text-[0.8125rem] font-semibold whitespace-nowrap",
                    isOnline ? "text-paddock-ink" : "text-paddock-warning",
                )}
            >
                {isOnline ? (
                    <>
                        {/* A spectating session is here, but not live in the text. */}
                        <span
                            aria-hidden="true"
                            className={cn(
                                "size-2 rounded-full bg-paddock-ink",
                                !isReadOnly &&
                                    "shadow-[0_0_0_3px_var(--color-paddock-lime)]",
                            )}
                        />
                        {others.length === 0
                            ? "Just you"
                            : `${users.length} here`}
                    </>
                ) : isConnecting ? (
                    <>
                        <span
                            aria-hidden="true"
                            className="size-2 animate-presence-pulse rounded-full bg-paddock-warning"
                        />
                        Reconnecting
                    </>
                ) : (
                    <>
                        <WifiOff className="size-3.5" aria-hidden="true" />
                        Offline — edits are saved here
                    </>
                )}
            </span>
        </div>
    );
}
