import type { AnchorHTMLAttributes } from "react";
import Link, { type LinkProps } from "next/link";

import {
    buttonBaseClasses,
    sizeClasses,
    variantClasses,
} from "@/components/ui/button-styles";
import type { ButtonVariant, Size } from "@/components/ui/types";
import { cn } from "@/lib/cn";

export interface LinkButtonProps
    extends
        Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
        LinkProps {
    variant?: ButtonVariant;
    size?: Size;
}

/** An anchor wearing Button's styles, so navigation and action look identical. */
export function LinkButton({
    className,
    children,
    variant = "primary",
    size = "md",
    ...props
}: LinkButtonProps) {
    return (
        <Link
            className={cn(
                buttonBaseClasses,
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
