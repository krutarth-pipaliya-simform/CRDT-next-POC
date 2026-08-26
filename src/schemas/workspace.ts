import { z } from "zod";

export const createWorkspaceSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
});

export const updateWorkspaceSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
});

export const WorkspaceVisibility = {
    PUBLIC: "PUBLIC",
    PRIVATE: "PRIVATE",
} as const;

export type WorkspaceVisibility =
    (typeof WorkspaceVisibility)[keyof typeof WorkspaceVisibility];

export type WorkspaceRole = "ADMIN" | "MEMBER" | "GUEST";

export const leaveWorkspaceSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    transferToMemberId: z.string().optional(),
});

export const transferOwnershipSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    targetMemberId: z.string().min(1, "Target member ID is required"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type LeaveWorkspaceInput = z.infer<typeof leaveWorkspaceSchema>;
export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;
