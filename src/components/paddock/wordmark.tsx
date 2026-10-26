import { cn } from "@/lib/cn";

export type WordmarkSize = "sm" | "md" | "lg";

export interface WordmarkProps {
    size?: WordmarkSize;
    /** On night grounds the serif half turns lime, the one place lime is text. */
    surface?: "paper" | "night";
    align?: "start" | "center";
    className?: string;
}

const SIZES: Record<WordmarkSize, { serif: string; heavy: string }> = {
    sm: { serif: "text-[1.375rem]", heavy: "text-[1.1875rem]" },
    md: { serif: "text-[1.8125rem]", heavy: "text-[1.5625rem]" },
    lg: { serif: "text-[4rem]", heavy: "text-[3.75rem]" },
};

/**
 * "Con" in the serif over "verge" in the heavy caps — the two voices of
 * every Paddock heading, introduced by the name itself. Screen readers get
 * the word once, not two fragments.
 */
export function Wordmark({
    size = "md",
    surface = "paper",
    align = "start",
    className,
}: WordmarkProps) {
    const { serif, heavy } = SIZES[size];

    return (
        <span
            className={cn(
                "block leading-[0.8]",
                align === "center" && "text-center",
                className,
            )}
        >
            <span className="sr-only">Converge</span>
            <span
                aria-hidden="true"
                className={cn(
                    "paddock-serif block",
                    serif,
                    surface === "night" && "text-paddock-lime",
                )}
            >
                Con
            </span>
            <span
                aria-hidden="true"
                className={cn("paddock-heavy block", heavy)}
            >
                verge
            </span>
        </span>
    );
}
