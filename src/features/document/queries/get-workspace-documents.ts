import "server-only";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import type { DocumentItem } from "../types";

export async function getWorkspaceDocuments(
    workspaceId: string,
): Promise<DocumentItem[]> {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const role = await getWorkspaceRole(workspaceId);
    if (!role) {
        return [];
    }

    const documents = await db.document.findMany({
        where: {
            workspaceId,
        },
        select: {
            id: true,
            title: true,
            workspaceId: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return documents;
}
