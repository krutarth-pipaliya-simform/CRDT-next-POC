"use client";

import { startTransition, useId, useRef, useState } from "react";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MeasuringStrategy,
    PointerSensor,
    useSensor,
    useSensors,
    type Announcements,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { TaskStatus } from "@prisma/client";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { NotchedCard } from "@/components/paddock/notched-card";
import { PaddockButton } from "@/components/paddock/paddock-button";
import { paddockFieldClasses } from "@/components/paddock/paddock-styles";
import { Tag } from "@/components/paddock/tag";
import { cn } from "@/lib/cn";

import { moveTaskAction } from "../actions/move-task";
import {
    boardKeyboardCoordinates,
    columnItemsFrom,
    columnOverlapCollision,
    findColumn,
    positionBetween,
    type ColumnItems,
} from "../lib/board-dnd";
import type { TaskWithAssignee } from "../types";
import { COLUMN_ORDER, TASK_STATUS_LABELS } from "../types";
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

const SCREEN_READER_INSTRUCTIONS = {
    draggable:
        "Press Space to pick up the task. Use the arrow keys to move it, then press Space or Enter to drop it, or Escape to cancel. Press Enter to open the task.",
};

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
    // While a card is dragged the columns render from this, so the card's
    // ghost sits where it will land, in whichever column that is.
    const [dragItems, setDragItems] = useState<ColumnItems | null>(null);
    const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
    const dragStartItemsRef = useRef<ColumnItems | null>(null);
    // dnd-kit numbers its describedby ids with a module counter, which differs
    // between the server render and hydration unless given a stable id.
    const dndContextId = useId();
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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: boardKeyboardCoordinates,
            // Enter opens the task, so only Space picks a card up.
            keyboardCodes: {
                start: ["Space"],
                cancel: ["Escape"],
                end: ["Space", "Enter", "Tab"],
            },
        }),
    );

    function resetDrag() {
        setActiveTask(null);
        setDragItems(null);
        setOverColumn(null);
        dragStartItemsRef.current = null;
    }

    function handleDragStart(event: DragStartEvent) {
        if (!canEdit) return;
        const task = tasks.find((t) => t.id === event.active.id);
        if (!task) return;
        const items = columnItemsFrom(filteredTasks);
        dragStartItemsRef.current = items;
        setDragItems(items);
        setOverColumn(task.status);
        setActiveTask(task);
    }

    // Moving into another column happens here, mid-drag, so the target
    // column opens a gap for the card. Reordering within a column is left to
    // the sortable strategy.
    function handleDragOver({ active, over }: DragOverEvent) {
        if (!dragItems) return;
        setOverColumn(over ? findColumn(dragItems, over.id) : null);
        if (!over) return;

        setDragItems((items) => {
            if (!items) return items;
            const activeId = String(active.id);
            const overId = String(over.id);
            const from = findColumn(items, activeId);
            const to = findColumn(items, overId);
            if (!from || !to || from === to) return items;

            const target = items[to];
            const overIndex = target.indexOf(overId);
            let index = target.length;
            if (overIndex !== -1) {
                const dragged = active.rect.current.translated;
                const isBelow =
                    dragged !== null &&
                    dragged.top + dragged.height / 2 >
                        over.rect.top + over.rect.height / 2;
                index = overIndex + (isBelow ? 1 : 0);
            }

            return {
                ...items,
                [from]: items[from].filter((id) => id !== activeId),
                [to]: [
                    ...target.slice(0, index),
                    activeId,
                    ...target.slice(index),
                ],
            };
        });
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        const items = dragItems;
        const startItems = dragStartItemsRef.current;
        const activeId = String(active.id);
        const task = tasks.find((t) => t.id === activeId);

        if (!over || !canEdit || !items || !startItems || !task) {
            resetDrag();
            return;
        }

        const column = findColumn(items, activeId);
        if (!column) {
            resetDrag();
            return;
        }

        // The same arithmetic the sortable strategy previews with, so the
        // card lands exactly where its ghost was shown.
        let ids = items[column];
        const overId = String(over.id);
        if (overId !== activeId && ids.includes(overId)) {
            ids = arrayMove(ids, ids.indexOf(activeId), ids.indexOf(overId));
        }

        const startColumn = findColumn(startItems, activeId);
        const unchanged =
            column === startColumn &&
            ids.length === startItems[column].length &&
            ids.every((id, i) => id === startItems[column][i]);
        if (unchanged) {
            resetDrag();
            return;
        }

        const index = ids.indexOf(activeId);
        const positionOf = (id: string | undefined) =>
            tasks.find((t) => t.id === id)?.position;
        const position = positionBetween(
            positionOf(ids[index - 1]),
            positionOf(ids[index + 1]),
        );
        const previous = { status: task.status, position: task.position };

        setTasks((prev) =>
            prev.map((t) =>
                t.id === activeId ? { ...t, status: column, position } : t,
            ),
        );
        resetDrag();

        startTransition(async () => {
            const result = await moveTaskAction({
                taskId: activeId,
                status: column,
                position,
            });
            if (!result.success) {
                // Put the card back rather than leave the board lying.
                setTasks((prev) =>
                    prev.map((t) =>
                        t.id === activeId ? { ...t, ...previous } : t,
                    ),
                );
                toast.error(result.error);
            }
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
        ? tasks.filter(
              (t) =>
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.description
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                  t.assignee?.user.name
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
          )
        : tasks;

    const columns = dragItems ?? columnItemsFrom(filteredTasks);
    const taskById = new Map(tasks.map((t) => [t.id, t]));

    const titleOf = (id: UniqueIdentifier) =>
        taskById.get(String(id))?.title ?? "The task";
    const placeOf = (id: UniqueIdentifier) => {
        const column = findColumn(columns, id);
        const label = column ? TASK_STATUS_LABELS[column] : "the board";
        return taskById.has(String(id)) ? `${titleOf(id)} in ${label}` : label;
    };

    // Spoken by dnd-kit's live region: task titles and column names, never
    // raw ids.
    const announcements: Announcements = {
        onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}.`,
        onDragOver: ({ active, over }) =>
            over
                ? `${titleOf(active.id)} is over ${placeOf(over.id)}.`
                : `${titleOf(active.id)} is no longer over a column.`,
        onDragEnd: ({ active, over }) =>
            over
                ? `${titleOf(active.id)} was dropped in ${placeOf(over.id)}.`
                : `${titleOf(active.id)} was dropped outside the board and stays where it was.`,
        onDragCancel: ({ active }) =>
            `Moving ${titleOf(active.id)} was cancelled. It stays where it was.`,
    };

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
                    id={dndContextId}
                    sensors={sensors}
                    collisionDetection={columnOverlapCollision}
                    measuring={{
                        droppable: { strategy: MeasuringStrategy.Always },
                    }}
                    accessibility={{
                        announcements,
                        screenReaderInstructions: SCREEN_READER_INSTRUCTIONS,
                    }}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragCancel={resetDrag}
                >
                    <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:mx-0 sm:px-0">
                        <div className="grid grid-cols-[repeat(5,minmax(17rem,1fr))] items-start gap-4">
                            {COLUMN_ORDER.map((status) => {
                                const colTasks = columns[status].flatMap(
                                    (id) => {
                                        const task = taskById.get(id);
                                        return task ? [task] : [];
                                    },
                                );

                                return (
                                    <KanbanColumn
                                        key={status}
                                        status={status}
                                        tasks={colTasks}
                                        canEdit={canEdit}
                                        isDropTarget={
                                            activeTask !== null &&
                                            overColumn === status
                                        }
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
