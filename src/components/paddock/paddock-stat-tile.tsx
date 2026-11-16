import { cn } from "@/lib/cn";

import { Tag } from "./tag";

export interface PaddockStatTileProps {
    label: string;
    value: string;
    /** Set in the serif beside the figure: "%", "d", "h". */
    unit?: string;
    hint?: string;
    className?: string;
}

/**
 * A headline figure: heavy numerals, serif unit. Server-rendered so the number
 * is there before any chart hydrates. Lifts on hover like the mockup, but is
 * not interactive, so it is not focusable.
 */
export function PaddockStatTile({
    label,
    value,
    unit,
    hint,
    className,
}: PaddockStatTileProps) {
    return (
        <div
            className={cn(
                "paddock-lift flex flex-col gap-1.5 rounded-paddock-card border-[1.5px] border-paddock-rule bg-paddock-sheet px-5.5 pt-5.5 pb-5",
                className,
            )}
        >
            <Tag>{label}</Tag>
            <p className="m-0 mt-1.5 flex items-baseline gap-1">
                <span
                    data-numeric
                    className="paddock-heavy text-[clamp(3rem,7vw,4.5rem)] leading-[0.86]"
                >
                    {value}
                </span>
                {unit ? (
                    <span className="paddock-serif text-[clamp(2rem,4.4vw,2.75rem)] leading-[0.86]">
                        {unit}
                    </span>
                ) : null}
            </p>
            {hint ? (
                <p className="m-0 text-sm text-paddock-subtle">{hint}</p>
            ) : null}
        </div>
    );
}
