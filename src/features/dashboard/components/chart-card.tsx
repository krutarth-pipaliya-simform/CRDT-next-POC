import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface ChartCardProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

/** Consistent frame around every analytics widget. */
export function ChartCard({
    title,
    description,
    action,
    children,
    className,
}: ChartCardProps) {
    return (
        <section
            className={cn(
                "flex flex-col gap-4 p-5 border-2 border-brand-border bg-brand-surface rounded-brand",
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-brand-ink">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-[11px] text-brand-subtle mt-1">
                            {description}
                        </p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            {children}
        </section>
    );
}
