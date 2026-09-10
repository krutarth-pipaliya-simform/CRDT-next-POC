"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { moveTaskSchema } from "@/schemas/task";

export type MoveTaskResult =
    { success: true } | { success: false; error: string };

export async function moveTaskAction(input: unknown): Promise<MoveTaskResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = moveTaskSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { taskId, status, position } = validated.data;

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
            error: "You do not have permission to move tasks in this workspace",
        };
    }

    try {
        await db.task.update({
            where: { id: taskId },
            data: { status, position },
        });

        revalidatePath(`/${task.workspaceId}/tasks`);
        return { success: true };
    } catch {
        return { success: false, error: "Failed to move task" };
    }
}
