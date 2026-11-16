import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface StatTileProps {
    label: string;
    value: ReactNode;
    hint?: string;
    className?: string;
    testId?: string;
}

/** Compact metric tile: a label, one number, and an optional qualifier. */
export function StatTile({
    label,
    value,
    hint,
    className,
    testId,
}: StatTileProps) {
    return (
        <div
            data-testid={testId}
            className={cn(
                "flex flex-col gap-0.5 p-4 border border-brand-border bg-brand-surface rounded-brand",
                className,
            )}
        >
            <span className="text-[13px] text-brand-subtle">{label}</span>
            <span className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-brand-ink tabular-nums">
                {value}
            </span>
            {hint && (
                <span className="text-[13px] text-brand-subtle">{hint}</span>
            )}
        </div>
    );
}
