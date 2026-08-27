import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface EmptyStateProps {
    title: string;
    description?: string;
    action?: ReactNode;
    icon?: ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    action,
    icon,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-brand-border rounded-brand bg-brand-surface",
                className,
            )}
        >
            {icon && <div className="mb-3 text-brand-subtle">{icon}</div>}
            <h3 className="text-lg font-medium text-brand-ink mb-2">{title}</h3>
            {description && (
                <p className="text-xs font-brand-mono text-brand-subtle max-w-sm mb-6">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}
