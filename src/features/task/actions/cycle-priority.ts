"use server";

import { revalidatePath } from "next/cache";

import type { TaskPriority } from "@prisma/client";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

import { PRIORITY_CYCLE } from "../types";

export type CyclePriorityResult =
    | { success: true; data: { priority: TaskPriority } }
    | { success: false; error: string };

export async function cyclePriorityAction(
    taskId: string,
): Promise<CyclePriorityResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    if (!taskId || typeof taskId !== "string") {
        return { success: false, error: "Invalid task ID" };
    }

    const task = await db.task.findUnique({
        where: { id: taskId },
        select: { id: true, priority: true, workspaceId: true },
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

    const nextPriority = PRIORITY_CYCLE[task.priority];

    try {
        await db.task.update({
            where: { id: taskId },
            data: { priority: nextPriority },
        });

        revalidatePath(`/${task.workspaceId}/tasks`);
        return { success: true, data: { priority: nextPriority } };
    } catch {
        return { success: false, error: "Failed to cycle priority" };
    }
}
