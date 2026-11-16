import { Check, Circle, CircleDashed, CircleDot, Inbox } from "lucide-react";

import {
    TASK_PRIORITY_LABELS,
    TASK_STATUS_LABELS,
} from "@/features/task/types";
import { cn } from "@/lib/cn";
import type { TaskPriorityValue, TaskStatusValue } from "@/schemas/task";
import { WORKSPACE_ROLE_LABELS, type WorkspaceRole } from "@/schemas/workspace";

import { paddockPillBase } from "./paddock-styles";

/**
 * Labels come from the product's single sources (`TASK_*_LABELS`,
 * `WORKSPACE_ROLE_LABELS`); only the Paddock treatment is defined here.
 */

const STATUS_TREATMENT: Record<
    TaskStatusValue,
    { className: string; Icon: typeof Check }
> = {
    BACKLOG: {
        className:
            "border-[1.5px] border-dashed border-paddock-rule text-paddock-subtle",
        Icon: Inbox,
    },
    TODO: {
        className:
            "border-[1.5px] border-dashed border-paddock-ink text-paddock-ink",
        Icon: CircleDashed,
    },
    IN_PROGRESS: {
        className: "border-[1.5px] border-paddock-ink text-paddock-ink",
        Icon: Circle,
    },
    REVIEW: {
        className:
            "border-[1.5px] border-paddock-ink bg-paddock-ink/8 text-paddock-ink",
        Icon: CircleDot,
    },
    DONE: {
        className:
            "border-[1.5px] border-paddock-inverse bg-paddock-inverse text-paddock-on-inverse",
        Icon: Check,
    },
};

export interface StatusPillProps {
    status: TaskStatusValue;
    className?: string;
}

/**
 * Status is not a person, so it gets no hue: the states differ by outline
 * (faint dashed, dashed, solid, tinted, filled), by icon and by the word itself.
 */
export function StatusPill({ status, className }: StatusPillProps) {
    const { className: treatment, Icon } = STATUS_TREATMENT[status];
    return (
        <span className={cn(paddockPillBase, treatment, className)}>
            <Icon aria-hidden="true" className="size-3" strokeWidth={2.4} />
            {TASK_STATUS_LABELS[status]}
        </span>
    );
}

const PRIORITY_TONE: Record<TaskPriorityValue, string> = {
    LOW: "text-paddock-subtle",
    MEDIUM: "text-paddock-subtle",
    HIGH: "text-paddock-warning",
    URGENT: "text-paddock-danger",
};

export interface PriorityLabelProps {
    priority: TaskPriorityValue;
    className?: string;
}

/** Plain bold text, as on the task card. The word carries it; colour only adds urgency. */
export function PriorityLabel({ priority, className }: PriorityLabelProps) {
    return (
        <span
            className={cn(
                "text-[0.78125rem] font-bold",
                PRIORITY_TONE[priority],
                className,
            )}
        >
            <span className="sr-only">Priority: </span>
            {TASK_PRIORITY_LABELS[priority]}
        </span>
    );
}

const ROLE_TREATMENT: Record<WorkspaceRole, string> = {
    // Night stays dark in both themes, so lime text keeps its contrast.
    ADMIN: "border-[1.5px] border-paddock-ink bg-paddock-night text-paddock-lime",
    MEMBER: "border-[1.5px] border-paddock-ink text-paddock-ink",
    GUEST: "border-[1.5px] border-dashed border-paddock-ink text-paddock-ink",
};

export interface RolePillProps {
    role: WorkspaceRole;
    className?: string;
}

/** Workspace role. Admin is the only filled one; guest is dashed, like a visitor's badge. */
export function RolePill({ role, className }: RolePillProps) {
    return (
        <span
            className={cn(
                paddockPillBase,
                "py-1.5",
                ROLE_TREATMENT[role],
                className,
            )}
        >
            {WORKSPACE_ROLE_LABELS[role]}
        </span>
    );
}
