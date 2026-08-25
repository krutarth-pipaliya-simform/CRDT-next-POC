import * as React from "react";
import Link, { LinkProps } from "next/link";
import { cn } from "@/lib/cn";
import type { ButtonVariant, Size } from "@/components/ui/types";
import { variantClasses, sizeClasses } from "@/components/ui/button";

export interface LinkButtonProps
    extends
        Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
        LinkProps {
    variant?: ButtonVariant;
    size?: Size;
    withArrow?: boolean;
}

export function LinkButton({
    className,
    children,
    variant = "primary",
    size = "md",
    withArrow = false,
    ...props
}: LinkButtonProps) {
    return (
        <Link
            className={cn(
                "inline-flex items-center justify-center gap-3",
                "font-brand-mono font-semibold uppercase tracking-widest",
                "rounded-brand transition-colors outline-none cursor-pointer",
                "group",
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        >
            <span>{children}</span>
            {withArrow && variant === "primary" && (
                <span
                    aria-hidden="true"
                    className="opacity-0 -translate-x-1 transition-[opacity,transform] group-hover:opacity-100 group-hover:translate-x-0"
                >
                    →
                </span>
            )}
        </Link>
    );
}
