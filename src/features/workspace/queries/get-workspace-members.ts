import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

import "server-only";

export async function getWorkspaceMembers(workspaceId: string) {
    const role = await getWorkspaceRole(workspaceId);
    if (!role) {
        return [];
    }

    return db.workspaceMember.findMany({
        where: { workspaceId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
        orderBy: {
            role: "asc",
        },
    });
}
