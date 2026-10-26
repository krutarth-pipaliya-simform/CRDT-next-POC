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
import { Plus, Search, X } from "lucide-react";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { NotchedCard } from "@/components/paddock/notched-card";
import { PaddockButton } from "@/components/paddock/paddock-button";
import { paddockFieldClasses } from "@/components/paddock/paddock-styles";
import { Tag } from "@/components/paddock/tag";
import { cn } from "@/lib/cn";
import { taskStatusSchema } from "@/schemas/task";

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
    /** Small label above the hero title, e.g. "Halden Studio — Tasks". */
    eyebrow?: string;
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
    eyebrow,
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

        // A column's droppable id is its status; anything else is a task id.
        const overColumn = taskStatusSchema.safeParse(overId);

        // Determine destination status
        let destinationStatus: TaskStatus;
        if (overColumn.success) {
            destinationStatus = overColumn.data;
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
        } else if (overColumn.success) {
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

    const toolbar = (
        <>
            <div className="relative w-[17.5rem] max-w-full">
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-paddock-subtle"
                    strokeWidth={2}
                />
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks"
                    aria-label="Filter tasks"
                    className={cn(
                        paddockFieldClasses,
                        "h-13 pr-12 pl-10.5 [&::-webkit-search-cancel-button]:appearance-none",
                    )}
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search query"
                        className="absolute top-1/2 right-1 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-paddock text-paddock-ink transition-colors hover:bg-paddock-ink/8"
                    >
                        <X
                            aria-hidden="true"
                            className="size-4"
                            strokeWidth={2.4}
                        />
                    </button>
                )}
            </div>

            {canEdit && (
                <PaddockButton
                    variant="primary"
                    onClick={() => handleAddTask("TODO")}
                    className="h-13 px-5.5"
                >
                    <Plus
                        aria-hidden="true"
                        className="size-5"
                        strokeWidth={2.6}
                    />
                    New task
                </PaddockButton>
            )}
        </>
    );

    return (
        <>
            <PageHeader
                eyebrow={eyebrow}
                serif="The"
                heavy="Board"
                description="Drag a card to move it. Everyone on the board sees the move as it happens."
                action={toolbar}
            />

            <div className={cn(PAGE_CONTAINER, "flex flex-col gap-6")}>
                {/* Empty board: said once, above the columns, where it is seen */}
                {initialTasks.length === 0 && (
                    <NotchedCard tone="sheet">
                        <div className="flex flex-wrap items-end justify-between gap-5">
                            <div className="max-w-[52ch]">
                                <Tag as="p" className="mb-2">
                                    Empty board
                                </Tag>
                                <p className="paddock-heavy m-0 text-[1.375rem] leading-none">
                                    No tasks on the board yet
                                </p>
                                <p className="m-0 mt-3 text-paddock-subtle">
                                    Create your first task to start organising
                                    deliverables, priorities and workflow
                                    stages.
                                </p>
                            </div>
                            {canEdit ? (
                                <PaddockButton
                                    variant="outline"
                                    voice="plain"
                                    size="sm"
                                    onClick={() => handleAddTask("TODO")}
                                >
                                    Create the first task
                                </PaddockButton>
                            ) : null}
                        </div>
                    </NotchedCard>
                )}

                {/* Kanban columns. The board scrolls sideways inside its own
                    box on a narrow screen, never the page. */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:mx-0 sm:px-0">
                        <div className="grid grid-cols-[repeat(3,minmax(17rem,1fr))] items-start gap-4">
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
                                        onAddTask={
                                            canEdit ? handleAddTask : undefined
                                        }
                                    />
                                );
                            })}
                        </div>
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
            </div>

            {/* Modals. Keyed on the column so "+" on a column opens the form
                already set to that column. */}
            <CreateTaskDialog
                key={createDefaultStatus}
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
        </>
    );
}
