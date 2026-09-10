"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { UserAvatar } from "@/components/ui/user-avatar";
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
                "group relative bg-brand-surface border-2 border-brand-ink p-3.5 rounded-brand shadow-brand-subtle transition-all select-none",
                canEdit
                    ? "cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-brand-card"
                    : "cursor-pointer",
                isOverlay &&
                    "rotate-2 shadow-brand-card ring-2 ring-brand-accent cursor-grabbing z-50",
                "focus-visible:outline-2 focus-visible:outline-brand-accent focus-visible:outline-offset-2",
            )}
        >
            {/* Header: Title and Priority */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-brand-sans font-semibold text-sm text-brand-ink leading-snug line-clamp-2">
                    {task.title}
                </h3>
                <div className="shrink-0 pt-0.5">
                    <PriorityBadge
                        taskId={task.id}
                        priority={task.priority}
                        canEdit={canEdit}
                    />
                </div>
            </div>

            {/* Description Snippet */}
            {task.description && (
                <p className="font-brand-sans text-xs text-brand-subtle line-clamp-2 mb-3">
                    {task.description}
                </p>
            )}

            {/* Footer: Due date and Assignee */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-brand-border/80 text-xs font-brand-mono text-brand-subtle">
                <div className="flex items-center gap-1.5">
                    {formattedDueDate ? (
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-brand border text-[11px]",
                                isPastDue
                                    ? "bg-brand-danger/10 text-brand-danger border-brand-danger font-semibold"
                                    : "bg-brand-muted text-brand-subtle border-brand-border",
                            )}
                            title={isPastDue ? "Overdue" : "Due date"}
                        >
                            <span>📅</span>
                            <span>{formattedDueDate}</span>
                        </span>
                    ) : (
                        <span className="text-brand-subtle/50 text-[11px]">
                            —
                        </span>
                    )}
                </div>

                {task.assignee?.user ? (
                    <div
                        className="flex items-center gap-1"
                        title={`Assigned to ${task.assignee.user.name || task.assignee.user.email || "Member"}`}
                    >
                        <UserAvatar user={task.assignee.user} size="sm" />
                    </div>
                ) : (
                    <span
                        className="text-[10px] text-brand-subtle/60 uppercase tracking-wider"
                        title="Unassigned"
                    >
                        Unassigned
                    </span>
                )}
            </div>
        </article>
    );
}
