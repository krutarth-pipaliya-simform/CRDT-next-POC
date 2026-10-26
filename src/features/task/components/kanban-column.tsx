"use client";

import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TaskStatus } from "@prisma/client";
import { Plus } from "lucide-react";

import { PaddockIconButton } from "@/components/paddock/paddock-button";
import { cn } from "@/lib/cn";

import type { TaskWithAssignee } from "../types";
import { TASK_STATUS_LABELS } from "../types";
import { TaskCard } from "./task-card";

export interface KanbanColumnProps {
    status: TaskStatus;
    tasks: TaskWithAssignee[];
    canEdit?: boolean;
    onOpenDetail?: (task: TaskWithAssignee) => void;
    onAddTask?: (status: TaskStatus) => void;
}

/**
 * A column is a faint ink well, told apart by its heading and its place on the
 * board — never by a hue. Colour on the board belongs to whoever owns a card.
 */
export function KanbanColumn({
    status,
    tasks,
    canEdit = false,
    onOpenDetail,
    onAddTask,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    const taskIds = tasks.map((t) => t.id);

    return (
        <section
            ref={setNodeRef}
            aria-label={TASK_STATUS_LABELS[status]}
            data-testid={`kanban-column-${status}`}
            className={cn(
                "flex min-h-[32.5rem] flex-col gap-2.5 rounded-[14px] bg-paddock-ink/5 p-3.5 transition-shadow",
                isOver && "ring-[1.5px] ring-paddock-ink ring-inset",
            )}
        >
            <header className="flex items-center justify-between gap-3 px-1 pt-0.5 pb-1.5">
                <h2
                    id={`col-heading-${status}`}
                    className="m-0 flex items-baseline gap-2.5"
                >
                    <span className="paddock-heavy text-[1.375rem] leading-none">
                        {TASK_STATUS_LABELS[status]}
                    </span>
                    <span className="paddock-mono text-[0.8125rem] text-paddock-subtle">
                        {tasks.length}
                    </span>
                </h2>

                {canEdit && onAddTask && (
                    <PaddockIconButton
                        label={`Add a task to ${TASK_STATUS_LABELS[status]}`}
                        title="Add a task"
                        size="sm"
                        icon={<Plus className="size-5" strokeWidth={2.4} />}
                        onClick={() => onAddTask(status)}
                        className="hover:bg-paddock-inverse hover:text-paddock-on-inverse"
                    />
                )}
            </header>

            <SortableContext
                items={taskIds}
                strategy={verticalListSortingStrategy}
            >
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        canEdit={canEdit}
                        onOpenDetail={onOpenDetail}
                    />
                ))}
            </SortableContext>

            {tasks.length === 0 && (
                <div
                    className={cn(
                        "rounded-[10px] border-[1.5px] border-dashed border-paddock-rule px-4 py-7 text-center transition-colors",
                        isOver && "border-paddock-ink",
                    )}
                >
                    <p className="m-0 font-bold">Nothing here yet</p>
                    {canEdit && (
                        <p className="m-0 mt-1 text-[0.8125rem] text-paddock-subtle">
                            Drop a card, or add one above
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}
