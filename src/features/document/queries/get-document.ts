import "server-only";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import type { DocumentDetail } from "../types";

export async function getDocument(
    workspaceId: string,
    documentId: string,
): Promise<DocumentDetail | null> {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const role = await getWorkspaceRole(workspaceId);
    if (!role) {
        return null;
    }

    const doc = await db.document.findFirst({
        where: {
            id: documentId,
            workspaceId,
        },
    });

    if (!doc) {
        return null;
    }

    let contentBase64: string | null = null;
    if (doc.content) {
        contentBase64 = Buffer.from(doc.content).toString("base64");
    }

    return {
        id: doc.id,
        title: doc.title,
        workspaceId: doc.workspaceId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        contentBase64,
    };
}
