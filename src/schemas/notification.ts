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
