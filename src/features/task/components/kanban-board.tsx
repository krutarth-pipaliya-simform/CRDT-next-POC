"use client";

import { startTransition, useOptimistic, useState } from "react";
import {
    closestCorners,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import type { TaskStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { moveTaskAction } from "../actions/move-task";
import type { TaskWithAssignee } from "../types";
import { COLUMN_ORDER } from "../types";
import type { MemberOption } from "./assignee-picker";
import { CreateTaskDialog } from "./create-task-dialog";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { TaskDetailDialog } from "./task-detail-dialog";

export interface KanbanBoardProps {
    initialTasks: TaskWithAssignee[];
    workspaceId: string;
    members: MemberOption[];
    canEdit?: boolean;
}

interface MoveAction {
    taskId: string;
    status: TaskStatus;
    position: number;
}

export function KanbanBoard({
    initialTasks,
    workspaceId,
    members,
    canEdit = false,
}: KanbanBoardProps) {
    const [tasks, setTasks] = useState<TaskWithAssignee[]>(initialTasks);
    const [prevInitial, setPrevInitial] =
        useState<TaskWithAssignee[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<TaskWithAssignee | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(
        null,
    );
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createDefaultStatus, setCreateDefaultStatus] =
        useState<TaskStatus>("TODO");
    const [searchQuery, setSearchQuery] = useState("");

    // Keep internal tasks in sync whenever initialTasks prop changes from server revalidation
    if (initialTasks !== prevInitial) {
        setPrevInitial(initialTasks);
        setTasks(initialTasks);
    }

    // Optimistic tasks state for immediate UI feedback on drag
    const [optimisticTasks, moveOptimisticTask] = useOptimistic(
        tasks,
        (currentTasks: TaskWithAssignee[], action: MoveAction) =>
            currentTasks.map((t) =>
                t.id === action.taskId
                    ? { ...t, status: action.status, position: action.position }
                    : t,
            ),
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    function handleDragStart(event: DragStartEvent) {
        if (!canEdit) return;
        const task = optimisticTasks.find((t) => t.id === event.active.id);
        if (task) {
            setActiveTask(task);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTask(null);

        if (!over || !canEdit) return;

        const activeTaskId = String(active.id);
        const overId = String(over.id);

        const activeTaskItem = optimisticTasks.find(
            (t) => t.id === activeTaskId,
        );
        if (!activeTaskItem) return;

        // Determine destination status
        let destinationStatus: TaskStatus;
        if (COLUMN_ORDER.includes(overId as TaskStatus)) {
            destinationStatus = overId as TaskStatus;
        } else {
            const overTask = optimisticTasks.find((t) => t.id === overId);
            if (!overTask) return;
            destinationStatus = overTask.status;
        }

        // Get sorted tasks in destination column (excluding the active task)
        const destTasks = optimisticTasks
            .filter(
                (t) => t.status === destinationStatus && t.id !== activeTaskId,
            )
            .sort((a, b) => a.position - b.position);

        let newPosition: number;

        if (destTasks.length === 0) {
            newPosition = 1024;
        } else if (COLUMN_ORDER.includes(overId as TaskStatus)) {
            // Dropped onto the column container -> append to end
            const lastTask = destTasks[destTasks.length - 1];
            newPosition = (lastTask?.position ?? 0) + 1024;
        } else {
            // Dropped over a specific task in the column
            const overIndex = destTasks.findIndex((t) => t.id === overId);
            if (overIndex === -1) {
                const lastTask = destTasks[destTasks.length - 1];
                newPosition = (lastTask?.position ?? 0) + 1024;
            } else if (overIndex === 0) {
                // Before the first task
                const firstPos = destTasks[0].position;
                newPosition = firstPos > 1 ? firstPos / 2 : firstPos - 1024;
            } else {
                // Between overIndex - 1 and overIndex
                const prevPos = destTasks[overIndex - 1].position;
                const nextPos = destTasks[overIndex].position;
                newPosition = (prevPos + nextPos) / 2;
            }
        }

        // Apply optimistic update immediately
        startTransition(async () => {
            moveOptimisticTask({
                taskId: activeTaskId,
                status: destinationStatus,
                position: newPosition,
            });

            // Update local state
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === activeTaskId
                        ? {
                              ...t,
                              status: destinationStatus,
                              position: newPosition,
                          }
                        : t,
                ),
            );

            await moveTaskAction({
                taskId: activeTaskId,
                status: destinationStatus,
                position: newPosition,
            });
        });
    }

    function handleAddTask(status: TaskStatus) {
        setCreateDefaultStatus(status);
        setIsCreateOpen(true);
    }

    function handleTaskCreated(newTask: TaskWithAssignee) {
        setTasks((prev) => [newTask, ...prev]);
    }

    function handleTaskUpdated(updatedTask: TaskWithAssignee) {
        setTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
        );
    }

    function handleTaskDeleted(taskId: string) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }

    // Filter tasks by search query if any
    const filteredTasks = searchQuery.trim()
        ? optimisticTasks.filter(
              (t) =>
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.description
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                  t.assignee?.user.name
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
          )
        : optimisticTasks;

    return (
        <div className="flex flex-col gap-6">
            {/* Top Toolbar: Search and New Task action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks by title, description, or assignee..."
                        aria-label="Filter tasks"
                        className="w-full bg-brand-surface text-brand-ink placeholder:text-brand-subtle text-xs border-2 border-brand-ink rounded-brand px-3 py-2 font-brand-sans focus:outline-none focus:ring-2 focus:ring-brand-accent transition-colors"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            aria-label="Clear search query"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-brand-subtle hover:text-brand-ink p-1 cursor-pointer"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {canEdit && (
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddTask("TODO")}
                        className="shrink-0"
                    >
                        + New Task
                    </Button>
                )}
            </div>

            {/* Kanban Columns */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {COLUMN_ORDER.map((status) => {
                        const colTasks = filteredTasks
                            .filter((t) => t.status === status)
                            .sort((a, b) => a.position - b.position);

                        return (
                            <KanbanColumn
                                key={status}
                                status={status}
                                tasks={colTasks}
                                canEdit={canEdit}
                                onOpenDetail={setSelectedTask}
                                onAddTask={canEdit ? handleAddTask : undefined}
                            />
                        );
                    })}
                </div>

                {/* Drag Overlay Clone */}
                <DragOverlay>
                    {activeTask ? (
                        <TaskCard
                            task={activeTask}
                            canEdit={canEdit}
                            isOverlay
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Empty State when no tasks match */}
            {initialTasks.length === 0 && (
                <EmptyState
                    title="No tasks on the board yet"
                    description="Create your first task to start organizing deliverables, priorities, and workflow stages."
                    action={
                        canEdit ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAddTask("TODO")}
                            >
                                + Create First Task
                            </Button>
                        ) : undefined
                    }
                />
            )}

            {/* Modals */}
            <CreateTaskDialog
                workspaceId={workspaceId}
                members={members}
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                defaultStatus={createDefaultStatus}
                onTaskCreated={handleTaskCreated}
            />

            <TaskDetailDialog
                task={selectedTask}
                members={members}
                open={selectedTask !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedTask(null);
                }}
                canEdit={canEdit}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
            />
        </div>
    );
}
