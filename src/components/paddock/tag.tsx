import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type TagTone = "subtle" | "ink" | "night-subtle" | "lime";
export type TagElement = "span" | "p" | "h2" | "h3" | "h4" | "legend" | "dt";

export interface TagProps {
    children: ReactNode;
    /** `lime` is for night grounds only — lime text never sits on paper. */
    tone?: TagTone;
    as?: TagElement;
    className?: string;
}

const TONES: Record<TagTone, string> = {
    subtle: "text-paddock-subtle",
    ink: "text-paddock-ink",
    "night-subtle": "text-paddock-night-subtle",
    lime: "text-paddock-lime",
};

/**
 * Small uppercase label: eyebrows above headings, field labels, metadata.
 * Write the text in sentence case — the caps are CSS, so assistive tech reads
 * words, not letters.
 */
export function Tag({
    children,
    tone = "subtle",
    as: Element = "span",
    className,
}: TagProps) {
    return (
        <Element
            className={cn(
                "paddock-tag m-0 p-0 text-[0.6875rem] leading-snug",
                TONES[tone],
                className,
            )}
        >
            {children}
        </Element>
    );
}
