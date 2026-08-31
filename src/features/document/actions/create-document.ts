"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { createDocumentSchema } from "@/schemas/document";
import type { DocumentItem } from "../types";

export type CreateDocumentResult =
    { success: true; data: DocumentItem } | { success: false; error: string };

export async function createDocumentAction(
    input: unknown,
): Promise<CreateDocumentResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = createDocumentSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { workspaceId, title } = validated.data;

    const role = await getWorkspaceRole(workspaceId);
    if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
        return {
            success: false,
            error: "You do not have permission to create documents in this workspace",
        };
    }

    try {
        const document = await db.document.create({
            data: {
                workspaceId,
                title:
                    title && title.trim().length > 0
                        ? title.trim()
                        : "Untitled Document",
            },
            select: {
                id: true,
                title: true,
                workspaceId: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        revalidatePath(`/${workspaceId}/documents`);
        return { success: true, data: document };
    } catch {
        return { success: false, error: "Failed to create document" };
    }
}
