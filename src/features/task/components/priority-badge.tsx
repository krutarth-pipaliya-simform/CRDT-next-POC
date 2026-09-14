"use client";

import { useOptimistic, useTransition } from "react";

import type { TaskPriority } from "@prisma/client";

import { cn } from "@/lib/cn";

import { cyclePriorityAction } from "../actions/cycle-priority";
import { PRIORITY_CYCLE, TASK_PRIORITY_LABELS } from "../types";

export interface PriorityBadgeProps {
    taskId: string;
    priority: TaskPriority;
    canEdit?: boolean;
    className?: string;
}

/**
 * Priority is weight, not identity, so it is set in text rather than in a
 * bordered chip. Low and Medium recede into the ink scale; only High and Urgent
 * take colour, which is what makes them findable when a column is full.
 */
const priorityStyles: Record<TaskPriority, string> = {
    LOW: "text-brand-subtle",
    MEDIUM: "text-brand-subtle",
    HIGH: "text-brand-warning",
    URGENT: "text-brand-danger font-medium",
};

export function PriorityBadge({
    taskId,
    priority,
    canEdit = false,
    className,
}: PriorityBadgeProps) {
    const [optimisticPriority, setOptimisticPriority] = useOptimistic(priority);
    const [, startTransition] = useTransition();

    function handleCycle() {
        if (!canEdit) return;

        startTransition(async () => {
            const nextPriority = PRIORITY_CYCLE[optimisticPriority];
            setOptimisticPriority(nextPriority);
            await cyclePriorityAction(taskId);
        });
    }

    if (!canEdit) {
        return (
            <span
                className={cn(
                    "inline-flex items-center text-[13px] select-none",
                    priorityStyles[optimisticPriority],
                    className,
                )}
            >
                {TASK_PRIORITY_LABELS[optimisticPriority]}
            </span>
        );
    }

    return (
        <button
            type="button"
            onClick={handleCycle}
            title="Click to cycle priority"
            aria-label={`Current priority: ${TASK_PRIORITY_LABELS[optimisticPriority]}. Click to change.`}
            className={cn(
                "inline-flex items-center text-[13px] select-none cursor-pointer rounded-brand underline-offset-2 hover:underline transition-colors",
                priorityStyles[optimisticPriority],
                className,
            )}
        >
            {TASK_PRIORITY_LABELS[optimisticPriority]}
        </button>
    );
}
