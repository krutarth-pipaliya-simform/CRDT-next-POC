"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
import { paddockPresenceVar } from "@/components/paddock/paddock-presence";
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

    const assignee = task.assignee?.user
        ? {
              id: task.assignee.user.id,
              name:
                  task.assignee.user.name ??
                  task.assignee.user.email ??
                  "Member",
              image: task.assignee.user.image,
          }
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
                // Keys on the priority button inside belong to it.
                if (isDragging || e.target !== e.currentTarget) return;
                // Enter opens the task. Space picks it up through the
                // keyboard sensor; on a card that cannot move, it opens it.
                if (e.key === "Enter" || (e.key === " " && !listeners)) {
                    e.preventDefault();
                    onOpenDetail?.(task);
                    return;
                }
                listeners?.onKeyDown?.(e);
            }}
            className={cn(
                // Flat at rest on a rule. Only the card genuinely floating
                // under the cursor mid-drag is raised.
                "group relative flex flex-col gap-1.5 overflow-hidden rounded-[10px] border border-paddock-rule bg-paddock-sheet py-3.5 pr-4 pl-5.5 select-none",
                canEdit
                    ? "paddock-lift cursor-grab active:cursor-grabbing"
                    : "paddock-lift cursor-pointer",
                isOverlay &&
                    "z-50 rotate-1 cursor-grabbing border-paddock-ink shadow-paddock-float",
            )}
        >
            {/* Whose task this is, readable before the title. An unassigned
                card keeps a neutral rail rather than borrowing a hue. */}
            <span
                aria-hidden="true"
                className={cn(
                    "absolute inset-y-0 left-0 w-1.5",
                    !assignee && "bg-paddock-rule",
                )}
                style={
                    assignee
                        ? { backgroundColor: paddockPresenceVar(assignee.id) }
                        : undefined
                }
            />

            <h3 className="m-0 line-clamp-2 text-[0.96875rem] leading-[1.35] font-bold decoration-[1.5px] underline-offset-[3px] group-hover:underline">
                {task.title}
            </h3>

            {task.description && (
                <p className="m-0 line-clamp-2 text-[0.84375rem] leading-[1.45] text-paddock-subtle">
                    {task.description}
                </p>
            )}

            {/* Who, then how urgent, then when — the order someone triaging a
                board actually reads them in. */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.78125rem]">
                <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                    {assignee ? (
                        <PaddockAvatar person={assignee} size="xs" decorative />
                    ) : null}
                    <span className="max-w-[16ch] truncate">
                        {assignee?.name ?? "Unassigned"}
                    </span>
                </span>
                <span aria-hidden="true" className="text-paddock-subtle">
                    ·
                </span>
                <PriorityBadge
                    taskId={task.id}
                    priority={task.priority}
                    canEdit={canEdit}
                />
                {formattedDueDate && (
                    <>
                        <span
                            aria-hidden="true"
                            className="text-paddock-subtle"
                        >
                            ·
                        </span>
                        <time
                            suppressHydrationWarning
                            className={cn(
                                "paddock-mono text-xs",
                                isPastDue
                                    ? "font-semibold text-paddock-danger"
                                    : "text-paddock-subtle",
                            )}
                            title={isPastDue ? "Overdue" : "Due"}
                        >
                            {isPastDue ? "Overdue " : "Due "}
                            {formattedDueDate}
                        </time>
                    </>
                )}
            </div>
        </article>
    );
}
