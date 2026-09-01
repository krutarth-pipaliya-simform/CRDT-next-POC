export type SaveState =
    "idle" | "pending" | "saving" | "saved" | "failed" | "offline" | "readonly";

export type ConnectionStatus =
    "connecting" | "connected" | "disconnected" | "synced";

export type ReadOnlyReason = "another_session" | "taken_over" | null;

export interface SessionAwarenessData {
    sessionId: string;
    joinedAt: number;
    takeoverTimestamp?: number;
}

export interface PresenceUser {
    id: string;
    name: string;
    color: string;
    avatarUrl?: string | null;
    lastActive?: number;
}

export interface DocumentItem {
    id: string;
    title: string;
    workspaceId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentDetail extends DocumentItem {
    contentBase64?: string | null;
}
