import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface PageHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function PageHeader({
    eyebrow,
    title,
    description,
    action,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2 border-brand-muted mb-8 w-full min-w-0",
                className,
            )}
        >
            <div className="min-w-0 flex-1">
                {eyebrow && (
                    <span className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle">
                        {eyebrow}
                    </span>
                )}
                <h1 className="text-3xl font-medium tracking-tight text-brand-ink mt-1">
                    {title}
                </h1>
                {description && (
                    <p className="text-xs font-brand-mono text-brand-subtle mt-1">
                        {description}
                    </p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
