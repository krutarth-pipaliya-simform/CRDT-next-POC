"use server";

import { revalidatePath } from "next/cache";

import type { TaskPriority } from "@prisma/client";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { setTaskPrioritySchema } from "@/schemas/task";

export type SetTaskPriorityResult =
    | { success: true; data: { priority: TaskPriority } }
    | { success: false; error: string };

/**
 * Sets a task's priority to a given value. The badge cycles locally and sends
 * only where the clicking stopped, so this takes the target rather than
 * "next", which would also make a retried request move it twice.
 */
export async function setTaskPriorityAction(
    input: unknown,
): Promise<SetTaskPriorityResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = setTaskPrioritySchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { taskId, priority } = validated.data;

    const task = await db.task.findUnique({
        where: { id: taskId },
        select: { id: true, workspaceId: true },
    });

    if (!task) {
        return { success: false, error: "Task not found" };
    }

    const role = await getWorkspaceRole(task.workspaceId);
    if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
        return {
            success: false,
            error: "You do not have permission to modify tasks in this workspace",
        };
    }

    try {
        await db.task.update({
            where: { id: taskId },
            data: { priority },
        });

        revalidatePath(`/${task.workspaceId}/tasks`);
        return { success: true, data: { priority } };
    } catch {
        return { success: false, error: "Failed to change priority" };
    }
}
