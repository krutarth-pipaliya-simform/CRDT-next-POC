"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import type { ButtonVariant, Size } from "@/components/ui/types";

export interface ButtonProps extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "ref"
> {
    variant?: ButtonVariant;
    size?: Size;
    pendingText?: string;
    withArrow?: boolean;
    ref?: React.Ref<HTMLButtonElement>;
}

export const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "bg-brand-ink text-brand-surface border-2 border-brand-ink hover:bg-brand-accent hover:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2",
    secondary:
        "bg-transparent text-brand-ink border-2 border-brand-ink hover:bg-brand-muted focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2",
    ghost: "bg-transparent text-brand-ink border-2 border-transparent hover:bg-brand-muted hover:border-brand-muted focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2",
    danger: "bg-brand-danger text-brand-surface border-2 border-brand-danger hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-danger focus-visible:ring-offset-2",
};

export const sizeClasses: Record<Size, string> = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
};

export function Button({
    className,
    children,
    variant = "primary",
    size = "md",
    pendingText,
    withArrow = false,
    ref,
    disabled,
    ...props
}: ButtonProps) {
    const { pending } = useFormStatus();
    const isDisabled = pending || disabled;
    const showPending = pending && pendingText;

    return (
        <button
            ref={ref}
            disabled={isDisabled}
            aria-busy={pending}
            className={cn(
                "inline-flex items-center justify-center gap-3",
                "font-brand-mono font-semibold uppercase tracking-widest",
                "rounded-brand transition-colors outline-none",
                "disabled:opacity-60 disabled:cursor-not-allowed group",
                pending && "cursor-wait",
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        >
            <span>{showPending ? pendingText : children}</span>
            {withArrow && variant === "primary" && !pending && (
                <span
                    aria-hidden="true"
                    className="opacity-0 -translate-x-1 transition-[opacity,transform] group-hover:opacity-100 group-hover:translate-x-0"
                >
                    →
                </span>
            )}
        </button>
    );
}
