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
    BACKLOG: "Backlog",
    TODO: "To do",
    IN_PROGRESS: "In progress",
    REVIEW: "Review",
    DONE: "Completed",
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

export const COLUMN_ORDER: TaskStatus[] = [
    "BACKLOG",
    "TODO",
    "IN_PROGRESS",
    "REVIEW",
    "DONE",
];
