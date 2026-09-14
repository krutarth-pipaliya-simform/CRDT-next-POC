"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { PresenceRail } from "@/components/ui/presence-rail";
import { cn } from "@/lib/cn";

import type { TaskWithAssignee } from "../types";
import { PriorityBadge } from "./priority-badge";

export interface TaskCardProps {
    task: TaskWithAssignee;
    canEdit?: boolean;
    onOpenDetail?: (task: TaskWithAssignee) => void;
    isOverlay?: boolean;
}

export function TaskCard({
    task,
    canEdit = false,
    onOpenDetail,
    isOverlay = false,
}: TaskCardProps) {
    const [now] = useState(() => Date.now());
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        disabled: !canEdit || isOverlay,
        data: { task },
        attributes: {
            role: "article",
            tabIndex: 0,
        },
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    function handleCardClick(e: MouseEvent) {
        // Prevent opening detail dialog if clicking interactive children
        if (
            e.target instanceof Element &&
            (e.target.closest("button") ||
                e.target.closest("a") ||
                e.target.closest("input"))
        ) {
            return;
        }
        onOpenDetail?.(task);
    }

    const formattedDueDate = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
          })
        : null;

    const assigneeUserId = task.assignee?.user?.id ?? null;
    const assigneeName = task.assignee?.user
        ? (task.assignee.user.name ?? task.assignee.user.email ?? "Member")
        : null;

    const isPastDue =
        task.dueDate &&
        new Date(task.dueDate).getTime() < now &&
        task.status !== "DONE";

    return (
        <article
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleCardClick}
            aria-label={`Task: ${task.title}`}
            data-testid="task-card"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    if (
                        e.target instanceof Element &&
                        e.target.tagName !== "BUTTON" &&
                        e.target.tagName !== "A"
                    ) {
                        e.preventDefault();
                        onOpenDetail?.(task);
                    }
                }
            }}
            className={cn(
                // Flat at rest on a rule; the hard shadow is saved for the card
                // that is genuinely floating under the cursor mid-drag.
                "group relative flex gap-3 bg-brand-surface border border-brand-border p-3 pl-0 rounded-brand transition-[transform,box-shadow,border-color] duration-100 select-none",
                canEdit
                    ? "cursor-grab active:cursor-grabbing hover:border-brand-ink hover:-translate-y-[2px] hover:shadow-brand-subtle"
                    : "cursor-pointer hover:border-brand-line",
                isOverlay &&
                    "rotate-1 shadow-brand-card border-brand-ink cursor-grabbing z-50",
            )}
        >
            {/* Whose task this is, readable before the title. */}
            <PresenceRail
                userIds={assigneeUserId ? [assigneeUserId] : []}
                className="ml-0"
            />

            <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-brand-ink leading-snug line-clamp-2">
                    {task.title}
                </h3>

                {task.description && (
                    <p className="text-[13px] text-brand-subtle line-clamp-2 mt-1.5 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {/* Who, then how urgent, then when — the order someone
                    triaging a board actually reads them in. An empty slot is
                    left empty rather than filled with an em dash. */}
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2.5 text-[13px] text-brand-subtle">
                    <span className="truncate max-w-[14ch] text-brand-ink">
                        {assigneeName ?? "Unassigned"}
                    </span>
                    <PriorityBadge
                        taskId={task.id}
                        priority={task.priority}
                        canEdit={canEdit}
                    />
                    {formattedDueDate && (
                        <time
                            className={cn(
                                isPastDue && "text-brand-danger font-medium",
                            )}
                            title={isPastDue ? "Overdue" : "Due"}
                        >
                            {isPastDue ? "Overdue " : "Due "}
                            {formattedDueDate}
                        </time>
                    )}
                </div>
            </div>
        </article>
    );
}
