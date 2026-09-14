"use client";

import { WifiOff } from "lucide-react";

import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/cn";
import { presenceVar } from "@/lib/presence";

import type { ConnectionStatus, PresenceUser } from "../types";

export interface PresenceBarProps {
    users: PresenceUser[];
    currentUserId: string;
    connectionStatus: ConnectionStatus;
    isReadOnly?: boolean;
}

/**
 * Who is in this document right now. The colour on each avatar is the same hue
 * as that person's caret in the text, which is the whole point — you can look
 * up from a moving cursor and know whose it is.
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
        <div className="flex items-center gap-3">
            {isReadOnly && (
                <span
                    className="px-1.5 py-0.5 text-[13px] text-brand-warning border border-brand-warning/40 bg-brand-warning/10 rounded-brand"
                    title="Another of your sessions has this document open"
                >
                    Read only
                </span>
            )}

            {users.length > 0 && (
                <div className="flex items-center -space-x-1">
                    {users.slice(0, 5).map((user) => {
                        const isSelf = user.id === currentUserId;
                        return (
                            <span
                                key={user.id}
                                className="relative group"
                                title={`${user.name}${isSelf ? " (you)" : ""}`}
                            >
                                <UserAvatar
                                    user={{
                                        id: user.id,
                                        name: user.name,
                                        image: user.avatarUrl,
                                    }}
                                    size="sm"
                                    className="ring-2 ring-brand-surface transition-transform duration-100 group-hover:-translate-y-0.5"
                                />
                                <span
                                    aria-hidden="true"
                                    className="absolute -bottom-px left-0 right-0 h-[3px]"
                                    style={{
                                        backgroundColor: presenceVar(user.id),
                                    }}
                                />
                            </span>
                        );
                    })}

                    {users.length > 5 && (
                        <span
                            className="w-6 h-6 grid place-items-center rounded-brand bg-brand-muted text-brand-subtle text-[11px] tabular-nums ring-2 ring-brand-surface"
                            title={`${users.length - 5} more people are here`}
                        >
                            +{users.length - 5}
                        </span>
                    )}
                </div>
            )}

            {/* Connection is only worth a word when something is wrong;
                "everything is fine" does not need a green badge shouting it. */}
            <span
                className={cn(
                    "flex items-center gap-1.5 text-[13px]",
                    isOnline ? "text-brand-subtle" : "text-brand-warning",
                )}
            >
                {isOnline ? (
                    <>
                        <span
                            aria-hidden="true"
                            className="w-1.5 h-1.5 rounded-full bg-brand-success"
                        />
                        {others.length === 0
                            ? "Just you"
                            : `${users.length} here`}
                    </>
                ) : isConnecting ? (
                    <>
                        <span
                            aria-hidden="true"
                            className="w-1.5 h-1.5 rounded-full bg-brand-warning animate-presence-pulse"
                        />
                        Reconnecting
                    </>
                ) : (
                    <>
                        <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
                        Offline — edits are saved here
                    </>
                )}
            </span>
        </div>
    );
}
