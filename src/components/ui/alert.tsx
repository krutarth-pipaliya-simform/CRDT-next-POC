import type { HTMLAttributes } from "react";

import type { Intent } from "@/components/ui/types";
import { cn } from "@/lib/cn";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    intent?: Intent;
}

const intentClasses: Record<Intent, string> = {
    default: "border-brand-ink bg-brand-muted text-brand-ink",
    muted: "border-brand-border bg-brand-muted text-brand-subtle",
    danger: "border-brand-danger bg-brand-danger/5 text-brand-danger",
    success: "border-brand-success bg-brand-success/5 text-brand-success",
    warning: "border-brand-warning bg-brand-warning/5 text-brand-warning",
};

export function Alert({
    className,
    intent = "default",
    role = "alert",
    ...props
}: AlertProps) {
    return (
        <div
            role={role}
            className={cn(
                "p-3 border-2 font-brand-mono text-xs uppercase tracking-wider rounded-brand",
                intentClasses[intent],
                className,
            )}
            {...props}
        />
    );
}
