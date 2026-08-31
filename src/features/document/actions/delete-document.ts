"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { deleteDocumentSchema } from "@/schemas/document";

export type DeleteDocumentResult =
    { success: true; data: { id: string } } | { success: false; error: string };

export async function deleteDocumentAction(
    input: unknown,
): Promise<DeleteDocumentResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = deleteDocumentSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { id, workspaceId } = validated.data;

    const role = await getWorkspaceRole(workspaceId);
    if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
        return {
            success: false,
            error: "You do not have permission to delete documents in this workspace",
        };
    }

    try {
        await db.document.delete({
            where: {
                id,
                workspaceId,
            },
        });

        revalidatePath(`/${workspaceId}/documents`);
        return { success: true, data: { id } };
    } catch {
        return { success: false, error: "Failed to delete document" };
    }
}
