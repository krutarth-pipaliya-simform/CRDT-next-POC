import type { HTMLAttributes } from "react";

import type { Intent } from "@/components/ui/types";
import { cn } from "@/lib/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    intent?: Intent;
}

const intentClasses: Record<Intent, string> = {
    default: "bg-brand-ink text-brand-surface border-brand-ink",
    muted: "bg-brand-muted text-brand-subtle border-brand-border",
    danger: "bg-brand-danger/10 text-brand-danger border-brand-danger",
    success: "bg-brand-success/10 text-brand-success border-brand-success",
    warning: "bg-brand-warning/10 text-brand-warning border-brand-warning",
};

export function Badge({ className, intent = "default", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5",
                "font-brand-mono text-[10px] uppercase tracking-widest",
                "border rounded-brand",
                intentClasses[intent],
                className,
            )}
            {...props}
        />
    );
}
