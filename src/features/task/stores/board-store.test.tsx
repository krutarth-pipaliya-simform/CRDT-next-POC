/**
 * @jest-environment jsdom
 */
import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { ColumnItems } from "@/features/task/lib/board-dnd";
import {
    createBoardStore,
    filterTasks,
} from "@/features/task/stores/board-store";
import {
    BoardStoreProvider,
    useBoardStore,
    useBoardStoreApi,
} from "@/features/task/stores/board-store-provider";
import { makeTask } from "@/test/factories";

const items = (overrides: Partial<ColumnItems> = {}): ColumnItems => ({
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
    ...overrides,
});

describe("filterTasks", () => {
    const assignee = {
        id: "m1",
        workspaceId: "w1",
        userId: "u1",
        role: "MEMBER" as const,
        joinedAt: new Date(0),
        user: { id: "u1", name: "Grace Hopper", email: null, image: null },
    };
    const tasks = [
        makeTask({ id: "a", title: "Fix login", description: "OAuth bug" }),
        makeTask({ id: "b", title: "Docs", assignee, assigneeId: "m1" }),
        makeTask({ id: "c", title: "Misc" }),
    ];

    it("returns everything for a blank query", () => {
        expect(filterTasks(tasks, "")).toBe(tasks);
        expect(filterTasks(tasks, "   ")).toBe(tasks);
    });

    it("matches title, description and assignee name case-insensitively", () => {
        expect(filterTasks(tasks, "LOGIN").map((t) => t.id)).toEqual(["a"]);
        expect(filterTasks(tasks, "oauth").map((t) => t.id)).toEqual(["a"]);
        expect(filterTasks(tasks, "hopper").map((t) => t.id)).toEqual(["b"]);
        expect(filterTasks(tasks, "zzz")).toEqual([]);
    });
});

describe("createBoardStore", () => {
    it("starts seeded with no dialogs open and no drag", () => {
        const store = createBoardStore([makeTask()]);
        expect(store.getState()).toMatchObject({
            searchQuery: "",
            selectedTask: null,
            isCreateOpen: false,
            createDefaultStatus: "TODO",
            activeTask: null,
            dragItems: null,
        });
        expect(store.getState().tasks).toHaveLength(1);
    });

    it("adds, updates and removes tasks", () => {
        const store = createBoardStore([makeTask({ id: "a" })]);
        store.getState().addTask(makeTask({ id: "b" }));
        expect(store.getState().tasks.map((t) => t.id)).toEqual(["b", "a"]);

        store.getState().updateTask(makeTask({ id: "a", title: "Renamed" }));
        expect(store.getState().tasks.find((t) => t.id === "a")?.title).toBe(
            "Renamed",
        );

        store.getState().removeTask("b");
        expect(store.getState().tasks.map((t) => t.id)).toEqual(["a"]);

        store.getState().syncTasks([]);
        expect(store.getState().tasks).toEqual([]);
    });

    describe("placeTask / restorePlacement", () => {
        it("moves optimistically and reports the previous placement", () => {
            const store = createBoardStore([
                makeTask({ id: "a", status: "TODO", position: 10 }),
            ]);

            const previous = store.getState().placeTask("a", "DONE", 99);

            expect(previous).toEqual({ status: "TODO", position: 10 });
            expect(store.getState().tasks[0]).toMatchObject({
                status: "DONE",
                position: 99,
            });

            if (previous) store.getState().restorePlacement("a", previous);
            expect(store.getState().tasks[0]).toMatchObject({
                status: "TODO",
                position: 10,
            });
        });

        it("returns null for an unknown task and changes nothing", () => {
            const store = createBoardStore([makeTask({ id: "a" })]);
            expect(store.getState().placeTask("zzz", "DONE", 1)).toBeNull();
            expect(store.getState().tasks[0]?.status).toBe("TODO");
        });
    });

    it("tracks search, the detail dialog and the create dialog", () => {
        const store = createBoardStore([]);
        const task = makeTask();

        store.getState().setSearchQuery("x");
        store.getState().openTask(task);
        store.getState().openCreate("REVIEW");
        expect(store.getState()).toMatchObject({
            searchQuery: "x",
            selectedTask: task,
            isCreateOpen: true,
            createDefaultStatus: "REVIEW",
        });

        store.getState().closeTask();
        store.getState().closeCreate();
        expect(store.getState().selectedTask).toBeNull();
        expect(store.getState().isCreateOpen).toBe(false);
    });

    describe("drag preview", () => {
        const start = () => {
            const task = makeTask({ id: "a", status: "TODO" });
            const store = createBoardStore([task]);
            const layout = items({ TODO: ["a", "b"], DONE: ["c", "d"] });
            store.getState().startDrag(task, layout);
            return store;
        };

        it("remembers where the drag began", () => {
            const store = start();
            expect(store.getState().overColumn).toBe("TODO");
            expect(store.getState().dragStartItems).toBe(
                store.getState().dragItems,
            );
        });

        it("moves the ghost above the card it is over", () => {
            const store = start();
            store.getState().previewDragOver("a", "d", false);
            expect(store.getState().dragItems).toMatchObject({
                TODO: ["b"],
                DONE: ["c", "a", "d"],
            });
        });

        it("moves the ghost below when the pointer is below centre", () => {
            const store = start();
            store.getState().previewDragOver("a", "d", true);
            expect(store.getState().dragItems?.DONE).toEqual(["c", "d", "a"]);
        });

        it("drops into an empty column by its status id", () => {
            const store = start();
            store.getState().previewDragOver("a", "REVIEW", false);
            expect(store.getState().dragItems?.REVIEW).toEqual(["a"]);
            expect(store.getState().dragItems?.TODO).toEqual(["b"]);
        });

        it("ignores a hover inside the same column or over unknown ids", () => {
            const store = start();
            const before = store.getState().dragItems;
            store.getState().previewDragOver("a", "b", true);
            store.getState().previewDragOver("a", "ghost", true);
            store.getState().previewDragOver("ghost", "c", true);
            expect(store.getState().dragItems).toBe(before);
        });

        it("ignores previews when no drag is active", () => {
            const store = createBoardStore([]);
            store.getState().previewDragOver("a", "b", false);
            expect(store.getState().dragItems).toBeNull();
        });

        it("sets the column outline and resets everything on drop", () => {
            const store = start();
            store.getState().setOverColumn("DONE");
            expect(store.getState().overColumn).toBe("DONE");

            store.getState().resetDrag();
            expect(store.getState()).toMatchObject({
                activeTask: null,
                dragItems: null,
                overColumn: null,
                dragStartItems: null,
            });
        });
    });
});

describe("BoardStoreProvider", () => {
    const tasks = [makeTask({ id: "a" })];

    it("exposes a selector hook over the seeded store", () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <BoardStoreProvider initialTasks={tasks}>
                {children}
            </BoardStoreProvider>
        );
        const { result } = renderHook(() => useBoardStore((s) => s.tasks), {
            wrapper,
        });
        expect(result.current).toBe(tasks);
    });

    it("adopts a new server list but not a re-render of the same one", () => {
        function Probe() {
            const api = useBoardStoreApi();
            const count = useBoardStore((s) => s.tasks.length);
            return (
                <button
                    onClick={() =>
                        api.getState().addTask(makeTask({ id: "x" }))
                    }
                >
                    {count}
                </button>
            );
        }
        const tree = (list: typeof tasks) => (
            <BoardStoreProvider initialTasks={list}>
                <Probe />
            </BoardStoreProvider>
        );

        const { rerender } = render(tree(tasks));
        act(() => screen.getByRole("button").click());
        expect(screen.getByRole("button")).toHaveTextContent("2");

        rerender(tree(tasks));
        expect(screen.getByRole("button")).toHaveTextContent("2");

        rerender(
            tree([
                makeTask({ id: "n1" }),
                makeTask({ id: "n2" }),
                makeTask({ id: "n3" }),
            ]),
        );
        expect(screen.getByRole("button")).toHaveTextContent("3");
    });

    it("throws a clear error outside the provider", () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        expect(() => renderHook(() => useBoardStore((s) => s.tasks))).toThrow(
            "useBoardStore must be used within BoardStoreProvider",
        );
        spy.mockRestore();
    });
});
