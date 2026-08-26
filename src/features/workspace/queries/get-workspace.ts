import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { rawDb } from "@/lib/db";

import "server-only";

export async function getWorkspace(workspaceId: string) {
    const role = await getWorkspaceRole(workspaceId);
    if (!role) {
        return null;
    }

    return rawDb.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            documents: {
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            tasks: {
                select: { id: true, title: true, status: true },
            },
            members: {
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
            },
        },
    });
}
