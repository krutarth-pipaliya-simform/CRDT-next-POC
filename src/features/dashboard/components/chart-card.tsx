import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface ChartCardProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

/**
 * Consistent frame around every analytics widget: a raised card on the
 * analytics night band. Render it inside a `paddock-night` ground.
 */
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
                "flex min-w-0 flex-col gap-3.5 rounded-paddock-card bg-paddock-night-card p-6",
                className,
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="m-0 text-[1.0625rem] font-bold text-paddock-night-fg">
                        {title}
                    </h3>
                    {description ? (
                        <p className="m-0 text-[0.84375rem] text-paddock-night-subtle">
                            {description}
                        </p>
                    ) : null}
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </div>
            {children}
        </section>
    );
}
