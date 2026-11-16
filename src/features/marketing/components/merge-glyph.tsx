import { cn } from "@/lib/cn";

export interface MergeGlyphProps {
    /** Stroke weight in viewBox units; the header mark is heavier than inline uses. */
    strokeWidth?: number;
    className?: string;
}

/**
 * Two lines running into one — the product's idea drawn as a mark. Always
 * decorative, and drawn in `currentColor` so it takes the ink of its ground.
 */
export function MergeGlyph({ strokeWidth = 3.2, className }: MergeGlyphProps) {
    return (
        <svg
            viewBox="0 0 34 34"
            aria-hidden="true"
            focusable="false"
            className={cn("shrink-0", className)}
        >
            <path
                d="M4 8c8 0 12 9 13 9M4 26c8 0 12-9 13-9h13"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
        </svg>
    );
}
