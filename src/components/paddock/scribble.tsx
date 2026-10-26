import { cn } from "@/lib/cn";

import type { CssVariableStyle } from "./paddock-styles";

export type ScribbleShape = "loop" | "underline" | "squiggle";
/**
 * - `load`   draws once after mount (with `delayMs`)
 * - `hover`  draws when the nearest `.group` ancestor is hovered or focused,
 *            and stays drawn under an `aria-current="page"` ancestor
 * - `static` is always drawn
 */
export type ScribbleTrigger = "load" | "hover" | "static";

export interface ScribbleProps {
    shape?: ScribbleShape;
    trigger?: ScribbleTrigger;
    /** `lime` reads on night grounds and as a highlighter on paper; `ink` everywhere. */
    tone?: "lime" | "ink";
    strokeWidth?: number;
    delayMs?: number;
    className?: string;
}

const SHAPES: Record<
    ScribbleShape,
    { viewBox: string; d: string; length: number; preserve?: "none" }
> = {
    loop: {
        viewBox: "0 0 270 100",
        d: "M8 70C40 20 70 10 80 40c10 30-20 50-10 20 15-40 50-45 60-15s40 35 70-15c15-20 40-15 62 10",
        length: 700,
    },
    underline: {
        viewBox: "0 0 100 12",
        d: "M2 8c12-6 22 4 34-1s22-5 32 0 20 4 30-2",
        length: 260,
        preserve: "none",
    },
    squiggle: {
        viewBox: "0 0 240 20",
        d: "M0 10c20-10 40 10 60 0s40-10 60 0 40 10 60 0 40-10 60 0",
        length: 320,
        preserve: "none",
    },
};

/**
 * The hand-drawn lime stroke. Always decorative: it underlines meaning that
 * is already in the text (the current tab, the hero line), never replaces it.
 * Reduced motion shows it fully drawn.
 */
export function Scribble({
    shape = "loop",
    trigger = "load",
    tone = "lime",
    strokeWidth,
    delayMs,
    className,
}: ScribbleProps) {
    const { viewBox, d, length, preserve } = SHAPES[shape];
    const style: CssVariableStyle = {
        "--paddock-scribble-length": String(length),
    };
    if (delayMs !== undefined) {
        style["--paddock-scribble-delay"] = `${delayMs}ms`;
    }

    return (
        <svg
            viewBox={viewBox}
            preserveAspectRatio={preserve ?? "xMidYMid meet"}
            aria-hidden="true"
            focusable="false"
            data-trigger={trigger}
            style={style}
            className={cn(
                "paddock-scribble pointer-events-none overflow-visible",
                tone === "lime" ? "stroke-paddock-lime" : "stroke-paddock-ink",
                className,
            )}
        >
            <path
                d={d}
                strokeWidth={strokeWidth ?? (shape === "loop" ? 7 : 3)}
            />
        </svg>
    );
}
