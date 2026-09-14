import type { NotificationType, User } from "@prisma/client";

/**
 * Notification row joined with the acting user, as rendered by the bell and the activity feed.
 */
export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    body: string | null;
    href: string | null;
    workspaceId: string;
    readAt: Date | null;
    createdAt: Date;
    actor: Pick<User, "id" | "name" | "email" | "image"> | null;
}

/**
 * Wire format pushed over SSE. Dates are ISO strings so the payload survives JSON serialization.
 */
export interface NotificationPayload {
    id: string;
    type: NotificationType;
    title: string;
    body: string | null;
    href: string | null;
    workspaceId: string;
    readAt: string | null;
    createdAt: string;
    actor: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
    TASK_ASSIGNED: "Task assigned",
    TASK_COMPLETED: "Task completed",
    DOCUMENT_CREATED: "Document created",
    MEMBER_JOINED: "Member joined",
    MENTION: "Mention",
} as const;

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
    TASK_ASSIGNED: "◆",
    TASK_COMPLETED: "✓",
    DOCUMENT_CREATED: "▤",
    MEMBER_JOINED: "＋",
    MENTION: "@",
} as const;

/** Maximum notifications rendered inside the header bell dropdown. */
export const NOTIFICATION_BELL_LIMIT = 12;

/** Maximum notifications rendered on a workspace activity feed page. */
export const ACTIVITY_FEED_LIMIT = 50;
