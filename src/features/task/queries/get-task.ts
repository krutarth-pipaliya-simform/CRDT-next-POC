import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

import type { TaskWithAssignee } from "../types";

import "server-only";

export async function getTask(
    taskId: string,
): Promise<TaskWithAssignee | null> {
    const task = await db.task.findUnique({
        where: { id: taskId },
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
    });

    if (!task) {
        return null;
    }

    const role = await getWorkspaceRole(task.workspaceId);
    if (!role) {
        return null;
    }

    return task;
}
