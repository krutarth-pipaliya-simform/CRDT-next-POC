import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type NotchedCardTone = "sheet" | "paper" | "night" | "deep";

export interface NotchedCardProps {
    children: ReactNode;
    /** Which corner is cut. The raised part opposite the cut is the tab. */
    notch?: "bottom" | "top";
    tone?: NotchedCardTone;
    /** A short label set in the tab — the raised bottom-right or top-right. */
    tab?: ReactNode;
    as?: "div" | "article" | "section" | "li";
    className?: string;
    bodyClassName?: string;
}

/**
 * The border is drawn as a 1.5px frame of a darker fill behind the clipped
 * body, because `border` would be clipped away along the diagonal.
 */
const FRAME: Record<NotchedCardTone, string> = {
    sheet: "bg-paddock-ink",
    paper: "bg-paddock-ink",
    night: "bg-paddock-night-card",
    deep: "bg-paddock-deep-line",
};

const BODY: Record<NotchedCardTone, string> = {
    sheet: "bg-paddock-sheet text-paddock-ink",
    paper: "bg-paddock-paper text-paddock-ink",
    night: "paddock-night",
    deep: "paddock-deep",
};

const TAB_TONE: Record<NotchedCardTone, string> = {
    sheet: "text-paddock-subtle",
    paper: "text-paddock-subtle",
    night: "text-paddock-lime",
    deep: "text-paddock-lime",
};

/**
 * Paddock's card: a clipped corner instead of a shadow. The bottom notch
 * leaves 28px at the lower left; the top notch drops 18px at the upper left.
 * Body padding reserves that space so content never runs into the cut.
 */
export function NotchedCard({
    children,
    notch = "bottom",
    tone = "sheet",
    tab,
    as: Element = "div",
    className,
    bodyClassName,
}: NotchedCardProps) {
    const clip = notch === "bottom" ? "paddock-notch" : "paddock-notch-top";

    return (
        <Element
            className={cn(
                "relative list-none",
                clip,
                FRAME[tone],
                "p-[1.5px]",
                className,
            )}
        >
            <div
                className={cn(
                    "relative h-full",
                    clip,
                    BODY[tone],
                    notch === "bottom" ? "px-6 pt-6 pb-12" : "px-6 pt-10 pb-6",
                    bodyClassName,
                )}
            >
                {children}
                {tab ? (
                    <span
                        className={cn(
                            "paddock-tag absolute right-4 text-[0.6875rem]",
                            notch === "bottom" ? "bottom-2" : "top-1",
                            TAB_TONE[tone],
                        )}
                    >
                        {tab}
                    </span>
                ) : null}
            </div>
        </Element>
    );
}
