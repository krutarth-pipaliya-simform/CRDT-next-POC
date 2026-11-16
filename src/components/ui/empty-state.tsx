import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface EmptyStateProps {
    title: string;
    description?: string;
    action?: ReactNode;
    icon?: ReactNode;
    className?: string;
}

/**
 * An empty screen is an invitation to act, so the title is written as the
 * thing that is missing and the action names exactly what happens next.
 */
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
                "flex flex-col items-center justify-center py-16 px-6 text-center",
                "border border-dashed border-brand-border rounded-brand bg-brand-surface/50",
                className,
            )}
        >
            {icon && <div className="mb-4 text-brand-subtle">{icon}</div>}
            <h3 className="text-[17px] font-semibold tracking-[-0.011em] text-brand-ink">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-brand-subtle max-w-[46ch] mt-1.5 mb-6 leading-relaxed">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}
