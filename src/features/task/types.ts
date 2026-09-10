import type {
    Task,
    TaskPriority,
    TaskStatus,
    User,
    WorkspaceMember,
} from "@prisma/client";

export type TaskWithAssignee = Task & {
    assignee:
        | (WorkspaceMember & {
              user: Pick<User, "id" | "name" | "email" | "image">;
          })
        | null;
};

export type TasksByStatus = Record<TaskStatus, TaskWithAssignee[]>;

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
} as const;

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
} as const;

export const PRIORITY_CYCLE: Record<TaskPriority, TaskPriority> = {
    LOW: "MEDIUM",
    MEDIUM: "HIGH",
    HIGH: "URGENT",
    URGENT: "LOW",
} as const;

export const COLUMN_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
