"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { deleteTaskSchema } from "@/schemas/task";

export type DeleteTaskResult =
    { success: true } | { success: false; error: string };

export async function deleteTaskAction(
    input: unknown,
): Promise<DeleteTaskResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const rawData =
        input instanceof FormData ? Object.fromEntries(input.entries()) : input;

    const validated = deleteTaskSchema.safeParse(rawData);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { taskId } = validated.data;

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
            error: "You do not have permission to delete tasks in this workspace",
        };
    }

    try {
        await db.task.delete({
            where: { id: taskId },
        });

        revalidatePath(`/${task.workspaceId}/tasks`);
        return { success: true };
    } catch {
        return { success: false, error: "Failed to delete task" };
    }
}
