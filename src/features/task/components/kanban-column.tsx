"use client";

import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Plus } from "lucide-react";

import type { TaskStatus } from "@prisma/client";

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
 * Columns are told apart by their heading and their position, not by a tinted
 * ground and a coloured stripe. Three saturated bars across the top of the
 * board competed with the one thing colour is for here: whose card it is.
 */
const columnBgStyles: Record<TaskStatus, string> = {
    TODO: "bg-brand-column-todo",
    IN_PROGRESS: "bg-brand-column-progress",
    DONE: "bg-brand-column-done",
};

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
                "flex flex-col border border-brand-border rounded-brand min-h-[480px] transition-colors",
                columnBgStyles[status],
                isOver && "border-brand-ink",
            )}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
                <div className="flex items-baseline gap-2">
                    <h2
                        id={`col-heading-${status}`}
                        className="font-semibold text-sm text-brand-ink"
                    >
                        {TASK_STATUS_LABELS[status]}
                    </h2>
                    <span className="text-[13px] text-brand-subtle tabular-nums">
                        {tasks.length}
                    </span>
                </div>

                {canEdit && onAddTask && (
                    <button
                        type="button"
                        onClick={() => onAddTask(status)}
                        aria-label={`Add a task to ${TASK_STATUS_LABELS[status]}`}
                        className="text-brand-subtle hover:text-brand-ink hover:bg-brand-muted w-6 h-6 grid place-items-center rounded-brand transition-colors cursor-pointer"
                        title="Add a task"
                    >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                )}
            </div>

            {/* Task Cards List */}
            <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
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
                            "flex-1 flex flex-col items-center justify-center border border-dashed border-brand-border rounded-brand p-6 text-center text-[13px] text-brand-subtle min-h-[140px] transition-colors",
                            isOver && "border-brand-ink text-brand-ink",
                        )}
                    >
                        <span>Nothing here yet</span>
                        {canEdit && (
                            <span className="mt-0.5 text-brand-subtle">
                                Drop a card, or add one above
                            </span>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
