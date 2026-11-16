"use client";

import { startTransition, useId, useMemo } from "react";
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
} from "../lib/board-dnd";
import { filterTasks } from "../stores/board-store";
import {
    BoardStoreProvider,
    useBoardStore,
    useBoardStoreApi,
} from "../stores/board-store-provider";
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

export function KanbanBoard(props: KanbanBoardProps) {
    return (
        <BoardStoreProvider initialTasks={props.initialTasks}>
            <BoardView {...props} />
        </BoardStoreProvider>
    );
}

interface BoardToolbarProps {
    canEdit: boolean;
}

/** The search box and "New task" button; re-renders on the query alone. */
function BoardToolbar({ canEdit }: BoardToolbarProps) {
    const searchQuery = useBoardStore((s) => s.searchQuery);
    const setSearchQuery = useBoardStore((s) => s.setSearchQuery);
    const openCreate = useBoardStore((s) => s.openCreate);

    return (
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
                    onClick={() => openCreate("TODO")}
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
}

interface BoardDialogsProps {
    workspaceId: string;
    members: MemberOption[];
    canEdit: boolean;
}

/** The create and detail dialogs, driven by the store rather than by props. */
function BoardDialogs({ workspaceId, members, canEdit }: BoardDialogsProps) {
    const isCreateOpen = useBoardStore((s) => s.isCreateOpen);
    const createDefaultStatus = useBoardStore((s) => s.createDefaultStatus);
    const selectedTask = useBoardStore((s) => s.selectedTask);
    const addTask = useBoardStore((s) => s.addTask);
    const updateTask = useBoardStore((s) => s.updateTask);
    const removeTask = useBoardStore((s) => s.removeTask);
    const closeCreate = useBoardStore((s) => s.closeCreate);
    const closeTask = useBoardStore((s) => s.closeTask);

    // Keyed on the column so "+" on a column opens the form already set to
    // that column.
    return (
        <>
            <CreateTaskDialog
                key={createDefaultStatus}
                workspaceId={workspaceId}
                members={members}
                open={isCreateOpen}
                onOpenChange={(open) => {
                    if (!open) closeCreate();
                }}
                defaultStatus={createDefaultStatus}
                onTaskCreated={addTask}
            />

            <TaskDetailDialog
                task={selectedTask}
                members={members}
                open={selectedTask !== null}
                onOpenChange={(open) => {
                    if (!open) closeTask();
                }}
                canEdit={canEdit}
                onTaskUpdated={updateTask}
                onTaskDeleted={removeTask}
            />
        </>
    );
}

function BoardView({
    initialTasks,
    workspaceId,
    members,
    canEdit = false,
    eyebrow,
}: KanbanBoardProps) {
    const store = useBoardStoreApi();
    const tasks = useBoardStore((s) => s.tasks);
    const searchQuery = useBoardStore((s) => s.searchQuery);
    const activeTask = useBoardStore((s) => s.activeTask);
    const dragItems = useBoardStore((s) => s.dragItems);
    const overColumn = useBoardStore((s) => s.overColumn);
    const openTask = useBoardStore((s) => s.openTask);
    const openCreate = useBoardStore((s) => s.openCreate);
    // dnd-kit numbers its describedby ids with a module counter, which differs
    // between the server render and hydration unless given a stable id.
    const dndContextId = useId();

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

    const filteredTasks = useMemo(
        () => filterTasks(tasks, searchQuery),
        [tasks, searchQuery],
    );

    function handleDragStart(event: DragStartEvent) {
        if (!canEdit) return;
        const { tasks: current, startDrag } = store.getState();
        const task = current.find((t) => t.id === event.active.id);
        if (!task) return;
        startDrag(task, columnItemsFrom(filteredTasks));
    }

    // Moving into another column happens here, mid-drag, so the target
    // column opens a gap for the card. Reordering within a column is left to
    // the sortable strategy.
    function handleDragOver({ active, over }: DragOverEvent) {
        const state = store.getState();
        if (!state.dragItems) return;
        state.setOverColumn(over ? findColumn(state.dragItems, over.id) : null);
        if (!over) return;

        const dragged = active.rect.current.translated;
        const isBelow =
            dragged !== null &&
            dragged.top + dragged.height / 2 >
                over.rect.top + over.rect.height / 2;
        state.previewDragOver(String(active.id), String(over.id), isBelow);
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        const state = store.getState();
        const { resetDrag } = state;
        const items = state.dragItems;
        const startItems = state.dragStartItems;
        const activeId = String(active.id);
        const task = state.tasks.find((t) => t.id === activeId);

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
            state.tasks.find((t) => t.id === id)?.position;
        const position = positionBetween(
            positionOf(ids[index - 1]),
            positionOf(ids[index + 1]),
        );

        const previous = state.placeTask(activeId, column, position);
        resetDrag();

        startTransition(async () => {
            const result = await moveTaskAction({
                taskId: activeId,
                status: column,
                position,
            });
            if (!result.success) {
                // Put the card back rather than leave the board lying.
                if (previous) {
                    store.getState().restorePlacement(activeId, previous);
                }
                toast.error(result.error);
            }
        });
    }

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

    return (
        <>
            <PageHeader
                eyebrow={eyebrow}
                serif="The"
                heavy="Board"
                description="Drag a card to move it. Everyone on the board sees the move as it happens."
                action={<BoardToolbar canEdit={canEdit} />}
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
                                    onClick={() => openCreate("TODO")}
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
                    onDragCancel={() => store.getState().resetDrag()}
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
                                        onOpenDetail={openTask}
                                        onAddTask={
                                            canEdit ? openCreate : undefined
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

            <BoardDialogs
                workspaceId={workspaceId}
                members={members}
                canEdit={canEdit}
            />
        </>
    );
}
