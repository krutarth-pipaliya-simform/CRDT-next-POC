"use client";

import { useOptimistic, useTransition } from "react";
import type { TaskPriority } from "@prisma/client";

import { PriorityLabel } from "@/components/paddock/paddock-pills";
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
 * Priority is weight, not identity, so it is set in bold text rather than a
 * chip, and never in a person's hue. `PriorityLabel` owns the treatment; this
 * adds the click-to-cycle control around it for people who can edit.
 */
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
            <PriorityLabel
                priority={optimisticPriority}
                className={cn("select-none", className)}
            />
        );
    }

    // The 44px hit area is pulled back into the line with negative margins,
    // so the row stays tight while the target stays reachable.
    return (
        <button
            type="button"
            onClick={handleCycle}
            title="Click to cycle priority"
            aria-label={`Current priority: ${TASK_PRIORITY_LABELS[optimisticPriority]}. Click to change.`}
            className={cn(
                "group/priority -mx-1 -my-3 inline-flex min-h-11 cursor-pointer items-center rounded-paddock px-1 select-none",
                className,
            )}
        >
            <PriorityLabel
                priority={optimisticPriority}
                className="underline-offset-[3px] group-hover/priority:underline"
            />
        </button>
    );
}
