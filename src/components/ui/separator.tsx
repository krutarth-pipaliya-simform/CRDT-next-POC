import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
    label?: string;
}

export function Separator({ className, label, ...props }: SeparatorProps) {
    if (label) {
        return (
            <div
                role="separator"
                className={cn(
                    "relative h-px w-full bg-brand-muted my-6",
                    className,
                )}
                {...props}
            >
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-brand-surface px-4 font-brand-mono text-[10px] text-brand-subtle uppercase tracking-widest">
                    {label}
                </span>
            </div>
        );
    }
    return (
        <hr
            className={cn(
                "border-0 border-t-2 border-brand-muted w-full my-6",
                className,
            )}
            {...props}
        />
    );
}
