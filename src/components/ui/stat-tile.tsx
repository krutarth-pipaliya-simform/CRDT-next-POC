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
                "flex flex-col gap-1 p-4 border-2 border-brand-border bg-brand-surface rounded-brand",
                className,
            )}
        >
            <span className="font-brand-mono text-[10px] uppercase tracking-widest text-brand-subtle">
                {label}
            </span>
            <span className="text-2xl font-medium text-brand-ink tabular-nums">
                {value}
            </span>
            {hint && (
                <span className="text-[11px] font-brand-mono text-brand-subtle">
                    {hint}
                </span>
            )}
        </div>
    );
}
