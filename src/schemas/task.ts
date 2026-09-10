import { z } from "zod";

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export type TaskStatusValue = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export type TaskPriorityValue = z.infer<typeof taskPrioritySchema>;

export const createTaskSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(200, "Title cannot exceed 200 characters"),
    description: z
        .string()
        .trim()
        .max(2000, "Description cannot exceed 2000 characters")
        .optional()
        .or(z.literal("")),
    status: taskStatusSchema.default("TODO"),
    priority: taskPrioritySchema.default("MEDIUM"),
    assigneeId: z.string().optional().or(z.literal("")),
    dueDate: z.string().optional().or(z.literal("")),
});

export const updateTaskSchema = z.object({
    taskId: z.string().min(1, "Task ID is required"),
    title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(200, "Title cannot exceed 200 characters")
        .optional(),
    description: z
        .string()
        .trim()
        .max(2000, "Description cannot exceed 2000 characters")
        .optional()
        .or(z.literal("")),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    assigneeId: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    position: z.number().optional(),
});

export const moveTaskSchema = z.object({
    taskId: z.string().min(1, "Task ID is required"),
    status: taskStatusSchema,
    position: z.number(),
});

export const deleteTaskSchema = z.object({
    taskId: z.string().min(1, "Task ID is required"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
