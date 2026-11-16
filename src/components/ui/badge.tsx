import type { HTMLAttributes } from "react";

import type { Intent } from "@/components/ui/types";
import { cn } from "@/lib/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    intent?: Intent;
}

/**
 * Sentence case, not tracked-out caps. A badge is a small fact about the thing
 * it sits beside — "Admin", "Past due", "3 open" — and shouting it in mono
 * made every one of them look equally urgent.
 */
const intentClasses: Record<Intent, string> = {
    default: "bg-brand-muted text-brand-ink border-brand-line",
    muted: "bg-transparent text-brand-subtle border-brand-border",
    danger: "bg-brand-danger/10 text-brand-danger border-brand-danger/40",
    success: "bg-brand-success/10 text-brand-success border-brand-success/40",
    warning: "bg-brand-warning/10 text-brand-warning border-brand-warning/40",
};

export function Badge({ className, intent = "default", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-1.5 py-px",
                "text-[12px] font-medium leading-5",
                "border rounded-brand",
                intentClasses[intent],
                className,
            )}
            {...props}
        />
    );
}
