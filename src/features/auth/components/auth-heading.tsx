import { cn } from "@/lib/cn";

export interface AuthHeadingProps {
    /** The light half, in Instrument Serif caps. */
    serif: string;
    /** The weighted half, in heavy wide caps. */
    heavy: string;
    as?: "h1" | "h2";
    align?: "start" | "center";
    className?: string;
}

/**
 * The two-voice heading sized for a 420–560px column. `DisplayHeading`'s
 * sizes are fixed per step and scale with the whole viewport, which overflows
 * a half-width form column ("Create your" at 92px) — so this keeps the same
 * voices with a ceiling that fits. Source text stays as written; the caps are
 * CSS, and the accessible name is "serif heavy".
 */
export function AuthHeading({
    serif,
    heavy,
    as: Element = "h1",
    align = "start",
    className,
}: AuthHeadingProps) {
    return (
        <Element
            className={cn(
                "m-0 leading-[0.84] break-words",
                align === "center" && "text-center",
                className,
            )}
        >
            <span className="paddock-serif block text-[clamp(2.5rem,6vw,5rem)]">
                {serif}
            </span>{" "}
            <span className="paddock-heavy block text-[clamp(2.25rem,5.4vw,4.5rem)]">
                {heavy}
            </span>
        </Element>
    );
}
