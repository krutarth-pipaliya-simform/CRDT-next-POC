import "server-only";

import { auth } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";

export interface RecentDocument {
    id: string;
    title: string;
    workspaceId: string;
    updatedAt: Date;
}

/**
 * The caller's most recently edited documents, across every workspace they
 * belong to. Membership is the filter itself, so a document in a workspace the
 * caller cannot see never matches.
 */
export async function getRecentDocuments(limit = 6): Promise<RecentDocument[]> {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return [];
    }

    return db.document.findMany({
        where: {
            workspace: { members: { some: { userId } } },
        },
        select: {
            id: true,
            title: true,
            workspaceId: true,
            updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
    });
}
