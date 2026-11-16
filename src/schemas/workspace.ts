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

/** How a role is written wherever a person reads one. */
export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
    ADMIN: "Admin",
    MEMBER: "Member",
    GUEST: "Guest",
};

/**
 * Narrows a role read from the database to the roles the product knows.
 * Lives here, not in a component, so server and client modules can both call
 * it: a function imported from a `"use client"` module is a client reference
 * on the server, and calling it throws.
 */
export function toWorkspaceRole(role: string): WorkspaceRole | null {
    switch (role) {
        case "ADMIN":
        case "MEMBER":
        case "GUEST":
            return role;
        default:
            return null;
    }
}

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
