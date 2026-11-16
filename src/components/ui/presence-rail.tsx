import { cn } from "@/lib/cn";
import { presenceVar } from "@/lib/presence";

export interface PresenceRailProps {
    /**
     * The people attached to whatever this rail sits beside, most-relevant
     * first. One id yields a solid rail; several stack into equal bands.
     */
    userIds: string[];
    /** Rendered horizontally along the top edge instead of down the left. */
    orientation?: "vertical" | "horizontal";
    /** Falls back to a neutral rule when nobody is attached yet. */
    fallback?: boolean;
    className?: string;
}

/**
 * The product's one structural device. A rail always answers "who?" — never
 * status, never category, never decoration. A document touched by three people
 * wears three bands, which is a fact about the document rather than a flourish
 * on it.
 *
 * Purely decorative in the accessibility tree: every surface that uses a rail
 * also names the same people in text.
 */
export function PresenceRail({
    userIds,
    orientation = "vertical",
    fallback = true,
    className,
}: PresenceRailProps) {
    const isVertical = orientation === "vertical";
    const segments = userIds.slice(0, 4);

    if (segments.length === 0 && !fallback) return null;

    return (
        <span
            aria-hidden="true"
            className={cn(
                "flex shrink-0 overflow-hidden",
                isVertical
                    ? "flex-col w-[3px] self-stretch"
                    : "flex-row h-[3px] w-full",
                className,
            )}
        >
            {segments.length === 0 ? (
                <span className="flex-1 bg-brand-border" />
            ) : (
                segments.map((userId) => (
                    <span
                        key={userId}
                        className="flex-1"
                        style={{ backgroundColor: presenceVar(userId) }}
                    />
                ))
            )}
        </span>
    );
}
