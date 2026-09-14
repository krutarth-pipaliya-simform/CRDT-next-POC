import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface PageHeaderProps {
    title: string;
    /** One plain sentence about what this page is for. Optional, and usually is. */
    description?: string;
    /** Live context that belongs to the page — a presence cluster, a count. */
    meta?: ReactNode;
    action?: ReactNode;
    className?: string;
}

/**
 * The tracked-caps eyebrow is gone. It labelled every page with the name of
 * the section the person had just clicked, which they already knew, and it
 * gave nine different pages the same silhouette.
 */
export function PageHeader({
    title,
    description,
    meta,
    action,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row sm:items-end justify-between gap-4",
                "pb-4 border-b border-brand-border mb-7 w-full min-w-0",
                className,
            )}
        >
            <div className="min-w-0 flex-1">
                <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.022em] leading-[1.15] text-brand-ink">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-brand-subtle mt-1.5 max-w-[62ch] leading-relaxed">
                        {description}
                    </p>
                )}
                {meta && <div className="mt-2.5">{meta}</div>}
            </div>
            {action && (
                <div className="shrink-0 flex items-center gap-2">{action}</div>
            )}
        </div>
    );
}
