"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { updateDocumentSchema } from "@/schemas/document";
import type { DocumentItem } from "../types";

export type UpdateDocumentResult =
    { success: true; data: DocumentItem } | { success: false; error: string };

export async function updateDocumentAction(
    input: unknown,
): Promise<UpdateDocumentResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = updateDocumentSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { id, workspaceId, title } = validated.data;

    const role = await getWorkspaceRole(workspaceId);
    if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
        return {
            success: false,
            error: "You do not have permission to edit documents in this workspace",
        };
    }

    try {
        const document = await db.document.update({
            where: {
                id,
                workspaceId,
            },
            data: {
                title,
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
        revalidatePath(`/${workspaceId}/documents/${id}`);
        return { success: true, data: document };
    } catch {
        return { success: false, error: "Failed to update document" };
    }
}
