import {
    closestCenter,
    KeyboardCode,
    type ClientRect,
    type CollisionDetection,
    type KeyboardCoordinateGetter,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import {
    hasSortableData,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { TaskStatus } from "@prisma/client";

import { taskStatusSchema } from "@/schemas/task";

import { COLUMN_ORDER } from "../types";

/** Task ids per column, top to bottom. */
export type ColumnItems = Record<TaskStatus, string[]>;

/** Gap left between positions so a card can later slot in between. */
export const POSITION_GAP = 1024;

export function columnItemsFrom(
    tasks: ReadonlyArray<{ id: string; status: TaskStatus; position: number }>,
): ColumnItems {
    const items: ColumnItems = {
        BACKLOG: [],
        TODO: [],
        IN_PROGRESS: [],
        REVIEW: [],
        DONE: [],
    };
    for (const task of [...tasks].sort((a, b) => a.position - b.position)) {
        items[task.status].push(task.id);
    }
    return items;
}

/** The column an id belongs to: a column's own id is its status. */
export function findColumn(
    items: ColumnItems,
    id: UniqueIdentifier,
): TaskStatus | null {
    const status = taskStatusSchema.safeParse(id);
    if (status.success) return status.data;
    return (
        COLUMN_ORDER.find((column) => items[column].includes(String(id))) ??
        null
    );
}

/** A position that sorts between two neighbours, either of which may be missing. */
export function positionBetween(
    previous: number | undefined,
    next: number | undefined,
): number {
    if (previous !== undefined && next !== undefined) {
        return (previous + next) / 2;
    }
    if (previous !== undefined) return previous + POSITION_GAP;
    if (next !== undefined) return next - POSITION_GAP;
    return POSITION_GAP;
}

type Edges = Pick<ClientRect, "left" | "right" | "top" | "bottom">;

function overlapArea(a: Edges, b: Edges): number {
    const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return width > 0 && height > 0 ? width * height : 0;
}

/**
 * The column under most of the dragged card wins, wherever on the card it was
 * grabbed. Each column counts as a lane the full height of the board, since a
 * short column's well ends well above the longest one. Inside that column the
 * card whose centre is nearest picks the slot, and an empty column is its own
 * target.
 *
 * Built-in strategies get this wrong on a board: `closestCorners` lets the
 * dragged card's own slot and its tall column's far corners skew the result,
 * and `rectIntersection` scores intersection over union, which penalises the
 * column for being large.
 */
export const columnOverlapCollision: CollisionDetection = (args) => {
    const { collisionRect, droppableContainers, droppableRects } = args;

    const lanes = droppableContainers.flatMap((container) => {
        const status = taskStatusSchema.safeParse(container.id);
        const rect = droppableRects.get(container.id);
        return status.success && rect ? [{ status: status.data, rect }] : [];
    });
    const top = Math.min(...lanes.map((lane) => lane.rect.top));
    const bottom = Math.max(...lanes.map((lane) => lane.rect.bottom));

    let column: TaskStatus | null = null;
    let largest = 0;
    for (const { status, rect } of lanes) {
        const area = overlapArea({ ...rect, top, bottom }, collisionRect);
        if (area > largest) {
            largest = area;
            column = status;
        }
    }
    if (!column) return [];

    const cards = droppableContainers.filter(
        (container) =>
            hasSortableData(container) &&
            container.data.current.sortable.containerId === column,
    );
    if (cards.length === 0) return [{ id: column }];

    return closestCenter({ ...args, droppableContainers: cards });
};

/**
 * Left and Right move a card to the neighbouring column at the same height;
 * Up and Down reorder within a column. The library's own getter picks "the
 * next droppable to the right" by left edge, which the tilted drag overlay
 * makes match cards in the same column.
 */
export const boardKeyboardCoordinates: KeyboardCoordinateGetter = (
    event,
    args,
) => {
    const step =
        event.code === KeyboardCode.Right
            ? 1
            : event.code === KeyboardCode.Left
              ? -1
              : 0;
    if (step === 0) return sortableKeyboardCoordinates(event, args);

    event.preventDefault();
    const { active, collisionRect, droppableContainers, droppableRects } =
        args.context;
    if (!active || !collisionRect) return undefined;

    const activeContainer = droppableContainers.get(active.id);
    if (!hasSortableData(activeContainer)) return undefined;
    const current = taskStatusSchema.safeParse(
        activeContainer.data.current.sortable.containerId,
    );
    if (!current.success) return undefined;

    const next = COLUMN_ORDER[COLUMN_ORDER.indexOf(current.data) + step];
    const rect = next ? droppableRects.get(next) : undefined;
    if (!rect) return undefined;

    return {
        x: rect.left + (rect.width - collisionRect.width) / 2,
        y: args.currentCoordinates.y,
    };
};
