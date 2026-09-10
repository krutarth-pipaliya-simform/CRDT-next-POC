"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { updateTaskSchema } from "@/schemas/task";

import type { TaskWithAssignee } from "../types";

export type UpdateTaskResult =
    | { success: true; data: TaskWithAssignee }
    | { success: false; error: string };

export async function updateTaskAction(
    input: unknown,
): Promise<UpdateTaskResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const rawData =
        input instanceof FormData ? Object.fromEntries(input.entries()) : input;

    const validated = updateTaskSchema.safeParse(rawData);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const {
        taskId,
        title,
        description,
        status,
        priority,
        assigneeId,
        dueDate,
        position,
    } = validated.data;

    const existing = await db.task.findUnique({
        where: { id: taskId },
        select: { id: true, workspaceId: true },
    });

    if (!existing) {
        return { success: false, error: "Task not found" };
    }

    const role = await getWorkspaceRole(existing.workspaceId);
    if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
        return {
            success: false,
            error: "You do not have permission to update tasks in this workspace",
        };
    }

    try {
        let parsedDueDate: Date | null | undefined = undefined;
        if (dueDate !== undefined) {
            if (dueDate === null || dueDate.trim() === "") {
                parsedDueDate = null;
            } else {
                const d = new Date(dueDate);
                parsedDueDate = !isNaN(d.getTime()) ? d : null;
            }
        }

        const task = await db.task.update({
            where: { id: taskId },
            data: {
                ...(title !== undefined ? { title } : {}),
                ...(description !== undefined
                    ? { description: description?.trim() || null }
                    : {}),
                ...(status !== undefined ? { status } : {}),
                ...(priority !== undefined ? { priority } : {}),
                ...(assigneeId !== undefined
                    ? { assigneeId: assigneeId?.trim() || null }
                    : {}),
                ...(parsedDueDate !== undefined
                    ? { dueDate: parsedDueDate }
                    : {}),
                ...(position !== undefined ? { position } : {}),
            },
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

        revalidatePath(`/${existing.workspaceId}/tasks`);
        return { success: true, data: task };
    } catch {
        return { success: false, error: "Failed to update task" };
    }
}
