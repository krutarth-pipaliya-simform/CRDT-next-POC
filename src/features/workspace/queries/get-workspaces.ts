import { auth } from "@/features/auth/lib/auth";
import { rawDb } from "@/lib/db";

import "server-only";

export async function getWorkspacesForUser(providedUserId?: string) {
    let userId = providedUserId;
    if (!userId) {
        const session = await auth();
        userId = session?.user?.id;
    }
    if (!userId) return [];

    return rawDb.workspace.findMany({
        where: {
            members: { some: { userId } },
        },
        include: {
            members: { select: { role: true, userId: true } },
            _count: { select: { members: true } },
        },
        orderBy: { createdAt: "asc" },
    });
}
