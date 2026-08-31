"use server";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { saveDocumentStateSchema } from "@/schemas/document";

export type SaveDocumentResult =
    | { success: true; data: { id: string; updatedAt: Date } }
    | { success: false; error: string };

export async function saveDocumentAction(
    input: unknown,
): Promise<SaveDocumentResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = saveDocumentStateSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { id, workspaceId, title, contentBase64 } = validated.data;

    const role = await getWorkspaceRole(workspaceId);
    if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
        return {
            success: false,
            error: "You do not have permission to save documents in this workspace",
        };
    }

    try {
        const updateData: {
            title?: string;
            content?: Uint8Array<ArrayBuffer>;
            updatedAt: Date;
        } = {
            updatedAt: new Date(),
        };

        if (title && title.trim().length > 0) {
            updateData.title = title.trim();
        }

        if (contentBase64) {
            const buf = Buffer.from(contentBase64, "base64");
            const arrayBuffer = new ArrayBuffer(buf.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < buf.length; i++) {
                view[i] = buf[i] ?? 0;
            }
            updateData.content = view;
        }

        const updated = await db.document.update({
            where: {
                id,
                workspaceId,
            },
            data: updateData,
            select: {
                id: true,
                updatedAt: true,
            },
        });

        return {
            success: true,
            data: { id: updated.id, updatedAt: updated.updatedAt },
        };
    } catch {
        return { success: false, error: "Failed to save document" };
    }
}
