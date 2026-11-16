import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

import type { TaskWithAssignee } from "../types";

import "server-only";

export async function getWorkspaceTasks(
    workspaceId: string,
): Promise<TaskWithAssignee[]> {
    const role = await getWorkspaceRole(workspaceId);
    if (!role) {
        return [];
    }

    return db.task.findMany({
        where: { workspaceId },
        include: {
            assignee: {
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
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
}
