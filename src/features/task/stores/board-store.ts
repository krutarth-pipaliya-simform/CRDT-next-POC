import type { TaskStatus } from "@prisma/client";
import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

import { findColumn, type ColumnItems } from "../lib/board-dnd";
import type { TaskWithAssignee } from "../types";

/** Where a card sat, kept so a failed move can put it back. */
export interface TaskPlacement {
    status: TaskStatus;
    position: number;
}

export interface BoardState {
    /** The optimistic board. Seeded from the server; never a cache of it. */
    tasks: TaskWithAssignee[];
    searchQuery: string;
    /** The task open in the detail dialog, if any. */
    selectedTask: TaskWithAssignee | null;
    isCreateOpen: boolean;
    createDefaultStatus: TaskStatus;
    /** The card being dragged. */
    activeTask: TaskWithAssignee | null;
    /** While a card is dragged the columns render from this. */
    dragItems: ColumnItems | null;
    /** The column the dragged card would land in. */
    overColumn: TaskStatus | null;
    /** Where every card sat when the drag began; a drag ending here writes nothing. */
    dragStartItems: ColumnItems | null;
}

export interface BoardActions {
    /** Replace the board with fresh server data (after a revalidation). */
    syncTasks: (tasks: TaskWithAssignee[]) => void;
    addTask: (task: TaskWithAssignee) => void;
    updateTask: (task: TaskWithAssignee) => void;
    removeTask: (taskId: string) => void;
    /** Optimistically move a card; returns where it was, for `restorePlacement`. */
    placeTask: (
        taskId: string,
        status: TaskStatus,
        position: number,
    ) => TaskPlacement | null;
    restorePlacement: (taskId: string, placement: TaskPlacement) => void;
    setSearchQuery: (query: string) => void;
    openTask: (task: TaskWithAssignee) => void;
    closeTask: () => void;
    openCreate: (status: TaskStatus) => void;
    closeCreate: () => void;
    startDrag: (task: TaskWithAssignee, items: ColumnItems) => void;
    /**
     * Move the ghost into the column under the pointer. `isBelow` says the
     * dragged card's centre is below the centre of the card it is over.
     */
    previewDragOver: (
        activeId: string,
        overId: string,
        isBelow: boolean,
    ) => void;
    setOverColumn: (column: TaskStatus | null) => void;
    resetDrag: () => void;
}

export type BoardStore = BoardState & BoardActions;

const IDLE_DRAG = {
    activeTask: null,
    dragItems: null,
    overColumn: null,
    dragStartItems: null,
} satisfies Partial<BoardState>;

/** Tasks matching the search box by title, description or assignee name. */
export function filterTasks(
    tasks: TaskWithAssignee[],
    query: string,
): TaskWithAssignee[] {
    if (!query.trim()) return tasks;
    const needle = query.toLowerCase();
    return tasks.filter(
        (t) =>
            t.title.toLowerCase().includes(needle) ||
            t.description?.toLowerCase().includes(needle) ||
            t.assignee?.user.name?.toLowerCase().includes(needle),
    );
}

/**
 * One board store per mounted board, created from the server-rendered tasks
 * (see `BoardStoreProvider`). Never a module singleton: on the server that
 * would share one board between requests.
 */
export function createBoardStore(initialTasks: TaskWithAssignee[]) {
    return createStore<BoardStore>()(
        devtools(
            (set, get) => ({
                tasks: initialTasks,
                searchQuery: "",
                selectedTask: null,
                isCreateOpen: false,
                createDefaultStatus: "TODO",
                ...IDLE_DRAG,

                syncTasks: (tasks) => set({ tasks }, undefined, "syncTasks"),
                addTask: (task) =>
                    set(
                        (s) => ({ tasks: [task, ...s.tasks] }),
                        undefined,
                        "addTask",
                    ),
                updateTask: (task) =>
                    set(
                        (s) => ({
                            tasks: s.tasks.map((t) =>
                                t.id === task.id ? task : t,
                            ),
                        }),
                        undefined,
                        "updateTask",
                    ),
                removeTask: (taskId) =>
                    set(
                        (s) => ({
                            tasks: s.tasks.filter((t) => t.id !== taskId),
                        }),
                        undefined,
                        "removeTask",
                    ),
                placeTask: (taskId, status, position) => {
                    const task = get().tasks.find((t) => t.id === taskId);
                    if (!task) return null;
                    const previous = {
                        status: task.status,
                        position: task.position,
                    };
                    set(
                        (s) => ({
                            tasks: s.tasks.map((t) =>
                                t.id === taskId
                                    ? { ...t, status, position }
                                    : t,
                            ),
                        }),
                        undefined,
                        "placeTask",
                    );
                    return previous;
                },
                restorePlacement: (taskId, placement) =>
                    set(
                        (s) => ({
                            tasks: s.tasks.map((t) =>
                                t.id === taskId ? { ...t, ...placement } : t,
                            ),
                        }),
                        undefined,
                        "restorePlacement",
                    ),

                setSearchQuery: (searchQuery) =>
                    set({ searchQuery }, undefined, "setSearchQuery"),
                openTask: (selectedTask) =>
                    set({ selectedTask }, undefined, "openTask"),
                closeTask: () =>
                    set({ selectedTask: null }, undefined, "closeTask"),
                openCreate: (createDefaultStatus) =>
                    set(
                        { createDefaultStatus, isCreateOpen: true },
                        undefined,
                        "openCreate",
                    ),
                closeCreate: () =>
                    set({ isCreateOpen: false }, undefined, "closeCreate"),

                startDrag: (task, items) =>
                    set(
                        {
                            activeTask: task,
                            dragItems: items,
                            dragStartItems: items,
                            overColumn: task.status,
                        },
                        undefined,
                        "startDrag",
                    ),
                previewDragOver: (activeId, overId, isBelow) =>
                    set(
                        (s) => {
                            const items = s.dragItems;
                            if (!items) return s;
                            const from = findColumn(items, activeId);
                            const to = findColumn(items, overId);
                            if (!from || !to || from === to) return s;

                            const target = items[to];
                            const overIndex = target.indexOf(overId);
                            const index =
                                overIndex === -1
                                    ? target.length
                                    : overIndex + (isBelow ? 1 : 0);

                            return {
                                dragItems: {
                                    ...items,
                                    [from]: items[from].filter(
                                        (id) => id !== activeId,
                                    ),
                                    [to]: [
                                        ...target.slice(0, index),
                                        activeId,
                                        ...target.slice(index),
                                    ],
                                },
                            };
                        },
                        undefined,
                        "previewDragOver",
                    ),
                setOverColumn: (overColumn) =>
                    set({ overColumn }, undefined, "setOverColumn"),
                resetDrag: () => set(IDLE_DRAG, undefined, "resetDrag"),
            }),
            {
                name: "board-store",
                enabled: process.env.NODE_ENV === "development",
            },
        ),
    );
}

export type BoardStoreApi = ReturnType<typeof createBoardStore>;
