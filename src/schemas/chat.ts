import { z } from "zod";

export const MESSAGE_MAX_LENGTH = 2000;

export const sendMessageSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    body: z
        .string()
        .trim()
        .min(1, "Message cannot be empty")
        .max(
            MESSAGE_MAX_LENGTH,
            `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`,
        ),
});

export const getMessagesSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    before: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
