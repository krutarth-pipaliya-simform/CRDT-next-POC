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

const priorityStyles: Record<TaskPriority, string> = {
    LOW: "bg-brand-muted text-brand-subtle border-brand-border",
    MEDIUM: "bg-brand-accent/10 text-brand-accent border-brand-accent",
    HIGH: "bg-brand-warning/10 text-brand-warning border-brand-warning",
    URGENT: "bg-brand-danger/10 text-brand-danger border-brand-danger font-semibold",
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
                    "inline-flex items-center px-2 py-0.5 font-brand-mono text-[10px] uppercase tracking-wider border rounded-brand select-none",
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
                "inline-flex items-center px-2 py-0.5 font-brand-mono text-[10px] uppercase tracking-wider border rounded-brand select-none cursor-pointer transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-brand-ink focus-visible:outline-offset-1",
                priorityStyles[optimisticPriority],
                className,
            )}
        >
            {TASK_PRIORITY_LABELS[optimisticPriority]}
        </button>
    );
}
