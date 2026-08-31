"use client";

import { WifiOff } from "lucide-react";

import { UserAvatar } from "@/components/ui/user-avatar";
import type { ConnectionStatus, PresenceUser } from "../types";

export interface PresenceBarProps {
    users: PresenceUser[];
    currentUserId: string;
    connectionStatus: ConnectionStatus;
}

export function PresenceBar({
    users,
    currentUserId,
    connectionStatus,
}: PresenceBarProps) {
    const isOnline =
        connectionStatus === "connected" || connectionStatus === "synced";
    const isConnecting = connectionStatus === "connecting";

    return (
        <div className="flex items-center gap-3">
            {/* Connection Indicator */}
            <div
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-brand-mono uppercase tracking-wider border rounded-brand"
                style={{
                    backgroundColor: isOnline
                        ? "var(--color-brand-muted)"
                        : isConnecting
                          ? "rgba(41, 72, 255, 0.08)"
                          : "rgba(217, 119, 6, 0.1)",
                    borderColor: isOnline
                        ? "var(--color-brand-border)"
                        : isConnecting
                          ? "var(--color-brand-accent)"
                          : "var(--color-brand-warning)",
                    color: isOnline
                        ? "var(--color-brand-ink)"
                        : isConnecting
                          ? "var(--color-brand-accent)"
                          : "var(--color-brand-warning)",
                }}
            >
                {isOnline ? (
                    <>
                        <span
                            className="w-2 h-2 rounded-full bg-brand-success animate-pulse"
                            aria-hidden="true"
                        />
                        <span className="text-[11px] font-bold">
                            Live ({users.length})
                        </span>
                    </>
                ) : isConnecting ? (
                    <>
                        <span
                            className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"
                            aria-hidden="true"
                        />
                        <span className="text-[11px] font-bold">
                            Connecting...
                        </span>
                    </>
                ) : (
                    <>
                        <WifiOff
                            className="w-3 h-3 text-brand-warning"
                            aria-hidden="true"
                        />
                        <span className="text-[11px] font-bold">Offline</span>
                    </>
                )}
            </div>

            {/* Collaborator Avatars */}
            {users.length > 0 && (
                <div className="flex items-center -space-x-2 overflow-hidden py-1 px-1">
                    {users.slice(0, 5).map((user) => {
                        const isSelf = user.id === currentUserId;
                        return (
                            <div
                                key={user.id}
                                className="relative group focus-visible:outline-none"
                                title={`${user.name}${isSelf ? " (You)" : ""}`}
                            >
                                <div
                                    className="rounded-full border-2 border-brand-surface shadow-brand-subtle transition-transform duration-150 group-hover:scale-110 group-hover:z-10"
                                    style={{ borderColor: user.color }}
                                >
                                    <UserAvatar
                                        user={{
                                            name: user.name,
                                            image: user.avatarUrl,
                                        }}
                                        size="sm"
                                        className="w-7 h-7 text-[10px]"
                                    />
                                </div>

                                {/* Accessible tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-30 px-2 py-1 bg-brand-ink text-brand-surface text-[10px] font-brand-mono rounded-brand whitespace-nowrap shadow-brand-card pointer-events-none">
                                    {user.name} {isSelf ? "(You)" : ""}
                                </div>
                            </div>
                        );
                    })}

                    {users.length > 5 && (
                        <div
                            className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-muted text-brand-ink font-brand-mono text-[10px] font-bold border-2 border-brand-border"
                            title={`${users.length - 5} more collaborators`}
                        >
                            +{users.length - 5}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
