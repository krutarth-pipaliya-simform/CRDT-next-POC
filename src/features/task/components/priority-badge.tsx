"use client";

import { useState, useTransition } from "react";
import type { TaskPriority } from "@prisma/client";
import { toast } from "sonner";

import { PriorityLabel } from "@/components/paddock/paddock-pills";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { cn } from "@/lib/cn";

import { setTaskPriorityAction } from "../actions/set-task-priority";
import { PRIORITY_CYCLE, TASK_PRIORITY_LABELS } from "../types";

export interface PriorityBadgeProps {
    taskId: string;
    priority: TaskPriority;
    canEdit?: boolean;
    className?: string;
}

/** How long clicking must pause before the chosen priority is saved. */
const SAVE_DELAY_MS = 500;

/**
 * Priority is weight, not identity, so it is set in bold text rather than a
 * chip, and never in a person's hue. `PriorityLabel` owns the treatment; this
 * adds the click-to-cycle control around it for people who can edit.
 *
 * Each click moves the label at once, but only where the clicking stops is
 * saved: going from Low to Urgent is three clicks and one request.
 */
export function PriorityBadge({
    taskId,
    priority,
    canEdit = false,
    className,
}: PriorityBadgeProps) {
    const [pending, setPending] = useState<TaskPriority | null>(null);
    const [savedPriority, setSavedPriority] = useState(priority);
    const [, startTransition] = useTransition();

    // The server's value has caught up (or someone else changed it): show it.
    if (priority !== savedPriority) {
        setSavedPriority(priority);
        setPending(null);
    }

    const shown = pending ?? priority;

    const save = useDebouncedCallback(
        (target: TaskPriority) => {
            if (target === priority) {
                setPending(null);
                return;
            }
            startTransition(async () => {
                const result = await setTaskPriorityAction({
                    taskId,
                    priority: target,
                });
                if (!result.success) {
                    setPending(null);
                    toast.error(result.error);
                }
            });
        },
        SAVE_DELAY_MS,
        { flushOnUnmount: true },
    );

    function handleCycle() {
        if (!canEdit) return;
        const next = PRIORITY_CYCLE[shown];
        setPending(next);
        save.schedule(next);
    }

    if (!canEdit) {
        return (
            <PriorityLabel
                priority={shown}
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
            aria-label={`Current priority: ${TASK_PRIORITY_LABELS[shown]}. Click to change.`}
            className={cn(
                "group/priority -mx-1 -my-3 inline-flex min-h-11 cursor-pointer items-center rounded-paddock px-1 select-none",
                className,
            )}
        >
            <PriorityLabel
                priority={shown}
                className="underline-offset-[3px] group-hover/priority:underline"
            />
        </button>
    );
}
