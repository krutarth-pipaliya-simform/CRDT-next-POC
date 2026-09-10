"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { createTaskSchema } from "@/schemas/task";

import type { TaskWithAssignee } from "../types";

export type CreateTaskResult =
    | { success: true; data: TaskWithAssignee }
    | { success: false; error: string };

export async function createTaskAction(
    input: unknown,
): Promise<CreateTaskResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const rawData =
        input instanceof FormData ? Object.fromEntries(input.entries()) : input;

    const validated = createTaskSchema.safeParse(rawData);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const {
        workspaceId,
        title,
        description,
        status,
        priority,
        assigneeId,
        dueDate,
    } = validated.data;

    const role = await getWorkspaceRole(workspaceId);
    if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
        return {
            success: false,
            error: "You do not have permission to create tasks in this workspace",
        };
    }

    try {
        const lastTask = await db.task.findFirst({
            where: { workspaceId, status },
            orderBy: { position: "desc" },
            select: { position: true },
        });
        const position = (lastTask?.position ?? 0) + 1024;

        let parsedDueDate: Date | null = null;
        if (dueDate && dueDate.trim().length > 0) {
            const d = new Date(dueDate);
            if (!isNaN(d.getTime())) {
                parsedDueDate = d;
            }
        }

        const task = await db.task.create({
            data: {
                title,
                description: description?.trim() || null,
                status,
                priority,
                position,
                dueDate: parsedDueDate,
                assigneeId: assigneeId?.trim() || null,
                workspaceId,
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

        revalidatePath(`/${workspaceId}/tasks`);
        return { success: true, data: task };
    } catch {
        return { success: false, error: "Failed to create task" };
    }
}
