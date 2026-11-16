import { z } from "zod";

export const markNotificationReadSchema = z.object({
    notificationId: z.string().min(1, "Notification ID is required"),
});

export const markAllNotificationsReadSchema = z.object({
    workspaceId: z.string().min(1).optional(),
});

export type MarkNotificationReadInput = z.infer<
    typeof markNotificationReadSchema
>;
export type MarkAllNotificationsReadInput = z.infer<
    typeof markAllNotificationsReadSchema
>;

export const notificationTypeSchema = z.enum([
    "TASK_ASSIGNED",
    "TASK_COMPLETED",
    "DOCUMENT_CREATED",
    "MEMBER_JOINED",
    "MENTION",
]);

/** The wire format of one notification pushed over SSE. */
export const notificationPayloadSchema = z.object({
    id: z.string(),
    type: notificationTypeSchema,
    title: z.string(),
    body: z.string().nullable(),
    href: z.string().nullable(),
    workspaceId: z.string(),
    readAt: z.string().nullable(),
    createdAt: z.string(),
    actor: z
        .object({
            id: z.string(),
            name: z.string().nullable(),
            email: z.string().nullable(),
            image: z.string().nullable(),
        })
        .nullable(),
});
