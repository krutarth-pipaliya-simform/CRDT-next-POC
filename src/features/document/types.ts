export type SaveState =
    "idle" | "pending" | "saving" | "saved" | "failed" | "offline";

export type ConnectionStatus =
    "connecting" | "connected" | "disconnected" | "synced";

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
