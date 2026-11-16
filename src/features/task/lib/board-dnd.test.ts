/**
 * @jest-environment jsdom
 */
import type {
    Active,
    ClientRect,
    Collision,
    DroppableContainer,
    KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { KeyboardCode } from "@dnd-kit/core";

import {
    boardKeyboardCoordinates,
    columnItemsFrom,
    columnOverlapCollision,
    findColumn,
    POSITION_GAP,
    positionBetween,
    type ColumnItems,
} from "@/features/task/lib/board-dnd";

const empty = (): ColumnItems => ({
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
});

describe("columnItemsFrom", () => {
    it("groups task ids by status, ordered by position", () => {
        const items = columnItemsFrom([
            { id: "b", status: "TODO", position: 20 },
            { id: "a", status: "TODO", position: 10 },
            { id: "c", status: "DONE", position: 5 },
        ]);
        expect(items.TODO).toEqual(["a", "b"]);
        expect(items.DONE).toEqual(["c"]);
        expect(items.BACKLOG).toEqual([]);
    });

    it("does not mutate its input", () => {
        const tasks = [
            { id: "b", status: "TODO" as const, position: 2 },
            { id: "a", status: "TODO" as const, position: 1 },
        ];
        columnItemsFrom(tasks);
        expect(tasks.map((t) => t.id)).toEqual(["b", "a"]);
    });
});

describe("findColumn", () => {
    const items = { ...empty(), REVIEW: ["x"], DONE: ["y"] };

    it("treats a status id as its own column", () => {
        expect(findColumn(items, "IN_PROGRESS")).toBe("IN_PROGRESS");
    });

    it("finds the column holding a card", () => {
        expect(findColumn(items, "x")).toBe("REVIEW");
        expect(findColumn(items, "y")).toBe("DONE");
    });

    it("returns null for an unknown id", () => {
        expect(findColumn(items, "nope")).toBeNull();
        expect(findColumn(items, 42)).toBeNull();
    });
});

describe("positionBetween", () => {
    it("takes the midpoint between two neighbours", () => {
        expect(positionBetween(10, 20)).toBe(15);
    });

    it("steps a gap past the only neighbour", () => {
        expect(positionBetween(10, undefined)).toBe(10 + POSITION_GAP);
        expect(positionBetween(undefined, 10)).toBe(10 - POSITION_GAP);
    });

    it("starts an empty column at one gap", () => {
        expect(positionBetween(undefined, undefined)).toBe(POSITION_GAP);
    });

    it("treats zero as a real neighbour", () => {
        expect(positionBetween(0, 10)).toBe(5);
    });
});

// ---- dnd-kit fixtures ------------------------------------------------------

function rect(
    left: number,
    top: number,
    width: number,
    height: number,
): ClientRect {
    return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
    };
}

interface FakeContainerInit {
    id: string;
    /** Set for a sortable card: the column it sits in. */
    column?: string;
}

function container({ id, column }: FakeContainerInit): DroppableContainer {
    return {
        id,
        key: id,
        disabled: false,
        node: { current: null },
        rect: { current: null },
        data: {
            current: column
                ? { sortable: { containerId: column, index: 0, items: [] } }
                : undefined,
        },
    };
}

// Five 200px-wide columns, 600px tall, left to right in COLUMN_ORDER.
const COLUMN_IDS = ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const columnRects = new Map<string, ClientRect>(
    COLUMN_IDS.map((id, i) => [id, rect(i * 200, 0, 200, 600)]),
);

function fakeActive(id: string): Active {
    return {
        id,
        data: { current: undefined },
        rect: {
            current: { initial: null, translated: null },
        },
    };
}

describe("columnOverlapCollision", () => {
    const cards = [
        container({ id: "t1", column: "TODO" }),
        container({ id: "t2", column: "TODO" }),
        container({ id: "d1", column: "DONE" }),
    ];
    const droppableContainers = [
        ...COLUMN_IDS.map((id) => container({ id })),
        ...cards,
    ];
    const droppableRects = new Map<string, ClientRect>([
        ...columnRects,
        ["t1", rect(210, 20, 180, 80)],
        ["t2", rect(210, 120, 180, 80)],
        ["d1", rect(810, 20, 180, 80)],
    ]);

    function run(collisionRect: ClientRect, containers = droppableContainers) {
        return columnOverlapCollision({
            active: fakeActive("t1"),
            collisionRect,
            droppableRects,
            droppableContainers: containers,
            pointerCoordinates: null,
        });
    }

    const ids = (hits: Collision[]) => hits.map((hit) => hit.id);

    it("picks the column holding most of the dragged card, then the nearest card", () => {
        // Mostly over TODO (x 200-400), centred near the second card.
        const hits = run(rect(215, 110, 170, 80));
        expect(ids(hits)[0]).toBe("t2");
    });

    it("chooses the column by overlap area, not by where the card was grabbed", () => {
        // 150px over DONE (x 800-1000), 20px over REVIEW.
        const hits = run(rect(780, 300, 170, 80));
        expect(ids(hits)).toEqual(["d1"]);
    });

    it("targets an empty column itself", () => {
        const hits = run(rect(410, 100, 170, 80));
        expect(ids(hits)).toEqual(["IN_PROGRESS"]);
    });

    it("returns no collision when the card is outside every column", () => {
        expect(run(rect(5000, 5000, 100, 100))).toEqual([]);
    });
});

describe("boardKeyboardCoordinates", () => {
    // `KeyboardCoordinateGetter` takes dnd-kit's internal SensorContext, whose
    // droppable map is a private class, so the context is built structurally
    // and passed through one narrow, documented cast.
    function call(
        code: string,
        options: { activeColumn?: string; withRect?: boolean } = {},
    ) {
        const { activeColumn = "TODO", withRect = true } = options;
        const event = new KeyboardEvent("keydown", { code, cancelable: true });
        const containers = new Map([
            ["card", container({ id: "card", column: activeColumn })],
        ]);
        const args = {
            active: "card",
            currentCoordinates: { x: 250, y: 77 },
            context: {
                active: fakeActive("card"),
                collisionRect: withRect ? rect(210, 50, 180, 80) : null,
                droppableRects: columnRects,
                droppableContainers: containers,
            },
        };
        const getter: (
            e: KeyboardEvent,
            a: typeof args,
        ) => ReturnType<KeyboardCoordinateGetter> =
            boardKeyboardCoordinates as never;
        return { event, result: getter(event, args) };
    }

    it("moves a card right to the next column, centred, keeping its height", () => {
        const { event, result } = call(KeyboardCode.Right);
        // IN_PROGRESS spans x 400-600; card is 180 wide -> left 410.
        expect(result).toEqual({ x: 410, y: 77 });
        expect(event.defaultPrevented).toBe(true);
    });

    it("moves a card left", () => {
        expect(call(KeyboardCode.Left).result).toEqual({ x: 10, y: 77 });
    });

    it("stays put at the edges of the board", () => {
        expect(
            call(KeyboardCode.Left, { activeColumn: "BACKLOG" }).result,
        ).toBeUndefined();
        expect(
            call(KeyboardCode.Right, { activeColumn: "DONE" }).result,
        ).toBeUndefined();
    });

    it("does nothing without a measured card rect", () => {
        expect(
            call(KeyboardCode.Right, { withRect: false }).result,
        ).toBeUndefined();
    });

    it("ignores a card that is not sortable", () => {
        const event = new KeyboardEvent("keydown", {
            code: KeyboardCode.Right,
        });
        const args = {
            active: "card",
            currentCoordinates: { x: 0, y: 0 },
            context: {
                active: fakeActive("card"),
                collisionRect: rect(0, 0, 10, 10),
                droppableRects: columnRects,
                droppableContainers: new Map([
                    ["card", container({ id: "card" })],
                ]),
            },
        };
        const getter: (
            e: KeyboardEvent,
            a: typeof args,
        ) => ReturnType<KeyboardCoordinateGetter> =
            boardKeyboardCoordinates as never;
        expect(getter(event, args)).toBeUndefined();
    });
});
