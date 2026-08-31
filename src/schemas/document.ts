import { z } from "zod";

export const createDocumentSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    title: z
        .string()
        .trim()
        .max(100, "Title cannot exceed 100 characters")
        .optional()
        .default("Untitled Document"),
});

export const updateDocumentSchema = z.object({
    id: z.string().min(1, "Document ID is required"),
    workspaceId: z.string().min(1, "Workspace ID is required"),
    title: z
        .string()
        .trim()
        .min(1, "Title cannot be empty")
        .max(100, "Title cannot exceed 100 characters"),
});

export const deleteDocumentSchema = z.object({
    id: z.string().min(1, "Document ID is required"),
    workspaceId: z.string().min(1, "Workspace ID is required"),
});

export const saveDocumentStateSchema = z.object({
    id: z.string().min(1, "Document ID is required"),
    workspaceId: z.string().min(1, "Workspace ID is required"),
    title: z.string().trim().max(100).optional(),
    contentBase64: z.string().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type DeleteDocumentInput = z.infer<typeof deleteDocumentSchema>;
export type SaveDocumentStateInput = z.infer<typeof saveDocumentStateSchema>;
