import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type DisplayHeadingSize = "xl" | "lg" | "md" | "sm";
export type DisplayHeadingElement = "h1" | "h2" | "h3" | "p";

export interface DisplayHeadingProps {
    /** The light half, set in Instrument Serif caps. */
    serif: ReactNode;
    /** The weighted half, set in heavy wide Mona Sans caps. */
    heavy: ReactNode;
    /** Which voice leads. The serif usually sets up; the heavy lands. */
    order?: "serif-first" | "heavy-first";
    /** A third, outlined line, used once on the landing hero. */
    outline?: ReactNode;
    as?: DisplayHeadingElement;
    size?: DisplayHeadingSize;
    /** `inline` sets both voices on one baseline, for compact headers. */
    layout?: "stacked" | "inline";
    /** On night grounds the serif half turns lime. */
    surface?: "paper" | "night";
    align?: "start" | "center";
    /** For `aria-labelledby`, e.g. from a dialog. */
    id?: string;
    className?: string;
}

/** Fluid sizes, so the 120px hero still fits a 320px screen. */
const SIZES: Record<
    DisplayHeadingSize,
    { serif: string; heavy: string; outline: string }
> = {
    xl: {
        serif: "text-[clamp(3rem,10vw,8rem)]",
        heavy: "text-[clamp(2.75rem,9.4vw,7.5rem)]",
        outline: "text-[clamp(1.75rem,5vw,4rem)]",
    },
    lg: {
        serif: "text-[clamp(2.75rem,7.2vw,5.75rem)]",
        heavy: "text-[clamp(2.5rem,6.6vw,5.25rem)]",
        outline: "text-[clamp(1.5rem,4vw,3rem)]",
    },
    md: {
        serif: "text-[clamp(2rem,4.4vw,2.5rem)]",
        heavy: "text-[clamp(1.75rem,3.8vw,2.125rem)]",
        outline: "text-[1.5rem]",
    },
    sm: {
        serif: "text-[1.875rem]",
        heavy: "text-[1.5625rem]",
        outline: "text-[1.25rem]",
    },
};

/**
 * The Paddock heading: two voices stacked tight, serif over heavy.
 *
 * Source text stays in sentence case and is uppercased by CSS, so a screen
 * reader hears "The board", not an acronym. A space separates the halves so
 * the accessible name never runs them together.
 */
export function DisplayHeading({
    serif,
    heavy,
    order = "serif-first",
    outline,
    as: Element = "h2",
    size = "lg",
    layout = "stacked",
    surface = "paper",
    align = "start",
    id,
    className,
}: DisplayHeadingProps) {
    const sizes = SIZES[size];
    const stacked = layout === "stacked";

    const serifPart = (
        <span
            className={cn(
                "paddock-serif",
                stacked && "block",
                sizes.serif,
                surface === "night" && "text-paddock-lime",
            )}
        >
            {serif}
        </span>
    );
    const heavyPart = (
        <span className={cn("paddock-heavy", stacked && "block", sizes.heavy)}>
            {heavy}
        </span>
    );

    return (
        <Element
            id={id}
            className={cn(
                "m-0 break-words",
                stacked
                    ? "leading-[0.84]"
                    : "flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 leading-[0.9]",
                align === "center" && "text-center",
                align === "center" && !stacked && "justify-center",
                className,
            )}
        >
            {order === "serif-first" ? serifPart : heavyPart}{" "}
            {order === "serif-first" ? heavyPart : serifPart}
            {outline ? (
                <>
                    {" "}
                    <span
                        className={cn(
                            "paddock-heavy mt-3.5 block text-transparent",
                            "[-webkit-text-stroke:1.5px_var(--color-paddock-ink)]",
                            sizes.outline,
                        )}
                    >
                        {outline}
                    </span>
                </>
            ) : null}
        </Element>
    );
}
