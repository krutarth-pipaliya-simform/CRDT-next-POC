"use client";

import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { TaskStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
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

const columnBgStyles: Record<TaskStatus, string> = {
    TODO: "bg-brand-column-todo",
    IN_PROGRESS: "bg-brand-column-progress",
    DONE: "bg-brand-column-done",
};

const columnAccentBar: Record<TaskStatus, string> = {
    TODO: "bg-brand-subtle",
    IN_PROGRESS: "bg-brand-accent",
    DONE: "bg-brand-success",
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
                "flex flex-col border-2 border-brand-ink rounded-brand shadow-brand-subtle min-h-[480px] transition-all",
                columnBgStyles[status],
                isOver && "ring-2 ring-brand-accent ring-offset-2",
            )}
        >
            {/* Top Accent Stripe */}
            <div className={cn("h-1.5 w-full", columnAccentBar[status])} />

            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-brand-ink bg-brand-surface/70">
                <div className="flex items-center gap-2">
                    <h2
                        id={`col-heading-${status}`}
                        className="font-brand-sans font-bold text-sm text-brand-ink uppercase tracking-wider"
                    >
                        {TASK_STATUS_LABELS[status]}
                    </h2>
                    <Badge intent="muted" className="text-[11px] px-1.5 py-0.5">
                        {tasks.length}
                    </Badge>
                </div>

                {canEdit && onAddTask && (
                    <button
                        type="button"
                        onClick={() => onAddTask(status)}
                        aria-label={`Add new task to ${TASK_STATUS_LABELS[status]}`}
                        className="text-brand-subtle hover:text-brand-ink hover:bg-brand-muted p-1 rounded-brand text-xs font-brand-mono font-bold transition-colors cursor-pointer"
                        title="Add task"
                    >
                        +
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
                            "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-brand-border rounded-brand p-6 text-center text-xs font-brand-mono text-brand-subtle/70 min-h-[140px]",
                            isOver &&
                                "border-brand-accent bg-brand-accent/5 text-brand-accent",
                        )}
                    >
                        <span>No tasks</span>
                        {canEdit && (
                            <span className="text-[10px] mt-1 text-brand-subtle/50">
                                Drag cards here
                            </span>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
